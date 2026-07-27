// ============================================
// Clinical Document Panel — PDF preview, version history, comparison
//
// The preview is the real PDF, fetched inline from the same route the download
// uses, so what a doctor reviews is byte-identical to what the patient
// receives. Rendering a lookalike in HTML would have been easier and would
// have drifted the first time either side changed.
//
// Built from existing tokens: rounded-xl/border-border-subtle blocks, the
// portal's button classes and StatusBadge. No new design tokens.
// ============================================
import { useState, useEffect, useCallback, useMemo } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/States";
import {
  useReportVersions,
  useVersionComparison,
  useCreateReportVersion,
  useUpdateReportStatus,
} from "@/hooks/useDoctor";
import { useToast } from "@/hooks/use-toast";
import doctorService from "@/lib/doctor-service";
import type { ReportVersionSummary, VersionFieldDiff } from "@/types/api";
import { FileText, Printer, Share2, Link as LinkIcon, Download } from "lucide-react";

const AUTHOR_GLYPH: Record<string, string> = {
  ai: "🤖",
  doctor: "👨‍⚕️",
  system: "⚙️",
};

const STATUS_TONE: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  approved: "success",
  shared: "success",
  ai_draft: "info",
  draft: "neutral",
  under_review: "warning",
  rejected: "error",
  archived: "neutral",
};

const chipBtn =
  "flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container disabled:opacity-50";
const primaryBtn =
  "rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50";
const selectClass =
  "rounded-xl border border-border-subtle bg-card p-2 text-xs";

/** Word-level diff rendering. Colours come from the existing semantic tokens. */
function DiffBody({ field }: { field: VersionFieldDiff }) {
  if (field.added_items.length || field.removed_items.length) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {field.removed_items.map((i) => (
          <span key={`r-${i}`} className="rounded-full bg-error-soft px-2 py-0.5 text-xs text-error-edge line-through">
            {i}
          </span>
        ))}
        {field.added_items.map((i) => (
          <span key={`a-${i}`} className="rounded-full bg-success-soft px-2 py-0.5 text-xs text-success">
            {i}
          </span>
        ))}
      </div>
    );
  }
  if (field.segments.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <p className="text-xs text-muted-foreground line-through">{field.previous_value || "—"}</p>
        <p className="text-xs text-foreground">{field.new_value || "—"}</p>
      </div>
    );
  }
  return (
    <p className="text-xs leading-relaxed">
      {field.segments.map((s, i) =>
        s.type === "equal" ? (
          <span key={i} className="text-muted-foreground">{s.text} </span>
        ) : s.type === "removed" ? (
          <span key={i} className="bg-error-soft text-error-edge line-through">{s.text} </span>
        ) : (
          <span key={i} className="bg-success-soft text-success">{s.text} </span>
        )
      )}
    </p>
  );
}

interface Props {
  reportId: string;
  reportTitle: string;
}

