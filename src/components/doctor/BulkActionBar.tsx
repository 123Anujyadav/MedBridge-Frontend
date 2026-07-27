// ============================================
// Bulk Action Bar — AI Reports, Doctor Portal
//
// Appears only when a selection exists, so the page is unchanged until the
// doctor opts in. Confirmation is required before anything executes, and
// reject/archive additionally require a reason that lands in the audit trail.
//
// Built from existing tokens only: the same rounded-xl/border-border-subtle
// blocks, button classes and StatusBadge used across the portal, plus the
// shared ConfirmationDialog for destructive steps.
// ============================================
import { useState, useCallback, useEffect } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBulkReportAction, useBulkJob, useSelectAllMatching } from "@/hooks/useDoctor";
import { useToast } from "@/hooks/use-toast";
import doctorService from "@/lib/doctor-service";
import type {
  BulkJobStatus,
  BulkReportAction,
  DoctorReportCard,
  ReportListFilters,
} from "@/types/api";
import { X } from "lucide-react";

/** Actions the doctor can apply to a selection, with their confirmation copy. */
const ACTIONS: {
  id: BulkReportAction;
  label: string;
  verb: string;
  needsReason?: boolean;
  destructive?: boolean;
}[] = [
  { id: "approve", label: "Approve", verb: "Approve", destructive: true },
  { id: "reject", label: "Reject", verb: "Reject", needsReason: true, destructive: true },
  { id: "assign_specialist", label: "Assign Specialist", verb: "Assign", destructive: true },
  { id: "flag_follow_up", label: "Mark for Follow-up", verb: "Flag" },
  { id: "archive", label: "Archive", verb: "Archive", needsReason: true, destructive: true },
  { id: "mark_reviewed", label: "Mark Reviewed", verb: "Mark reviewed" },
  { id: "remove_review_flag", label: "Remove Review Flag", verb: "Return to review" },
];

const inputClass = "w-full rounded-xl border border-border-subtle bg-card p-3 text-sm";
const chipBtn =
  "rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container disabled:opacity-50";
const primaryBtn =
  "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50";

interface Props {
  selectedIds: string[];
  pageIds: string[];
  filters: ReportListFilters;
  pageIsFull: boolean;
  /** True when the page is at its limit, so more may match the filters. */
  onSelectionChange: (ids: string[]) => void;
  onClear: () => void;
}

