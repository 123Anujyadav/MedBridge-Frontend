// ============================================
// useWebSocket — MedBridge Platform
// Live bi-directional real-time data sync hook
// Invalidates React Query caches on WS events
// ============================================
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken, getWebSocketUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PATIENT_KEYS } from "@/hooks/usePatient";
import { DOCTOR_KEYS } from "@/hooks/useDoctor";
import { ADMIN_KEYS } from "@/hooks/useAdmin";
import { SOS_KEYS } from "@/hooks/useSOS";

/**
 * Development-only logging.
 *
 * `import.meta.env.DEV` is replaced by a literal at build time, so these calls
 * — and the patient data they would have printed — are removed from production
 * bundles entirely rather than merely being quiet.
 */
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log("[ws]", ...args);
  }
}

export function useWebSocket() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Set when this effect is tearing its own socket down.
   *
   * `close()` fires `onclose` asynchronously, *after* the cleanup function has
   * already returned. The cleanup cleared the reconnect timer and then closed
   * the socket, so the handler scheduled a fresh reconnect against a timer
   * nobody was holding any more — and that reconnect ran with the token
   * captured in the old closure. On sign-out that meant the tab quietly
   * reopened an authenticated socket for the user who had just left, five
   * seconds later, with no component mounted to own it.
   */
  const closingRef = useRef(false);

  useEffect(() => {
    closingRef.current = false;

    if (!isAuthenticated || !user) {
      if (wsRef.current) {
        closingRef.current = true;
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    function connect() {
      const wsUrl = `${getWebSocketUrl()}?token=${encodeURIComponent(token!)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        debugLog("WebSocket connection established.");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // The payload only ever names the event type in production. Frames
          // on this socket carry SOS alerts, order contents and appointment
          // details, and the browser console is not a place to put those.
          debugLog("Real-time event received:", data);

          // Trigger React Query Cache Invalidations for immediate live updates
          if (
            data.type === "APPOINTMENT_CREATED" ||
            data.type === "APPOINTMENT_STATUS_UPDATED" ||
            data.type === "CONSULTATION_COMPLETED"
          ) {
            queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
            queryClient.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
            queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all });
          }

          if (data.type === "USER_DELETED" || data.type === "USER_STATUS_UPDATED") {
            queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all });
          }

          // SOS emergencies. This is why no screen in the workflow polls:
          // the patient's live status, the clinician queue and the admin queue
          // all read from these keys, and the server pushes on every change.
          //
          // The socket only delivers what the recipient is entitled to — the
          // patient's own emergency over their private channel, and the
          // clinician/administrator queues as role broadcasts — so arrival is
          // enough; nothing here has to decide whether the event is "ours".
          // Phase 3: the communication fan-out reports its own progress, so
          // the emergency page follows calls and messages live rather than
          // polling for them.
          if (data.type === "EMERGENCY_COMMS_UPDATED") {
            queryClient.invalidateQueries({ queryKey: SOS_KEYS.all });
          }

          if (
            data.type === "EMERGENCY_SOS_CREATED" ||
            data.type === "EMERGENCY_SOS_UPDATED"
          ) {
            queryClient.invalidateQueries({ queryKey: SOS_KEYS.all });
            // The admin overview's "active emergencies" tile counts the same
            // rows, so it has to move at the same moment.
            queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard() });

            if (
              data.type === "EMERGENCY_SOS_CREATED" &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification("Emergency SOS raised", {
                  body: `${data.patient_name ?? "A patient"} needs assistance.`,
                  tag: `sos-${data.id}`,
                });
              } catch {
                /* Desktop notifications are best-effort. */
              }
            }
          }

          // Notifications are pushed to one user, so arrival alone means it is
          // ours. Refreshing the cache is all that is needed — the centre and
          // the unread badge both read from it, which is why no polling
          // interval is configured for either.
          if (data.type === "NOTIFICATION_CREATED") {
            queryClient.invalidateQueries({ queryKey: [...DOCTOR_KEYS.all, "notifications"] });
            queryClient.invalidateQueries({ queryKey: ["shared", "unread-count"] });
            queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });

            // A critical alert may warrant a desktop notification, but only
            // where the doctor already granted permission. Nothing is
            // requested here: interrupting an active consultation with a
            // permission prompt is worse than a missed toast.
            if (
              data.priority === "critical" &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification(data.title ?? "Critical clinical alert", {
                  body: data.message ?? "",
                  tag: data.notification_id,
                });
              } catch {
                /* Desktop notifications are best-effort. */
              }
            }
          }
        } catch (e) {
          console.warn("Could not parse WebSocket message:", event.data);
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };

      ws.onclose = () => {
        // A close we asked for is not a dropped connection, and must not be
        // followed by a reconnect.
        if (closingRef.current) return;

        debugLog("WebSocket closed. Reconnecting in 5s...");
        reconnectTimeoutRef.current = setTimeout(() => {
          // Re-checked at fire time rather than trusting the value captured
          // when the timer was set — five seconds is long enough for the
          // session to have ended.
          if (!closingRef.current && getAccessToken()) {
            connect();
          }
        }, 5000);
      };
    }

    connect();

    return () => {
      // Flag first: closing the socket triggers `onclose`, which would
      // otherwise schedule a reconnect after this cleanup has finished.
      closingRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isAuthenticated, user, queryClient]);
}
