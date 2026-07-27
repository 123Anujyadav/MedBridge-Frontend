import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { useDoctorPatients } from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import type { PatientResponse } from "@/types/api";
import { Users } from "lucide-react";

export default function DoctorPatients() {
  const { user } = useAuth();
  const { data: fetchedPatients = [], isLoading, isError, error, refetch } = useDoctorPatients();

  // Patients come only from the doctor's real caseload. Placeholder records used
  // to render when there were none, and their ids ("p001", …) resolved to no
  // patient — so opening one loaded an empty chart.
  const patients = fetchedPatients;


  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients...">
        <ErrorState title="Failed to Load Patients" description={(error as Error)?.message || "Could not retrieve patient list."} onRetry={refetch} />
      </AppShell>
    );
  }

  const columns: Column<PatientResponse>[] = [
    {
      key: "first_name",
      header: "Patient",
      sortable: true,
      sortValue: (p) => `${p.first_name} ${p.last_name}`,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-semibold text-sm text-primary">
            {p.first_name ? p.first_name[0] : ""}{p.last_name ? p.last_name[0] : ""}
          </div>
          <div>
            <p className="font-medium text-foreground">{p.first_name} {p.last_name}</p>
            <p className="text-xs text-muted-foreground">{p.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date_of_birth",
      header: "DOB / Gender",
      sortable: true,
      sortValue: (p) => p.date_of_birth,
      render: (p) => <span className="text-body-sm">{p.date_of_birth} • {p.gender}</span>,
    },
    {
      key: "blood_type",
      header: "Blood Type",
      render: (p) => <span className="text-body-sm font-medium">{p.blood_type || "N/A"}</span>,
    },
    {
      key: "health_score",
      header: "Health Score",
      sortable: true,
      sortValue: (p) => p.health_score,
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-container">
            <div className={`h-full ${p.health_score >= 80 ? "bg-success" : p.health_score >= 60 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${p.health_score}%` }} />
          </div>
          <span className="text-body-sm font-medium">{p.health_score}</span>
        </div>
      ),
    },
    {
      key: "allergies",
      header: "Allergies",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.allergies?.slice(0, 2).map((c) => (
            <span key={c} className="rounded-md bg-error-soft px-2 py-0.5 text-xs font-medium text-error-edge">{c}</span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients...">
      <PageHeader
        title="Assigned Patients"
        subtitle="Longitudinal patient directory — view patients consulting under your care."
        breadcrumbs={[{ label: "Doctor" }, { label: "Patients" }]}
      />

      {patients.length === 0 ? (
        <SectionCard title="Patients Directory">
          <EmptyState icon={<Users className="h-8 w-8" />} title="No assigned patients" description="Patients consulting with you will appear here." />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={patients} rowKey={(p) => p.id} />
      )}
    </AppShell>
  );
}