export function BulkActionBar({
  selectedIds,
  pageIds,
  filters,
  pageIsFull,
  onSelectionChange,
  onClear,
}: Props) {
  const { toast } = useToast();
  const bulkMutation = useBulkReportAction();
  const selectAllMatching = useSelectAllMatching();

  const [pending, setPending] = useState<BulkReportAction | null>(null);
  const [reason, setReason] = useState("");
  const [targetDoctor, setTargetDoctor] = useState("");
  const [specialistQuery, setSpecialistQuery] = useState("");
  const [specialists, setSpecialists] = useState<{ id: string; label: string }[]>([]);
  const [job, setJob] = useState<BulkJobStatus | null>(null);
  const [exporting, setExporting] = useState(false);

  // Only poll while the backend says the batch is still running.
  const polling = !!job && job.status !== "completed";
  const { data: polled } = useBulkJob(job?.job_id ?? null, polling);
  const live = polled ?? job;

  // A queued batch that has since finished should stop polling and release the
  // selection. Done in an effect — setting state during render loops.
  useEffect(() => {
    if (polled?.status === "completed" && job && job.status !== "completed") {
      setJob(polled);
      onClear();
      toast({ title: "Batch Complete", description: polled.message });
    }
  }, [polled, job, onClear, toast]);

  const count = selectedIds.length;
  const config = ACTIONS.find((a) => a.id === pending);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  // Offered only when the page is full, so more could match. The total is
  // resolved on click rather than eagerly — a count nobody asked for is a
  // request nobody needed.
  const canSelectMatching = allPageSelected && pageIsFull;

  const handleSelectMatching = useCallback(async () => {
    try {
      const res = await selectAllMatching.mutateAsync(filters);
      onSelectionChange(res.report_ids);
      toast({
        title: "Selection Extended",
        description: `${res.total} report(s) matching the current filters are selected.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Selection Failed",
        description: "Could not resolve the full matching set.",
      });
    }
  }, [filters, onSelectionChange, selectAllMatching, toast]);

  const handleExport = useCallback(
    async (format: "csv" | "pdf") => {
      setExporting(true);
      try {
        const { blob, filename, skipped } = await doctorService.exportReports(
          selectedIds,
          format
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        toast({
          title: "Export Ready",
          description:
            skipped > 0
              ? `${filename} downloaded. ${skipped} report(s) had no stored PDF.`
              : `${filename} downloaded.`,
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: "Could not export the selected reports.",
        });
      } finally {
        setExporting(false);
      }
    },
    [selectedIds, toast]
  );

  const searchSpecialists = useCallback(async () => {
    try {
      setSpecialists(await doctorService.searchSpecialists(specialistQuery));
    } catch {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Could not look up clinicians.",
      });
    }
  }, [specialistQuery, toast]);

  const closeConfirm = () => {
    setPending(null);
    setReason("");
    setTargetDoctor("");
    setSpecialistQuery("");
    setSpecialists([]);
  };

  const execute = async () => {
    if (!config) return;
    if (config.needsReason && !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: `A reason is required to ${config.verb.toLowerCase()} reports.`,
      });
      return;
    }
    if (config.id === "assign_specialist" && !targetDoctor) {
      toast({
        variant: "destructive",
        title: "Specialist Required",
        description: "Choose the clinician to assign these reports to.",
      });
      return;
    }

    try {
      const result = await bulkMutation.mutateAsync({
        action: config.id,
        report_ids: selectedIds,
        reason: reason.trim() || null,
        target_doctor_id: config.id === "assign_specialist" ? targetDoctor : null,
      });
      setJob(result);
      closeConfirm();
      if (result.status === "completed") {
        onClear();
        toast({ title: "Batch Complete", description: result.message });
      } else {
        toast({
          title: "Batch Queued",
          description: `${result.total} reports queued. Progress is shown below.`,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Batch Failed",
        description: (err as Error)?.message || "Could not run the bulk action.",
      });
    }
  };

  if (count === 0 && !live) return null;

  return (
    <div className="mb-4 space-y-3">
      {count > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-surface-container p-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge variant="info" dot>
              {count} selected
            </StatusBadge>

            {canSelectMatching && (
              <button
                type="button"
                onClick={handleSelectMatching}
                disabled={selectAllMatching.isPending}
                className={chipBtn}
              >
                {selectAllMatching.isPending
                  ? "Resolving..."
                  : "Select all matching current filters"}
              </button>
            )}

            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setPending(a.id)}
                  disabled={bulkMutation.isPending}
                  className={chipBtn}
                >
                  {a.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleExport("csv")}
                disabled={exporting}
                className={chipBtn}
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                disabled={exporting}
                className={chipBtn}
              >
                Export PDF
              </button>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Batch result / progress */}
      {live && (
        <div className="rounded-2xl border border-border-subtle bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={live.status === "completed" ? "success" : "info"} dot>
              {live.status === "completed" ? "Batch complete" : "Processing"}
            </StatusBadge>
            <StatusBadge variant="success">Completed {live.completed}</StatusBadge>
            <StatusBadge variant="warning">Skipped {live.skipped}</StatusBadge>
            <StatusBadge variant={live.failed > 0 ? "error" : "neutral"}>
              Failed {live.failed}
            </StatusBadge>
            <span className="text-xs text-muted-foreground">
              {live.completed + live.skipped + live.failed} of {live.total}
            </span>
            <button
              type="button"
              onClick={() => setJob(null)}
              className="ml-auto text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>

          {live.message && (
            <p className="mt-2 text-sm text-foreground">{live.message}</p>
          )}

          {/* Per-item detail for anything that did not simply succeed */}
          {live.items.some((i) => i.outcome !== "completed") && (
            <details className="mt-3 rounded-xl border border-border-subtle p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Skipped &amp; failed detail
              </summary>
              <ul className="mt-2 space-y-1">
                {live.items
                  .filter((i) => i.outcome !== "completed")
                  .map((i) => (
                    <li key={i.report_id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {i.report_id.slice(0, 8)}
                      </span>{" "}
                      — {i.outcome}: {i.detail}
                    </li>
                  ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Confirmation */}
      {config && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="font-headline text-headline-md text-foreground">
                {config.verb} {count} report{count === 1 ? "" : "s"}?
              </h2>
              <button
                onClick={closeConfirm}
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-body-md text-muted-foreground">
              This applies to every selected report. Reports already in the target
              state are skipped, and this action is recorded in the audit log.
            </p>

            {config.id === "assign_specialist" && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Find a clinician by name or specialty
                  </label>
                  <input
                    value={specialistQuery}
                    onChange={(e) => setSpecialistQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void searchSpecialists();
                      }
                    }}
                    placeholder="e.g. Cardiology"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => void searchSpecialists()}
                    className={`${chipBtn} mt-2`}
                  >
                    Search
                  </button>
                </div>
                {specialists.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Assign to
                    </label>
                    <select
                      value={targetDoctor}
                      onChange={(e) => setTargetDoctor(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Choose a clinician</option>
                      {specialists.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {config.needsReason && (
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Reason (recorded in the audit log)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={execute}
                disabled={bulkMutation.isPending}
                className={primaryBtn}
              >
                {bulkMutation.isPending ? "Working..." : `${config.verb} ${count}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Header row with the select-all-on-page checkbox. */
export function BulkSelectHeader({
  reports,
  selectedIds,
  onToggleAll,
}: {
  reports: DoctorReportCard[];
  selectedIds: string[];
  onToggleAll: (checked: boolean, ids: string[]) => void;
}) {
  const allSelected =
    reports.length > 0 && reports.every((r) => selectedIds.includes(r.id));
  return (
    <label className="flex items-center gap-2 px-2 pb-2 text-xs font-medium text-muted-foreground">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={(e) => onToggleAll(e.target.checked, reports.map((r) => r.id))}
        className="h-4 w-4 rounded border-border-subtle"
      />
      Select all {reports.length} on this page
    </label>
  );
}
