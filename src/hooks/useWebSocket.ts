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

export function useWebSocket() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (wsRef.current) {
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
        console.log("🟢 WebSocket connection established.");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("⚡ Real-time WebSocket event received:", data);

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
        console.log("🔴 WebSocket closed. Reconnecting in 5s...");
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isAuthenticated) {
            connect();
          }
        }, 5000);
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, user, queryClient]);
}
