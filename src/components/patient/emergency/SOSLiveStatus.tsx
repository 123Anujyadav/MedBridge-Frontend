import { Check, Circle, Loader2, MapPin, Phone, Stethoscope, XCircle } from "lucide-react";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SOS_STAGES, SOS_STATUS_LABELS, stageIndex } from "@/hooks/useSOS";
import type { SOSEmergencyResponse } from "@/types/api";

function when(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString();
}

/**
 * The patient's view of their own emergency: where it has got to, and who has it.
 *
 * Driven entirely by the record the server returns — there is no client-side
 * guessing about progress. The stage rail shows the pipeline; the timeline
 * below it shows what actually happened, including the notes responders left.
 */
export function SOSLiveStatus({
  emergency,
  onCancel,
  isCancelling,
}: {
  emergency: SOSEmergencyResponse;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const cancelled = emergency.status === "cancelled";
  const resolved = emergency.status === "resolved";
  const current = stageIndex(emergency.status);

  return (
    <SectionCard
      title="Emergency Status"
      subtitle={`Raised ${when(emergency.triggered_at)}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge
            variant={cancelled ? "neutral" : resolved ? "success" : "error"}
            dot={!cancelled && !resolved}
          >
            {SOS_STATUS_LABELS[emergency.status] ?? emergency.status}
          </StatusBadge>

          {emergency.is_active && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-error-edge transition-colors hover:bg-error-soft disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {isCancelling ? "Cancelling…" : "Cancel Emergency"}
            </button>
          )}
        </div>

        {/* ── Stage rail ────────────────────────────────── */}
        {cancelled ? (
          <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
            <p className="font-medium text-foreground">This emergency was cancelled.</p>
            {emergency.cancel_reason && (
              <p className="mt-1 text-body-sm text-muted-foreground">
                Reason: {emergency.cancel_reason}
              </p>
            )}
          </div>
        ) : (
          <ol className="space-y-0">
            {SOS_STAGES.map((stage, index) => {
              const done = index < current || (resolved && index <= current);
              const active = index === current && !resolved;
              const last = index === SOS_STAGES.length - 1;
              return (
                <li key={stage.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        done
                          ? "border-success bg-success text-success-foreground"
                          : active
                          ? "border-destructive text-destructive animate-pulse-soft"
                          : "border-border-subtle text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Circle className="h-2.5 w-2.5 fill-current" />
                      )}
                    </span>
                    {!last && (
                      <span
                        className={`w-0.5 flex-1 ${
                          done ? "bg-success" : "bg-border-subtle"
                        }`}
                        style={{ minHeight: "1.75rem" }}
                      />
                    )}
                  </div>
                  <div className={last ? "pb-0" : "pb-6"}>
                    <p
                      className={`font-semibold ${
                        done || active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {active && (
                      <p className="text-body-sm text-muted-foreground">In progress</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* ── Who and where ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-subtle p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" /> Assigned clinician
            </div>
            <p className="font-medium text-foreground">
              {emergency.assigned_doctor_name || "Awaiting assignment"}
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> Emergency contact
            </div>
            <p className="font-medium text-foreground">
              {emergency.contact_name || "—"}
              {emergency.contact_phone ? ` · ${emergency.contact_phone}` : ""}
            </p>
          </div>
        </div>

        {emergency.maps_url && (
          <a
            href={emergency.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low"
          >
            <MapPin className="h-3.5 w-3.5" /> Location shared with responders
          </a>
        )}

        {/* ── Timeline ──────────────────────────────────── */}
        {emergency.timeline.length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Timeline</h4>
            <ul className="space-y-2">
              {emergency.timeline.map((entry, i) => (
                <li
                  key={`${entry.status}-${entry.created_at ?? i}`}
                  className="rounded-lg bg-surface-container-low p-3 text-body-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {SOS_STATUS_LABELS[entry.status] ?? entry.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {when(entry.created_at)}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-muted-foreground">{entry.note}</p>
                  )}
                  {entry.actor_name && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.actor_name}
                      {entry.actor_role ? ` (${entry.actor_role})` : ""}
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
