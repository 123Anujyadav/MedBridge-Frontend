// ============================================
// AI Report Card — Doctor Portal
//
// A compact clinical summary so a doctor can triage the AI Reports list without
// opening every report. All content is bulk-loaded by GET /doctor/reports; the
// card issues no requests of its own.
//
// Fields are rendered only when the backend returned a value — an absent
// allergy list means "not recorded", and printing a placeholder there would be
// indistinguishable from "no allergies", which is a clinically different claim.
//
// Memoised: the list re-renders on every mutation settle, and each card holds
// a fair amount of markup. Handlers are passed as stable callbacks from the
// parent so React.memo actually bites.
// ============================================
import { memo } from "react";
import { StatusBadge, UrgencyBadge } from "@/components/shared/StatusBadge";
import type { DoctorReportCard as CardData } from "@/types/api";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

/** Map a report status onto the StatusBadge variant vocabulary. */
function reportStatusVariant(
  status: string
): "success" | "warning" | "error" | "info" | "neutral" {
  switch (status) {
    case "approved":
    case "ready":
      return "success";
    case "pending":
    case "pending_review":
    case "needs_revision":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
}

const PENDING_STATUSES = ["pending", "pending_review"];

/** A labelled metadata pair. Renders nothing when the value is absent. */
function Meta({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <span className="text-xs text-muted-foreground">
      {label}: <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

/** A labelled chip row. Renders nothing when the list is empty. */
function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

interface Props {
  report: CardData;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestInfo: (id: string) => void;
  onView: (report: CardData) => void;
  busy: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

function AIReportCardBase({
  report,
  onApprove,
  onReject,
  onRequestInfo,
  onView,
  busy,
  selected,
  onToggleSelect,
}: Props) {
  const isPending = PENDING_STATUSES.includes(report.status);

  const counts = [
    report.uploaded_reports_count > 0
      ? `${report.uploaded_reports_count} document(s)`
      : null,
    report.previous_visits_count > 0
      ? `${report.previous_visits_count} previous visit(s)`
      : null,
    report.previous_prescriptions_count > 0
      ? `${report.previous_prescriptions_count} prescription(s)`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-5 transition-all hover:border-primary/30 shadow-card">
      {/* Header: identity + status + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(report.id)}
              aria-label={`Select ${report.title}`}
              className="h-4 w-4 rounded border-border-subtle"
            />
            <h3 className="font-headline text-base font-semibold text-foreground">
              {report.title}
            </h3>
            <StatusBadge variant={reportStatusVariant(report.status)}>
              {report.status}
            </StatusBadge>
            {report.urgency_level && <UrgencyBadge level={report.urgency_level} />}
          </div>
          <p className="text-xs text-muted-foreground">
            Patient: <span className="font-medium text-foreground">{report.patient_name}</span>
            {report.patient_age ? ` · ${report.patient_age}y` : ""}
            {report.patient_gender ? ` · ${report.patient_gender}` : ""}
            {` · ID ${report.patient_short_id}`}
            {` | Date: ${report.date}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <button
                onClick={() => onApprove(report.id)}
                disabled={busy}
                className="flex items-center gap-1 rounded-xl bg-success px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Approve Report
              </button>
              <button
                onClick={() => onReject(report.id)}
                disabled={busy}
                className="flex items-center gap-1 rounded-xl bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
              {/* Maps to the existing needs_revision report status. */}
              <button
                onClick={() => onRequestInfo(report.id)}
                disabled={busy}
                className="flex items-center gap-1 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container disabled:opacity-50"
              >
                <HelpCircle className="h-3.5 w-3.5" /> Request More Information
              </button>
            </>
          ) : (
            <span className="text-xs font-medium text-success flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Reviewed &amp; Approved
            </span>
          )}
          <button
            onClick={() => onView(report)}
            className="rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container"
          >
            View Full AI Analysis
          </button>
        </div>
      </div>

      {/* AI indicators */}
      {report.indicators.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {report.indicators.map((i) => (
            <StatusBadge key={i.label} variant={i.tone} dot>
              {i.label}
            </StatusBadge>
          ))}
        </div>
      )}

      {/* AI summary — the stored one, never regenerated for the list */}
      {report.ai_summary && (
        <p className="mb-3 line-clamp-3 text-sm text-foreground">{report.ai_summary}</p>
      )}

      {/* Chief complaint */}
      {report.chief_complaint && report.chief_complaint !== report.ai_summary && (
        <p className="mb-3 text-xs text-muted-foreground">
          Chief complaint:{" "}
          <span className="font-medium text-foreground">{report.chief_complaint}</span>
        </p>
      )}

      {/* Clinical chips */}
      <div className="space-y-1.5">
        <ChipRow label="Symptoms" items={report.extracted_symptoms} />
        <ChipRow label="Allergies" items={report.allergies} />
        <ChipRow label="Chronic" items={report.chronic_conditions} />
        <ChipRow label="Medications" items={report.current_medications} />
      </div>

      {/* Case metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-subtle pt-3">
        <Meta label="Specialty" value={report.specialty} />
        <Meta label="Case" value={report.case_status} />
        <Meta
          label="AI Confidence"
          value={
            report.ai_confidence
              ? `${report.ai_confidence.percentage}% (${report.ai_confidence.level})`
              : null
          }
        />
        <Meta label="Language" value={report.language_detected} />
        <Meta label="Doctor" value={report.assigned_doctor} />
        <Meta label="Appointment" value={report.appointment_date} />
        <Meta
          label="Case created"
          value={
            report.case_created_at
              ? new Date(report.case_created_at).toLocaleDateString()
              : null
          }
        />
        <Meta
          label="Updated"
          value={
            report.case_updated_at
              ? new Date(report.case_updated_at).toLocaleDateString()
              : null
          }
        />
        {counts.length > 0 && (
          <span className="text-xs text-muted-foreground">{counts.join(" · ")}</span>
        )}
      </div>
    </div>
  );
}

export const AIReportCard = memo(AIReportCardBase);
