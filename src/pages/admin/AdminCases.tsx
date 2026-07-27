import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { UrgencyBadge, CaseStatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useAdminCases } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import type { CaseResponse } from "@/types/api";
import { Folders, Eye, X, Activity, Shield } from "lucide-react";

export default function AdminCases() {
  const { user } = useAuth();
  const { data: allCases = [], isLoading, isError, error, refetch } = useAdminCases();
  const [selectedCase, setSelectedCase] = useState<CaseResponse | null>(null);

  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search cases...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search cases...">
        <ErrorState title="Failed to Load Cases" description={(error as Error)?.message || "Could not retrieve system case oversight."} onRetry={refetch} />
      </AppShell>
    );
  }

  const columns: Column<CaseResponse>[] = [
    {
      key: "patient_name",
      header: "Patient",
      sortable: true,
      sortValue: (c) => c.patient_name,
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
            {c.patient_name ? c.patient_name[0] : "P"}
          </div>
          <div>
            <p className="font-medium text-foreground">{c.patient_name}</p>
            <p className="text-xs text-muted-foreground">{c.patient_age} years • {c.patient_gender}</p>
          </div>
        </div>
      ),
    },
    {
      key: "urgency_level",
      header: "Urgency",
      sortable: true,
      sortValue: (c) => c.urgency_level,
      render: (c) => <UrgencyBadge level={c.urgency_level} />,
    },
    {
      key: "specialty",
      header: "Specialty",
      sortable: true,
      sortValue: (c) => c.specialty,
      render: (c) => <span className="font-medium text-foreground">{c.specialty}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (c) => c.status,
      render: (c) => <CaseStatusBadge status={c.status} />,
    },
    {
      key: "actions",
      header: "Action",
      render: (c) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCase(c);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-surface-container px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high"
        >
          <Eye className="h-3.5 w-3.5" /> View Telemetry
        </button>
      ),
    },
  ];

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search cases...">
      <PageHeader
        title="Case Monitoring & Intake Governance"
        subtitle="Real-time oversight of patient intake, routing, clinician consultation, and report status."
        breadcrumbs={[{ label: "Admin" }, { label: "Case Monitoring" }]}
      />

      <DataTable columns={columns} data={allCases} rowKey={(c) => c.id} onRowClick={(c) => setSelectedCase(c)} />

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border-subtle p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setSelectedCase(null)} className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 border-b border-border-subtle pb-4">
              <h3 className="text-headline-sm font-semibold text-foreground">{selectedCase.patient_name}</h3>
              <p className="text-body-sm text-muted-foreground">Case ID: {selectedCase.id}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Symptom Telemetry</h4>
                <p className="text-body-sm text-foreground bg-surface-container-low p-3 rounded-xl">{selectedCase.symptom_summary}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> AI Diagnostics
                </h4>
                <p className="text-body-sm">Specialty Recommendation: <span className="font-semibold">{selectedCase.ai_specialty_recommendation}</span></p>
                <p className="text-body-sm">AI Confidence: <span className="font-semibold">{Math.round((selectedCase.ai_confidence_score || 0.8) * 100)}%</span></p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedCase(null)} className="rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
