import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  FileSearch,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { VERDICT_LABELS } from "@/types/prescription";
import type { RxFinding, RxVerdict, RxVerification } from "@/types/prescription";

interface SafetyPanelProps {
  verification: RxVerification | null | undefined;
  onRun: () => void;
  isRunning: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  drug_interaction: "Drug interaction",
  duplicate_therapy: "Duplicate medicine",
  contraindication: "Contraindication",
  max_dosage: "Dosage",
  allergy: "Allergy",
  renal: "Kidney",
  hepatic: "Liver",
  pregnancy: "Pregnancy",
  elderly: "Older adults",
  food_interaction: "Food interaction",
};

/**
 * `unknown` deliberately maps to a warning tone, not a neutral one.
 *
 * "Not checked" must never read as reassurance — a grey chip alongside a green
 * one is exactly how a patient concludes their prescription was cleared when
 * nothing was actually examined.
 */
const VERDICT_TONE: Record<RxVerdict, "success" | "warning" | "error" | "neutral"> = {
  safe: "success",
  warning: "warning",
  critical: "error",
  unknown: "warning",
};

const VERDICT_ICON: Record<RxVerdict, typeof ShieldCheck> = {
  safe: ShieldCheck,
  warning: ShieldAlert,
  critical: ShieldAlert,
  unknown: ShieldQuestion,
};

function FindingRow({ finding }: { finding: RxFinding }) {
  const [open, setOpen] = useState(false);
  const tone = VERDICT_TONE[finding.severity];

  return (
    <div className="rounded-xl border border-border-subtle">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={tone}>
              {CATEGORY_LABELS[finding.category] ?? finding.category}
            </StatusBadge>
            <span className="text-body-sm font-semibold text-foreground">
              {finding.title}
            </span>
          </div>
          {finding.medications_involved.length > 0 && (
            <p className="mt-1 text-body-sm text-muted-foreground">
              {finding.medications_involved.join(", ")}
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border-subtle p-4 pt-3">
          {finding.detail && (
            <p className="text-body-sm text-foreground">{finding.detail}</p>
          )}
          {finding.recommendation && (
            <p className="mt-2 rounded-lg bg-surface-container-low p-3 text-body-sm text-foreground">
              <span className="font-semibold">Suggested: </span>
              {finding.recommendation}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-body-sm text-muted-foreground">
            <span>Confidence {Math.round(finding.confidence * 100)}%</span>
            <span>·</span>
            <span>Source: {finding.source || "unknown"}</span>
          </div>

          {finding.evidence.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Evidence
              </p>
              {finding.evidence.map((item, index) => (
                <blockquote
                  key={index}
                  className="rounded-lg border-l-2 border-primary bg-surface-container-low p-3 text-body-sm text-foreground"
                >
                  <p className="italic">&ldquo;{item.excerpt}&rdquo;</p>
                  <p className="mt-1.5 text-muted-foreground">
                    {item.source} · {item.section}
                    {item.reference && (
                      <>
                        {" · "}
                        <a
                          href={item.reference}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline hover:text-primary"
                        >
                          source record
                        </a>
                      </>
                    )}
                  </p>
                </blockquote>
              ))}
            </div>
          ) : (
            // Badged explicitly. A finding with no source document is the model's
            // own assertion, and the reader is entitled to know which is which.
            <p className="mt-3 flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              No source document — generated from the prescription itself.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The AI safety review.
 *
 * Advisory throughout: this panel annotates the prescription and offers no
 * control that could alter it.
 */
export function SafetyPanel({ verification, onRun, isRunning }: SafetyPanelProps) {
  if (!verification) {
    return (
      <div className="rounded-xl border border-border-subtle p-6 text-center">
        <FileSearch className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-body-sm text-muted-foreground">
          This prescription has not been checked yet.
        </p>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
        >
          {isRunning && <RefreshCw className="h-4 w-4 animate-spin" />}
          {isRunning ? "Checking…" : "Run safety check"}
        </button>
      </div>
    );
  }

  const Icon = VERDICT_ICON[verification.verdict];
  const tone = VERDICT_TONE[verification.verdict];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-surface-container-low p-4">
        <div className="flex items-start gap-3">
          <Icon
            className={`h-8 w-8 ${
              tone === "success"
                ? "text-success"
                : tone === "error"
                  ? "text-error-edge"
                  : "text-warning"
            }`}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-headline text-headline-md text-foreground">
                {VERDICT_LABELS[verification.verdict]}
              </span>
              <StatusBadge variant={tone} dot>
                {verification.status}
              </StatusBadge>
            </div>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Confidence {Math.round(verification.confidence * 100)}% ·{" "}
              {verification.checked_medication_count} medicine(s) checked
              {verification.sources_used.length > 0 && (
                <> · {verification.sources_used.join(", ")}</>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
          Re-check
        </button>
      </div>

      {verification.summary && (
        <p className="text-body-sm text-foreground">{verification.summary}</p>
      )}

      {verification.unchecked_medications.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-warning-soft p-4 text-body-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">Not checked: </span>
            {verification.unchecked_medications.join(", ")}. These still need a
            manual review — they have not been cleared.
          </span>
        </div>
      )}

      {verification.findings.length > 0 ? (
        <div className="space-y-2">
          {verification.findings.map((finding) => (
            <FindingRow key={finding.id} finding={finding} />
          ))}
        </div>
      ) : (
        <p className="text-body-sm text-muted-foreground">
          No issues were found in the drug labels that were checked.
        </p>
      )}

      <p className="text-body-sm text-muted-foreground">
        This review is guidance only. It does not change your prescription, which
        stands exactly as your doctor issued it.
      </p>
    </div>
  );
}
