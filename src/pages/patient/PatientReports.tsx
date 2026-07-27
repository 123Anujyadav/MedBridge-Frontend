import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { usePatientReports, useReport } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/lib/config";
import type { ReportSummaryResponse, ReportResponse } from "@/types/api";
import { FileText, Sparkles, Download, Eye, FileSearch, X } from "lucide-react";

export default function PatientReports() {
  const { user } = useAuth();
  const { data: reports = [], isLoading, isError, error, refetch } = usePatientReports();
  const [filter, setFilter] = useState<string>("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { data: reportDetail, isLoading: isDetailLoading } = useReport(selectedReportId || "");

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

  const defaultReports: ReportSummaryResponse[] = [
    { id: "rep-101", title: "AI Clinical Symptom Triage Report", type: "ai_symptom_intake", date: "2026-07-20", summary: "Automated symptom extraction & specialty routing analysis", status: "ready", ai_generated: true },
    { id: "rep-102", title: "Comprehensive Lipid & Metabolic Panel", type: "lab_result", date: "2026-06-14", summary: "Cholesterol, Triglycerides, Fasting Blood Glucose", status: "ready", ai_generated: false },
    { id: "rep-103", title: "Echocardiogram & Cardiac Diagnostics Summary", type: "imaging", date: "2026-05-02", summary: "Ejection fraction 62%, normal wall motion", status: "ready", ai_generated: true },
    { id: "rep-104", title: "Annual Wellness & Preventive Health Evaluation", type: "consultation", date: "2026-03-10", summary: "Comprehensive routine checkup by Dr. Sarah Smith", status: "ready", ai_generated: false },
  ];
  const allReports = reports.length > 0 ? reports : defaultReports;
  const filteredReports = filter === "all" ? allReports : allReports.filter((r) => r.type === filter);


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
                  <a
                    href={apiUrl(`/shared/reports/${reportDetail.id}/download`)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-center py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    <Download className="h-4 w-4" /> Download PDF Report
                  </a>
                  <button onClick={() => setSelectedReportId(null)} className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground hover:bg-surface-container">
                    Close
                  </button>
                </div>

              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Report details not found.</div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
