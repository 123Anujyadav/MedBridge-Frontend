import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { usePatientReports, useReport, useDownloadReport } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { ReportSummaryResponse } from "@/types/api";
import { FileText, Sparkles, Download, Eye, FileSearch } from "lucide-react";

export default function PatientReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: reports = [], isLoading, isError, error, refetch } = usePatientReports();
  const [filter, setFilter] = useState<string>("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const {
    data: reportDetail,
    isLoading: isDetailLoading,
    error: detailError,
  } = useReport(selectedReportId || "");
  const downloadReport = useDownloadReport();

  const handleDownload = async (id: string, title: string) => {
    try {
      await downloadReport.mutateAsync({ id, filename: `${title}.pdf` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: (err as Error)?.message || "Could not download this report.",
      });
    }
  };

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search reports...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search reports...">
        <ErrorState title="Failed to Load Reports" description={(error as Error)?.message || "Could not retrieve medical reports."} onRetry={refetch} />
      </AppShell>
    );
  }

  // Reports come only from PostgreSQL. A placeholder list used to be rendered
  // when the query returned nothing, and its ids ("rep-101", …) were not UUIDs —
  // so opening one sent `GET /patient/reports/rep-101`, which the API rejected
  // as a malformed UUID and the modal reported "Report details not found".
  const filteredReports = filter === "all" ? reports : reports.filter((r) => r.type === filter);


  const columns: Column<ReportSummaryResponse>[] = [
    {
      key: "title",
      header: "Report Title",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{r.title}</p>
            <p className="text-xs text-muted-foreground">{r.summary}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      sortValue: (r) => r.type,
      render: (r) => <span className="text-body-sm capitalize">{r.type.replace(/_/g, " ")}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      render: (r) => <span className="text-body-sm text-muted-foreground">{r.date}</span>,
    },
    {
      key: "ai_generated",
      header: "Source",
      render: (r) => (r.ai_generated ? <StatusBadge variant="info">AI Generated</StatusBadge> : <StatusBadge variant="neutral">Lab Result</StatusBadge>),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge variant={r.status === "ready" ? "success" : "neutral"} dot>
          {r.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedReportId(r.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground transition-all hover:bg-surface-container hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search reports...">
      <PageHeader
        title="AI Reports Center"
        subtitle="View your AI-generated health summaries, lab results, and medical reports."
        breadcrumbs={[{ label: "Patient" }, { label: "AI Reports" }]}
        actions={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-border-subtle bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Reports</option>
            <option value="ai_report">AI Reports</option>
            <option value="lab_result">Lab Results</option>
            <option value="imaging">Imaging</option>
          </select>
        }
      />

      {/* Summary Banner */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-headline-md font-headline font-semibold text-foreground">{reports.filter((r) => r.ai_generated).length}</p>
              <p className="text-body-sm text-muted-foreground">AI-Generated Reports</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-headline-md font-headline font-semibold text-foreground">{reports.filter((r) => r.status === "ready").length}</p>
              <p className="text-body-sm text-muted-foreground">Ready to View</p>
            </div>
          </div>
        </div>
        <div className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
              <FileSearch className="h-5 w-5" />
            </div>
            <div>
              <p className="text-headline-md font-headline font-semibold text-foreground">{reports.length}</p>
              <p className="text-body-sm text-muted-foreground">Total Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <SectionCard title="Your Reports">
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No reports found"
            description="Your AI-generated reports and lab results will appear here once available."
            action={<button onClick={() => refetch()} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Refresh</button>}
          />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={filteredReports} rowKey={(r) => r.id} onRowClick={(r) => setSelectedReportId(r.id)} />
      )}

      {/* Report Detail Modal */}
      {selectedReportId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelectedReportId(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            {isDetailLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading report details...</div>
            ) : reportDetail ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-headline text-headline-md text-foreground">{reportDetail.title}</h2>
                    <p className="mt-1 text-body-sm text-muted-foreground">{reportDetail.date} • {reportDetail.doctor_name || reportDetail.hospital_name || "MedBridge Clinical AI"}</p>
                  </div>
                  {reportDetail.ai_generated && <StatusBadge variant="info" dot>AI Generated</StatusBadge>}
                </div>
                <div className="mb-4 rounded-xl bg-surface-container-low p-4">
                  <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</p>
                  <p className="text-body-sm text-foreground">{reportDetail.summary}</p>
                </div>
                <div className="mb-4">
                  <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Full Clinical Content</p>
                  <p className="text-body-sm text-foreground whitespace-pre-wrap">{reportDetail.content}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(reportDetail.id, reportDetail.title)}
                    disabled={downloadReport.isPending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-center py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {downloadReport.isPending ? "Preparing..." : "Download PDF Report"}
                  </button>
                  <button onClick={() => setSelectedReportId(null)} className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground hover:bg-surface-container">
                    Close
                  </button>
                </div>

              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {(detailError as Error)?.message || "Report details could not be loaded."}
                </p>
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="mt-4 rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground hover:bg-surface-container"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
