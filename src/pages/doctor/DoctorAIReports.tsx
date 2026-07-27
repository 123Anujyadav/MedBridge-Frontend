import { useState, useCallback, lazy, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, FilterBar } from "@/components/shared/FilterBar";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { AIReportCard } from "@/components/doctor/AIReportCard";
import { BulkActionBar, BulkSelectHeader } from "@/components/doctor/BulkActionBar";
import {
  useDoctorReports,
  useUpdateReportStatus,
  useReportDraftCandidates,
  useGenerateReportDraft,
  useIssueAIReport,
  useClinicalReview,
} from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import { Brain, FileText, Sparkles, TrendingUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import doctorService from "@/lib/doctor-service";
import type {
  AIReportDraftResponse,
  DoctorReportCard,
  ReportListFilters,
} from "@/types/api";

// The review workspace is a large component only needed once a report is
// opened, so it is kept out of the initial page bundle.
const ClinicalReviewWorkspace = lazy(() =>
  import("@/components/doctor/ClinicalReviewWorkspace").then((m) => ({
    default: m.ClinicalReviewWorkspace,
  }))
);

/** The five fields that require the doctor's clinical judgement. */
interface ClinicalEdits {
  title: string;
  diagnosis: string;
  clinical_notes: string;
  prescription: string;
  follow_up_instructions: string;
  recommendations: string;
  recommended_tests: string;
}

const EMPTY_EDITS: ClinicalEdits = {
  title: "",
  diagnosis: "",
  clinical_notes: "",
  prescription: "",
  follow_up_instructions: "",
  recommendations: "",
  recommended_tests: "",
};

/** Textarea lines <-> string[], so list fields stay editable as plain text. */
const toLines = (value: string): string[] =>
  value.split("\n").map((l) => l.trim()).filter(Boolean);

function editsFromDraft(draft: AIReportDraftResponse): ClinicalEdits {
  return {
    title: draft.title,
    diagnosis: draft.diagnosis,
    clinical_notes: draft.clinical_notes,
    prescription: draft.prescription,
    follow_up_instructions: draft.follow_up_instructions,
    recommendations: draft.recommendations.join("\n"),
    recommended_tests: draft.recommended_tests.join("\n"),
  };
}

/** A read-only block of auto-loaded record data. */
function AutoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="rounded-xl border border-border-subtle bg-surface-container p-3 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

export default function DoctorAIReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // ── Bulk selection ─────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const filters: ReportListFilters = statusFilter ? { status: statusFilter } : {};

  const { data: reports = [], isLoading } = useDoctorReports(filters);
  const updateStatusMutation = useUpdateReportStatus();

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  // The header owns the page's ids, so this stays a stable callback and the
  // memoised cards below do not re-render on every list refetch.
  const handleToggleAll = useCallback(
    (checked: boolean, ids: string[]) => setSelectedIds(checked ? ids : []),
    []
  );

  // "View Full AI Analysis" opens the Clinical Review Workspace, which pulls the
  // patient record, AI intake case, evidence trail and timeline in one call.
  const {
    data: review,
    isLoading: reviewLoading,
    isError: reviewIsError,
    error: reviewErrorObj,
    refetch: refetchReview,
  } = useClinicalReview(selectedReport?.id ?? null);
  const reviewError = reviewIsError ? reviewErrorObj : null;

  // ── AI-assisted authoring state ────────────────────────────────────────
  const { data: candidates = [], isLoading: candidatesLoading } = useReportDraftCandidates(showModal);
  const draftMutation = useGenerateReportDraft();
  const issueMutation = useIssueAIReport();

  const [draft, setDraft] = useState<AIReportDraftResponse | null>(null);
  const [edits, setEdits] = useState<ClinicalEdits>(EMPTY_EDITS);

  // Real mean of the stored per-report confidence scores. Renders "—" when no
  // report carries one, rather than showing an invented percentage.
  const scored = reports.filter(
    (r) => typeof r.ai_confidence_score === "number" && r.ai_confidence_score > 0
  );
  const avgConfidence = scored.length
    ? `${Math.round(
        (scored.reduce((sum, r) => sum + (r.ai_confidence_score as number), 0) /
          scored.length) *
          100
      )}%`
    : "—";

  const setField = (key: keyof ClinicalEdits, value: string) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const resetDraft = () => {
    setDraft(null);
    setEdits(EMPTY_EDITS);
  };

  const closeModal = () => {
    setShowModal(false);
    resetDraft();
  };

  /** Selecting a case loads the patient, the AI case, reports and history. */
  const handleSelectCase = async (caseId: string) => {
    if (!caseId) {
      resetDraft();
      return;
    }
    try {
      const generated = await draftMutation.mutateAsync(caseId);
      setDraft(generated);
      setEdits(editsFromDraft(generated));
      if (generated.draft_source !== "groq") {
        toast({
          title: "Draft Built From Records",
          description: "AI drafting was unavailable, so the draft uses stored case data only.",
        });
      }
    } catch {
      resetDraft();
      toast({
        variant: "destructive",
        title: "Draft Failed",
        description: "Could not assemble the clinical draft for this case.",
      });
    }
  };

  const handleIssueReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft) return;

    if (!edits.title.trim() || !edits.diagnosis.trim()) {
      toast({
        variant: "destructive",
        title: "Review Incomplete",
        description: "A report title and a confirmed diagnosis are required before dispatch.",
      });
      return;
    }

    try {
      await issueMutation.mutateAsync({
        case_id: draft.case_id,
        title: edits.title.trim(),
        summary: draft.ai_summary,
        diagnosis: edits.diagnosis.trim(),
        clinical_notes: edits.clinical_notes,
        prescription: edits.prescription,
        follow_up_instructions: edits.follow_up_instructions,
        recommendations: toLines(edits.recommendations),
        recommended_tests: toLines(edits.recommended_tests),
        ai_generated: draft.ai_generated,
        ai_confidence_score: draft.ai_confidence_score ?? null,
      });
      toast({
        title: "Report Dispatched",
        description: `PDF generated and sent to ${draft.patient_name}'s record.`,
      });
      closeModal();
    } catch {
      toast({
        variant: "destructive",
        title: "Dispatch Error",
        description: "Could not issue the clinical report.",
      });
    }
  };

  /**
   * Download an issued PDF through the authenticated client.
   *
   * The previous implementation pointed a bare <a href> at a hardcoded
   * http://localhost:8000, which both breaks outside local dev and omits the
   * bearer token the download route requires.
   */
  const handleDownloadPdf = async (report: any) => {
    try {
      const blob = await doctorService.downloadReportPdf(report.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.title || "clinical-report"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not retrieve the PDF for this report.",
      });
    }
  };

  // Stable identities so the memoised cards do not re-render on every parent
  // state change (draft editing, modal toggles).
  const handleUpdateStatus = useCallback(
    async (reportId: string, newStatus: string) => {
      try {
        await updateStatusMutation.mutateAsync({ id: reportId, statusStr: newStatus });
        toast({
          title: "Report Status Updated",
          description: `Report is now ${newStatus.replace("_", " ")}.`,
        });
      } catch {
        toast({ variant: "destructive", title: "Update Error", description: "Failed to update report status." });
      }
    },
    [updateStatusMutation, toast]
  );

  const handleApprove = useCallback(
    (id: string) => handleUpdateStatus(id, "ready"),
    [handleUpdateStatus]
  );
  const handleReject = useCallback(
    (id: string) => handleUpdateStatus(id, "rejected"),
    [handleUpdateStatus]
  );
  /** Reuses the existing needs_revision status rather than adding a new concept. */
  const handleRequestInfo = useCallback(
    (id: string) => handleUpdateStatus(id, "needs_revision"),
    [handleUpdateStatus]
  );
  const handleView = useCallback((report: DoctorReportCard) => setSelectedReport(report), []);

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search AI reports...">
      <PageHeader
        title="AI Reports Center"
        subtitle="View, review, and approve AI-generated patient reports and clinical decision support summaries."
        breadcrumbs={[{ label: "Doctor" }, { label: "AI Reports" }]}
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90">
            <Sparkles className="h-4 w-4" /> Issue AI Clinical Report
          </button>
        }
      />

      {/* AI Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-headline text-headline-md font-semibold text-foreground">{reports.length}</p>
              <p className="text-body-sm text-muted-foreground">Total Reports in System</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-headline text-headline-md font-semibold text-foreground">{avgConfidence}</p>
              <p className="text-body-sm text-muted-foreground">Avg AI Confidence Index</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-headline text-headline-md font-semibold text-foreground">
                {reports.filter(r => r.status === "pending" || r.status === "pending_review").length}
              </p>
              <p className="text-body-sm text-muted-foreground">Pending Doctor Review</p>
            </div>
          </div>
        </div>
      </div>

      <FilterBar
        className="mb-4"
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              // The visible set changes, so a selection built from the previous
              // filter no longer reflects what the doctor can see.
              clearSelection();
            },
            options: [
              { value: "", label: "All" },
              { value: "pending_review", label: "Needs Review" },
              { value: "ready", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "needs_revision", label: "More Info Requested" },
              { value: "reviewed", label: "Reviewed" },
              { value: "archived", label: "Archived" },
            ],
          },
        ]}
      />

      <BulkActionBar
        selectedIds={selectedIds}
        pageIds={reports.map((r) => r.id)}
        filters={filters}
        pageIsFull={reports.length >= 100}
        onSelectionChange={setSelectedIds}
        onClear={clearSelection}
      />

      <SectionCard title="AI & Clinical Decision Support Reports">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading AI reports...</div>
        ) : reports.length === 0 ? (
          <EmptyState icon={<FileText className="h-8 w-8" />} title="No Reports Available" description="No AI clinical reports pending or issued." />
        ) : (
          <div className="space-y-4 p-2">
            <BulkSelectHeader
              reports={reports}
              selectedIds={selectedIds}
              onToggleAll={handleToggleAll}
            />
            {reports.map((report) => (
              <AIReportCard
                key={report.id}
                report={report}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestInfo={handleRequestInfo}
                onView={handleView}
                busy={updateStatusMutation.isPending}
                selected={selectedIds.includes(report.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Clinical Review Workspace — opened from "View Full AI Analysis" */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div>
                <h2 className="font-headline text-lg font-bold text-foreground">{selectedReport.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Clinical Review Workspace · Patient: {selectedReport.patient_name}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewLoading && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Assembling patient record, AI analysis and evidence...
              </div>
            )}

            {reviewError && (
              <ErrorState
                title="Could Not Load Clinical Review"
                description={(reviewError as Error)?.message || "The review could not be assembled."}
                onRetry={refetchReview}
              />
            )}

            {review && (
              <Suspense
                fallback={
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Loading clinical review workspace...
                  </div>
                }
              >
                <ClinicalReviewWorkspace
                  review={review}
                  onIssued={() => setSelectedReport(null)}
                />
              </Suspense>
            )}

            {/* The original report body stays available underneath the workspace. */}
            {review && (
              <details className="mt-4 rounded-xl border border-border-subtle p-4">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Original Report Text
                </summary>
                <div className="prose prose-sm dark:prose-invert mt-3 max-w-none whitespace-pre-wrap text-sm text-foreground">
                  {selectedReport.content}
                </div>
              </details>
            )}

            <div className="mt-6 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedReport)}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                Download PDF Report
              </button>
              <button onClick={() => setSelectedReport(null)} className="rounded-xl border border-border-subtle px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-container">
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Issue Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={closeModal}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-headline-md text-foreground">Issue AI Clinical Report</h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueReport} className="space-y-4">
              {/* Case selection — replaces the hand-typed patient UUID */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Select Patient Case</label>
                <select
                  value={draft?.case_id ?? ""}
                  onChange={(e) => handleSelectCase(e.target.value)}
                  disabled={draftMutation.isPending || issueMutation.isPending}
                  className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm disabled:opacity-50"
                >
                  <option value="">
                    {candidatesLoading ? "Loading your cases..." : "Choose a case to auto-load the record"}
                  </option>
                  {candidates.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.patient_name} — {c.chief_complaint || c.specialty} ({c.urgency_level}
                      {c.has_ai_intake ? ", AI intake" : ""})
                    </option>
                  ))}
                </select>
              </div>

              {draftMutation.isPending && (
                <div className="rounded-xl border border-border-subtle p-8 text-center text-sm text-muted-foreground">
                  Loading patient, AI case, reports and history, then drafting the report...
                </div>
              )}

              {!draft && !draftMutation.isPending && (
                <div className="rounded-xl border border-border-subtle p-8 text-center text-sm text-muted-foreground">
                  {candidates.length === 0 && !candidatesLoading
                    ? "No cases are currently assigned to you."
                    : "Select a case above. Patient details, AI summary, symptoms, reports and history load automatically."}
                </div>
              )}

              {draft && (
                <>
                  {/* ── Auto-filled from the record ────────────────────── */}
                  <div className="grid grid-cols-2 gap-4">
                    <AutoField label="Patient" value={`${draft.patient_name} · ${draft.patient_age} yrs · ${draft.patient_gender}`} />
                    <AutoField label="Attending Physician" value={`${draft.doctor_name} · ${draft.hospital_name}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AutoField label="Case ID" value={<span className="text-xs">{draft.case_id}</span>} />
                    <AutoField label="Report Date" value={`${draft.date} · urgency ${draft.urgency_level}`} />
                  </div>

                  <AutoField label="Chief Complaint" value={draft.chief_complaint || "Not recorded"} />

                  <AutoField label="AI Summary" value={draft.ai_summary || "No AI summary on file for this case."} />

                  <div className="grid grid-cols-2 gap-4">
                    <AutoField
                      label="Extracted Symptoms"
                      value={
                        draft.symptoms.length ? (
                          <ul className="space-y-1">
                            {draft.symptoms.map((s) => <li key={s}>· {s}</li>)}
                          </ul>
                        ) : "None recorded"
                      }
                    />
                    <AutoField
                      label="Clinical Findings"
                      value={
                        draft.clinical_findings.length ? (
                          <ul className="space-y-1">
                            {draft.clinical_findings.map((f) => <li key={f}>· {f}</li>)}
                          </ul>
                        ) : "None recorded"
                      }
                    />
                  </div>

                  <AutoField
                    label="Previous History"
                    value={
                      draft.previous_history.length ? (
                        <ul className="space-y-1">
                          {draft.previous_history.map((h) => <li key={h}>· {h}</li>)}
                        </ul>
                      ) : "No prior history on file"
                    }
                  />

                  <AutoField
                    label="Uploaded Reports"
                    value={
                      draft.uploaded_reports.length ? (
                        <ul className="space-y-1">
                          {draft.uploaded_reports.map((r) => (
                            <li key={r.report_id}>· {r.title} ({r.type}, {r.date})</li>
                          ))}
                        </ul>
                      ) : "No documents on file"
                    }
                  />

                  {draft.red_flags.length > 0 && (
                    <AutoField
                      label="Red Flags"
                      value={
                        <ul className="space-y-1 text-destructive">
                          {draft.red_flags.map((f) => <li key={f}>· {f}</li>)}
                        </ul>
                      }
                    />
                  )}

                  {draft.warnings.length > 0 && (
                    <AutoField
                      label="Gaps To Confirm Before Issuing"
                      value={
                        <ul className="space-y-1">
                          {draft.warnings.map((w) => <li key={w}>· {w}</li>)}
                        </ul>
                      }
                    />
                  )}

                  {/* ── Doctor review & edit ───────────────────────────── */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Report Title</label>
                    <input
                      value={edits.title}
                      onChange={(e) => setField("title", e.target.value)}
                      required
                      className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Diagnosis</label>
                    <textarea
                      value={edits.diagnosis}
                      onChange={(e) => setField("diagnosis", e.target.value)}
                      required
                      rows={2}
                      placeholder="Confirm or correct the working impression"
                      className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Clinical Notes</label>
                    <textarea
                      value={edits.clinical_notes}
                      onChange={(e) => setField("clinical_notes", e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Prescription</label>
                    <textarea
                      value={edits.prescription}
                      onChange={(e) => setField("prescription", e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Follow-up Instructions</label>
                    <textarea
                      value={edits.follow_up_instructions}
                      onChange={(e) => setField("follow_up_instructions", e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Recommendations (one per line)</label>
                      <textarea
                        value={edits.recommendations}
                        onChange={(e) => setField("recommendations", e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Recommended Tests (one per line)</label>
                      <textarea
                        value={edits.recommended_tests}
                        onChange={(e) => setField("recommended_tests", e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {draft.ai_generated
                      ? "Draft generated by AI from the case record. You are the approving clinician."
                      : "AI drafting was unavailable — this draft was assembled from stored records only."}
                  </p>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!draft || issueMutation.isPending || draftMutation.isPending}
                  className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {issueMutation.isPending ? "Dispatching..." : "Generate & Dispatch Report"}
                </button>
                <button
                  type="button"
                  onClick={draft ? resetDraft : closeModal}
                  disabled={issueMutation.isPending}
                  className="rounded-xl border border-border-subtle px-5 py-3 font-semibold text-foreground disabled:opacity-50"
                >
                  {draft ? "Discard Draft" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
