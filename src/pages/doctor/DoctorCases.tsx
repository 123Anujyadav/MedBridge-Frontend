import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { UrgencyBadge, CaseStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useDoctorCases } from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import type { CaseResponse } from "@/types/api";
import { Folders, ArrowRight, Filter } from "lucide-react";

export default function DoctorCases() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allCases = [], isLoading, isError, error, refetch } = useDoctorCases();

  const [filter, setFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search cases...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search cases...">
        <ErrorState title="Failed to Load Cases" description={(error as Error)?.message || "Could not retrieve consultation case queue."} onRetry={refetch} />
      </AppShell>
    );
  }
 
  let cases = filter === "all" ? allCases : allCases.filter((c) => c.status === filter);
  if (urgencyFilter !== "all") cases = cases.filter((c) => c.urgency_level === urgencyFilter);

  const columns: Column<CaseResponse>[] = [   
    {
      key: "patient_name",
      header: "Patient",
      sortable: true,
      sortValue: (c) => c.patient_name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
            {c.patient_name ? c.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "PT"}
          </div>
          <div>
            <p className="font-medium text-foreground">{c.patient_name}</p>
            <p className="text-xs text-muted-foreground">{c.patient_age}y • {c.patient_gender}</p>
          </div>
        </div>
      ),
    },
    {
      key: "symptom_summary",
      header: "Symptoms",
      render: (c) => <span className="text-body-sm text-muted-foreground line-clamp-1 max-w-xs">{c.symptom_summary}</span>,
    },
    {
      key: "specialty",
      header: "Specialty",
      sortable: true,
      sortValue: (c) => c.specialty,
      render: (c) => <span className="text-body-sm">{c.specialty}</span>,
    },
    {
      key: "urgency_level",
      header: "Urgency",
      sortable: true,
      sortValue: (c) => c.urgency_level,
      render: (c) => <UrgencyBadge level={c.urgency_level} />,
    },
    {
      key: "ai_confidence_score",
      header: "AI Confidence",
      sortable: true,
      sortValue: (c) => c.ai_confidence_score,
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full bg-primary" style={{ width: `${(c.ai_confidence_score || 0.8) * 100}%` }} />
          </div>
          <span className="text-body-sm font-medium text-foreground">{Math.round((c.ai_confidence_score || 0.8) * 100)}%</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <CaseStatusBadge status={c.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <button onClick={() => navigate("/doctor/consultation")} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90">
          Open <ArrowRight className="h-3 w-3" />
        </button>
      ),
    },
  ];

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search cases...">
      <PageHeader
        title="Case Queue"
        subtitle="Incoming structured case cards with AI-extracted symptoms and urgency classification."
        breadcrumbs={[{ label: "Doctor" }, { label: "Case Queue" }]}
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Cases", value: allCases.length, color: "text-foreground" },
          { label: "Critical", value: allCases.filter((c) => c.urgency_level === "critical").length, color: "text-destructive" },
          { label: "AI Processing", value: allCases.filter((c) => c.status === "ai_processing").length, color: "text-primary" },
          { label: "In Consultation", value: allCases.filter((c) => c.status === "in_consultation").length, color: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="premium-card p-4">
            <p className={`font-headline text-headline-md font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-body-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {["all", "intake", "ai_processing", "routed", "in_consultation", "prescribed", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${filter === f ? "bg-primary text-primary-foreground" : "border border-border-subtle text-muted-foreground hover:bg-surface-container-low"}`}
            >
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="rounded-lg border border-border-subtle bg-card px-3 py-1.5 text-sm text-foreground">
            <option value="all">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {cases.length === 0 ? (
        <SectionCard title="Cases">
          <EmptyState icon={<Folders className="h-8 w-8" />} title="No cases found" description="Cases matching your filters will appear here." />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={cases} rowKey={(c) => c.id} />
      )}
    </AppShell>
  );
}