export function ReportDocumentPanel({ reportId, reportTitle }: Props) {
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState(20);
  const { data: history, isLoading } = useReportVersions(reportId, pageSize);
  const createVersion = useCreateReportVersion(reportId);
  const updateStatus = useUpdateReportStatus();

  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<number | null>(null);
  const [compareB, setCompareB] = useState<number | null>(null);

  const versions = useMemo(() => history?.versions ?? [], [history]);
  const { data: comparison, isFetching: comparing } = useVersionComparison(
    reportId, compareA, compareB
  );

  // Fetch the PDF as a blob so the authenticated request carries the bearer
  // token; an <iframe src> would send an unauthenticated GET.
  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    (async () => {
      setPreviewError(null);
      try {
        const blob = await doctorService.previewReportPdf(
          reportId, previewVersion ?? undefined
        );
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        revoked = url;
        setPreviewUrl(url);
      } catch {
        if (!cancelled) {
          setPreviewUrl(null);
          setPreviewError("No rendered document is available for this version yet.");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [reportId, previewVersion]);

  const download = useCallback(async () => {
    try {
      const blob = await doctorService.downloadReportPdf(reportId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportTitle || "clinical-report"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "Download Failed",
              description: "Could not retrieve the document." });
    }
  }, [reportId, reportTitle, toast]);

  const print = useCallback(() => {
    if (!previewUrl) return;
    // Print the exact rendered PDF rather than the surrounding page.
    const frame = document.getElementById("clinical-doc-preview") as HTMLIFrameElement | null;
    frame?.contentWindow?.focus();
    frame?.contentWindow?.print();
  }, [previewUrl]);

  const copyLink = useCallback(async () => {
    const link = `${window.location.origin}/doctor/ai-reports?report=${reportId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link Copied", description: "Portal link copied to your clipboard." });
    } catch {
      toast({ variant: "destructive", title: "Copy Failed",
              description: "Your browser blocked clipboard access." });
    }
  }, [reportId, toast]);

  const shareWithPatient = useCallback(async () => {
    try {
      await updateStatus.mutateAsync({ id: reportId, statusStr: "shared" });
      toast({ title: "Shared With Patient",
              description: "The patient has been notified and can now open this document." });
    } catch {
      toast({ variant: "destructive", title: "Share Failed",
              description: "Could not share the document." });
    }
  }, [reportId, updateStatus, toast]);

  const exportMetadata = useCallback(async () => {
    try {
      const { blob, filename } = await doctorService.exportReports([reportId], "csv");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "Export Failed",
              description: "Could not export document metadata." });
    }
  }, [reportId, toast]);

  const restore = useCallback(async (version: number) => {
    try {
      const created = await createVersion.mutateAsync({ restore_from_version: version });
      toast({
        title: "Version Restored",
        description: `Version ${version} content brought forward as version ${created.version_number}. Nothing was overwritten.`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Restore Blocked",
              description: (err as Error)?.message || "Could not restore that version." });
    }
  }, [createVersion, toast]);

  return (
    <div className="space-y-4">
      {/* Document actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle p-4">
        <button type="button" onClick={download} className={chipBtn}>
          <Download className="h-3.5 w-3.5" /> Download PDF
        </button>
        <button type="button" onClick={print} disabled={!previewUrl} className={chipBtn}>
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
        <button type="button" onClick={shareWithPatient}
                disabled={updateStatus.isPending} className={chipBtn}>
          <Share2 className="h-3.5 w-3.5" /> Share with Patient
        </button>
        <button type="button" onClick={copyLink} className={chipBtn}>
          <LinkIcon className="h-3.5 w-3.5" /> Copy Link
        </button>
        <button type="button" onClick={exportMetadata} className={chipBtn}>
          <FileText className="h-3.5 w-3.5" /> Export Metadata
        </button>
        {history && (
          <StatusBadge variant={STATUS_TONE[history.report_status] ?? "neutral"} dot>
            {history.report_status}
          </StatusBadge>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border-subtle p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Document Preview
          </p>
          <select
            value={previewVersion ?? ""}
            onChange={(e) => setPreviewVersion(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">Current document</option>
            {versions.map((v) => (
              <option key={v.version_number} value={v.version_number}>
                Version {v.version_number} — {v.status}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            This is the generated PDF, not a preview approximation.
          </span>
        </div>

        {previewError ? (
          <EmptyState icon={<FileText className="h-8 w-8" />}
                      title="Preview Unavailable" description={previewError} />
        ) : previewUrl ? (
          <iframe
            id="clinical-doc-preview"
            src={previewUrl}
            title="Clinical document preview"
            className="h-[520px] w-full rounded-xl border border-border-subtle"
          />
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Rendering document...
          </div>
        )}
      </div>

      {/* Version history */}
      <div className="rounded-xl border border-border-subtle p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Version History
        </p>

        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading versions...
          </div>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No versions recorded.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v: ReportVersionSummary) => (
              <div key={v.version_number}
                   className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {AUTHOR_GLYPH[v.author_type] ?? "⚙️"} Version {v.version_number}
                    </span>
                    <StatusBadge variant={STATUS_TONE[v.status] ?? "neutral"}>
                      {v.status.replace("_", " ")}
                    </StatusBadge>
                    {v.is_latest && <StatusBadge variant="info">Current</StatusBadge>}
                    {!v.is_editable && (
                      <StatusBadge variant="neutral">Read-only</StatusBadge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {v.author_name}
                    {v.created_at ? ` · ${new Date(v.created_at).toLocaleString()}` : ""}
                    {v.restored_from_version ? ` · restored from v${v.restored_from_version}` : ""}
                  </p>
                  {v.description && (
                    <p className="mt-1 text-xs text-foreground">{v.description}</p>
                  )}
                  {(v.approval_note || v.rejection_reason) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {v.approved_by_name ? `Approved by ${v.approved_by_name}` : ""}
                      {v.approval_note ? ` — ${v.approval_note}` : ""}
                      {v.rejection_reason ? `Rejected — ${v.rejection_reason}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPreviewVersion(v.version_number)}
                          className={chipBtn}>
                    Preview
                  </button>
                  {!v.is_latest && (
                    <button type="button" onClick={() => restore(v.version_number)}
                            disabled={createVersion.isPending} className={chipBtn}>
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {history?.has_more && (
          <button type="button" onClick={() => setPageSize((n) => n + 20)}
                  className={`${chipBtn} mt-3 w-full justify-center`}>
            Load more versions
          </button>
        )}
      </div>

      {/* Comparison */}
      {versions.length > 1 && (
        <div className="rounded-xl border border-border-subtle p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Compare Versions
          </p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={compareA ?? ""} className={selectClass}
                    onChange={(e) => setCompareA(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Version A</option>
              {versions.map((v) => (
                <option key={v.version_number} value={v.version_number}>v{v.version_number}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">→</span>
            <select value={compareB ?? ""} className={selectClass}
                    onChange={(e) => setCompareB(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Version B</option>
              {versions.map((v) => (
                <option key={v.version_number} value={v.version_number}>v{v.version_number}</option>
              ))}
            </select>
            {comparing && <span className="text-xs text-muted-foreground">Comparing...</span>}
          </div>

          {comparison && (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  variant={comparison.changed_by_type === "ai" ? "info" : "success"} dot
                >
                  {comparison.changed_by_type === "ai"
                    ? "🤖 AI-generated changes"
                    : "👨‍⚕️ Doctor edits"}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">
                  by {comparison.changed_by_name}
                </span>
                <StatusBadge variant="success">Added {comparison.added_count}</StatusBadge>
                <StatusBadge variant="error">Removed {comparison.removed_count}</StatusBadge>
                <StatusBadge variant="warning">Modified {comparison.modified_count}</StatusBadge>
              </div>

              {comparison.identical ? (
                <p className="text-sm text-muted-foreground">
                  These two versions have identical clinical content.
                </p>
              ) : (
                <div className="space-y-3">
                  {comparison.fields.map((f) => (
                    <div key={f.field} className="rounded-xl border border-border-subtle p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{f.label}</span>
                        <StatusBadge
                          variant={f.change === "added" ? "success"
                            : f.change === "removed" ? "error" : "warning"}
                        >
                          {f.change}
                        </StatusBadge>
                      </div>
                      <DiffBody field={f} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Versions are immutable. Restoring an earlier version appends a new one —
        no previous clinical documentation is ever overwritten or deleted.
      </p>
    </div>
  );
}
