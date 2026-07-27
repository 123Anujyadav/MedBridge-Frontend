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

  const defaultPatients: PatientResponse[] = [
    { id: "p001", first_name: "David", last_name: "Richardson", phone: "+1 (555) 123-4567", date_of_birth: "1985-03-15", gender: "male", blood_type: "O+", height: 178, weight: 82, address: "742 Evergreen Terrace", city: "Springfield", state: "IL", emergency_contact: { name: "Mary Richardson", phone: "+1 555-987-6543", relationship: "Spouse" }, allergies: ["Penicillin", "Shellfish"], chronic_conditions: ["Hypertension", "Type 2 Diabetes"], insurance_provider: "BlueCross BlueShield", health_score: 85, consent_flags: { dataSharing: true, aiProcessing: true } },
    { id: "p002", first_name: "Sarah", last_name: "Mitchell", phone: "+1 (555) 234-5678", date_of_birth: "1990-07-22", gender: "female", blood_type: "A+", height: 165, weight: 58, address: "123 Maple Street", city: "Riverdale", state: "NY", emergency_contact: { name: "James Mitchell", phone: "+1 555-876-5432", relationship: "Brother" }, allergies: ["Latex"], chronic_conditions: ["Asthma"], insurance_provider: "Aetna", health_score: 92, consent_flags: { dataSharing: true, aiProcessing: true } },
    { id: "p003", first_name: "Robert", last_name: "Chen", phone: "+1 (555) 345-6789", date_of_birth: "1972-11-08", gender: "male", blood_type: "B-", height: 172, weight: 75, address: "455 Oak Avenue", city: "Seattle", state: "WA", emergency_contact: { name: "Lisa Chen", phone: "+1 555-765-4321", relationship: "Daughter" }, allergies: ["Aspirin"], chronic_conditions: ["Coronary Heart Disease"], insurance_provider: "Cigna", health_score: 68, consent_flags: { dataSharing: false, aiProcessing: true } },
    { id: "p004", first_name: "Emily", last_name: "Watson", phone: "+1 (555) 456-7890", date_of_birth: "1998-02-14", gender: "female", blood_type: "O-", height: 168, weight: 62, address: "88 Pine Lane", city: "Boston", state: "MA", emergency_contact: { name: "John Watson", phone: "+1 555-654-3210", relationship: "Father" }, allergies: [], chronic_conditions: ["Mild Anemia"], insurance_provider: "UnitedHealth", health_score: 95, consent_flags: { dataSharing: true, aiProcessing: true } },
  ];

  const patients = fetchedPatients.length > 0 ? fetchedPatients : defaultPatients;


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
