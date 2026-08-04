import { useState } from "react";
import { AlertTriangle, BadgeCheck, Building2, FileText, Pill } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { useToast } from "@/hooks/use-toast";
import { usePrescriptionPack, useReviewPrescription } from "@/hooks/usePharmacyPortal";
import type { ReviewOutcome } from "@/types/pharmacy-portal";

const VERDICT_TONE: Record<string, "success" | "warning" | "error" | "neutral"> = {
  safe: "success",
  warning: "warning",
  critical: "error",
  // "Not checked" is deliberately a warning, never neutral — a grey chip next
  // to a green one is how a pharmacist concludes a prescription was cleared
  // when nothing was actually examined.
  unknown: "warning",
};

const OUTCOMES: { value: ReviewOutcome; label: string; tone: string }[] = [
  {
    value: "approved",
    label: "Approve dispensing",
    tone: "rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60",
  },
  {
    value: "clarification_requested",
    label: "Request clarification",
    tone: "rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60",
  },
  {
    value: "rejected",
    label: "Refuse to dispense",
    tone: "rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground transition-all hover:bg-error-soft hover:text-error-edge disabled:opacity-60",
  },
];

/**
 * The counter's pre-dispensing check.
 *
 * Everything shown is read-only: the prescriber snapshot, the medicines as
 * written, the AI safety review with its cited evidence, the patient's recorded
 * allergies and any expired batch this store would hand over. A pharmacist may
 * approve, query or refuse — never edit.
 */
export function PrescriptionReviewPanel({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  const { data: pack, isLoading, isError, error, refetch } = usePrescriptionPack(orderId);
  const review = useReviewPrescription();
  const [note, setNote] = useState("");

  if (isLoading) return <LoadingState rows={3} />;
  if (isError || !pack) {
    return (
      <ErrorState
        title="Could not load the prescription"
        description={(error as Error)?.message ?? "The dispensing pack is unavailable."}
        onRetry={refetch}
      />
    );
  }

  const submit = async (outcome: ReviewOutcome) => {
    if (outcome !== "approved" && !note.trim()) {
      toast({
        variant: "destructive",
        title: "A note is required",
        description: "Record why you are querying or refusing this prescription.",
      });
      return;
    }
    try {
      await review.mutateAsync({ orderId, outcome, note: note.trim() });
      setNote("");
      toast({
        title:
          outcome === "approved"
            ? "Dispensing approved"
            : outcome === "rejected"
              ? "Prescription refused"
              : "Clarification requested",
        description: "Recorded against the order. The prescription is unchanged.",
      });
    } catch (submitError) {
      toast({
        variant: "destructive",
        title: "Could not record the decision",
        description:
          (submitError as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "The action was refused.",
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-surface-container-low p-4">
        <div className="flex items-start gap-4">
          <UserAvatar
            avatarUrl={pack.prescriber.avatar_url}
            name={pack.prescriber.doctor_name}
            className="h-14 w-14 rounded-2xl text-headline-md"
          />
          <div>
            <p className="font-semibold text-foreground">{pack.prescriber.doctor_name}</p>
            {pack.prescriber.qualification && (
              <p className="text-body-sm text-muted-foreground">
                {pack.prescriber.qualification}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
              {pack.prescriber.specialty && <span>{pack.prescriber.specialty}</span>}
              {pack.prescriber.hospital && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {pack.prescriber.hospital}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Reg. {pack.prescriber.registration_number ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pack.signed_at ? (
            <StatusBadge variant="success" dot>
              Signed
            </StatusBadge>
          ) : (
            <StatusBadge variant="warning" dot>
              Not signed
            </StatusBadge>
          )}
          {pack.pdf_url && (
            <a
              href={pack.pdf_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <FileText className="h-4 w-4" />
              Prescription
            </a>
          )}
        </div>
      </div>

      {pack.patient_allergies.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-error-soft p-4 text-body-sm text-error-edge">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">Recorded allergies: </span>
            {pack.patient_allergies.join(", ")}
          </span>
        </div>
      )}

      {pack.expiry_alerts.length > 0 && (
        <div className="rounded-xl bg-warning-soft p-4 text-body-sm text-warning">
          <p className="font-semibold">Batch expiry warnings</p>
          <ul className="mt-1 space-y-0.5">
            {pack.expiry_alerts.map((alert, index) => (
              <li key={index}>
                {alert.medicine_name} — batch {alert.batch_number ?? "—"} (
                {alert.state.replace("_", " ")}
                {alert.expiry_date && `, ${new Date(alert.expiry_date).toLocaleDateString()}`})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Prescribed ({pack.diagnosis})
        </p>
        <div className="mt-2 space-y-2">
          {pack.medications.map((med, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-border-subtle p-3"
            >
              <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  {med.name}
                  {med.strength && <span className="text-primary"> {med.strength}</span>}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {med.dosage} · {med.frequency} · {med.duration}
                  {med.quantity ? ` · qty ${med.quantity}` : ""}
                </p>
                {med.special_instructions && (
                  <p className="text-body-sm text-foreground">{med.special_instructions}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pack.verification ? (
        <div className="rounded-xl border border-border-subtle p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">AI safety review</span>
            <StatusBadge variant={VERDICT_TONE[pack.verification.verdict] ?? "warning"} dot>
              {pack.verification.verdict}
            </StatusBadge>
            <span className="text-body-sm text-muted-foreground">
              {Math.round(pack.verification.confidence * 100)}% confidence
            </span>
          </div>

          {pack.verification.summary && (
            <p className="mt-2 text-body-sm text-foreground">{pack.verification.summary}</p>
          )}

          {pack.verification.unchecked_medications.length > 0 && (
            <p className="mt-2 rounded-lg bg-warning-soft p-3 text-body-sm text-warning">
              Not checked: {pack.verification.unchecked_medications.join(", ")} — these have
              not been cleared and need your judgement.
            </p>
          )}

          {pack.verification.findings.length > 0 && (
            <div className="mt-3 space-y-2">
              {pack.verification.findings.map((finding, index) => (
                <div key={index} className="rounded-lg border border-border-subtle p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge variant={VERDICT_TONE[finding.severity] ?? "warning"}>
                      {finding.category.replace(/_/g, " ")}
                    </StatusBadge>
                    <span className="text-body-sm font-semibold text-foreground">
                      {finding.title}
                    </span>
                  </div>
                  {finding.detail && (
                    <p className="mt-1 text-body-sm text-muted-foreground">{finding.detail}</p>
                  )}
                  {finding.evidence.length === 0 && (
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      No source document — model-generated.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-xl bg-warning-soft p-4 text-body-sm text-warning">
          No AI safety review exists for this prescription. It has not been checked.
        </p>
      )}

      <div className="border-t border-border-subtle pt-4">
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Pharmacist note (required to query or refuse)"
          className="w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          {OUTCOMES.map((outcome) => (
            <button
              key={outcome.value}
              type="button"
              disabled={review.isPending}
              onClick={() => submit(outcome.value)}
              className={outcome.tone}
            >
              {outcome.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Your decision is recorded against this order. The prescription itself is never
          altered.
        </p>
      </div>
    </div>
  );
}
