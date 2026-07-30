import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Phone, MessageSquare, MessageCircle, Building2, MapPin, Loader2,
  CheckCircle2, XCircle, MinusCircle, Clock, ExternalLink,
} from "lucide-react";
import {
  COMMS_CHANNEL_LABELS,
  COMMS_ROLE_LABELS,
  COMMS_STATUS_LABELS,
  useSOSCommunications,
  useSOSHospital,
  useSOSTimeline,
} from "@/hooks/useSOS";
import type { CommunicationStatus, SOSCommunicationEntry } from "@/types/api";

function when(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleTimeString();
}

const CHANNEL_ICON = {
  voice: Phone,
  sms: MessageSquare,
  whatsapp: MessageCircle,
} as const;

function statusVisual(status: CommunicationStatus) {
  switch (status) {
    case "sent":
    case "delivered":
      return { icon: CheckCircle2, tone: "success" as const };
    // A carrier refused it, or it was withdrawn. Both are the message *not*
    // arriving, and must not wear the pending clock the default branch gives —
    // that would read as "still on its way" for something that never will be.
    case "undelivered":
    case "failed":
      return { icon: XCircle, tone: "error" as const };
    case "canceled":
    case "skipped":
      return { icon: MinusCircle, tone: "neutral" as const };
    case "sending":
      return { icon: Loader2, tone: "warning" as const, spin: true };
    // `accepted` and `queued` fall through: genuinely still in progress.
    default:
      return { icon: Clock, tone: "warning" as const };
  }
}

function CommunicationRow({ entry }: { entry: SOSCommunicationEntry }) {
  const ChannelIcon = CHANNEL_ICON[entry.channel] ?? Phone;
  const visual = statusVisual(entry.status);
  const StatusIcon = visual.icon;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ChannelIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-foreground">
            {COMMS_CHANNEL_LABELS[entry.channel] ?? entry.channel} ·{" "}
            {COMMS_ROLE_LABELS[entry.recipient_role] ?? entry.recipient_role}
          </p>
          <StatusBadge variant={visual.tone}>
            <StatusIcon
              className={`mr-1 h-3 w-3 ${visual.spin ? "animate-spin" : ""}`}
            />
            {COMMS_STATUS_LABELS[entry.status] ?? entry.status}
          </StatusBadge>
        </div>

        <p className="text-body-sm text-muted-foreground">
          {entry.recipient_name || "—"}
          {entry.recipient_phone_masked ? ` · ${entry.recipient_phone_masked}` : ""}
        </p>

        {/* A skipped or failed attempt says why. "No number on record" and
            "WhatsApp not configured" need different action from whoever is
            reading, so the reason is shown rather than a generic failure. */}
        {(entry.status === "failed" || entry.status === "skipped") &&
          entry.error_message && (
            <p className="mt-1 text-xs text-muted-foreground">{entry.error_message}</p>
          )}

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {entry.attempts > 1 && <span>{entry.attempts} attempts</span>}
          {entry.next_attempt_at && entry.status === "queued" && (
            <span>Retrying at {when(entry.next_attempt_at)}</span>
          )}
          {entry.sent_at && <span>Sent {when(entry.sent_at)}</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * What the platform did to reach people about this emergency.
 *
 * Reads three backend endpoints and never talks to Twilio or Google directly —
 * the credentials stay server-side and the browser only ever sees the
 * platform's own API, so a change of vendor is invisible here.
 *
 * Kept current by the WebSocket rather than a timer: the backend pushes
 * `EMERGENCY_COMMS_UPDATED` as each call and message is queued, sent, retried
 * or fails.
 */
export function SOSCommunicationPanel({ emergencyId }: { emergencyId: string }) {
  const { data: comms, isLoading } = useSOSCommunications(emergencyId);
  const { data: hospital } = useSOSHospital(emergencyId);
  const { data: timeline } = useSOSTimeline(emergencyId);

  const entries = comms?.communications ?? [];
  const inFlight = entries.some((e) => e.status === "queued" || e.status === "sending");

  return (
    <SectionCard
      title="Emergency Notifications"
      subtitle={
        inFlight
          ? "Contacting your emergency contact, doctor and admin…"
          : "Who has been notified about this emergency"
      }
    >
      <div className="space-y-5">
        {/* ── Nearest hospital ─────────────────────────── */}
        <div className="rounded-xl border border-border-subtle p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-foreground">Nearest Hospital</h4>
          </div>

          {hospital?.available ? (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{hospital.hospital_name}</p>
              <p className="text-body-sm text-muted-foreground">
                {hospital.distance_km != null && `${hospital.distance_km} km away`}
                {hospital.eta_minutes != null && ` · about ${hospital.eta_minutes} min`}
              </p>
              {hospital.directions_url && (
                <a
                  href={hospital.directions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container-low"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Directions
                </a>
              )}
            </div>
          ) : (
            // Never a placeholder hospital. An invented address on an emergency
            // screen is somewhere an ambulance gets sent.
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-body-sm text-muted-foreground">
                {hospital?.reason ??
                  "No nearby hospital has been identified for this emergency."}
              </p>
            </div>
          )}
        </div>

        {/* ── Communication log ────────────────────────── */}
        <div>
          <h4 className="mb-2 font-semibold text-foreground">Notifications</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-surface-container-low"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              No notifications have been raised for this emergency yet.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <CommunicationRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        {/* ── Merged timeline ──────────────────────────── */}
        {timeline && timeline.entries.length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Full Timeline</h4>
            <ul className="space-y-2">
              {timeline.entries.map((item, i) => (
                <li
                  key={`${item.key}-${item.at ?? i}`}
                  className="rounded-lg bg-surface-container-low p-3 text-body-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {when(item.at)}
                    </span>
                  </div>
                  {item.detail && (
                    <p className="mt-0.5 text-muted-foreground">{item.detail}</p>
                  )}
                  {item.actor_name && item.kind === "status" && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.actor_name}
                      {item.actor_role ? ` (${item.actor_role})` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
