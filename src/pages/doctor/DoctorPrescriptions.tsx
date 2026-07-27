import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useDoctorPrescriptions, useWritePrescription } from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import type { PrescriptionResponse } from "@/types/api";
import { Pill, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: prescriptions = [], isLoading, isError, error, refetch } = useDoctorPrescriptions();
  const writePrescription = useWritePrescription();

  const [selected, setSelected] = useState<PrescriptionResponse | null>(null);
  const [showPad, setShowPad] = useState(false);

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search prescriptions...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search prescriptions...">
        <ErrorState title="Failed to Load Prescriptions" description={(error as Error)?.message || "Could not retrieve doctor prescription history."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleCreatePrescription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caseId = formData.get("caseId") as string;
    const patientId = formData.get("patientId") as string;
    const diagnosis = formData.get("diagnosis") as string;
    const notes = formData.get("notes") as string;
    const medName = formData.get("medName") as string;
    const medDosage = formData.get("medDosage") as string;

    if (!caseId || !patientId || !diagnosis) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter Case ID, Patient ID, and Diagnosis." });
      return;
    }

    try {
      await writePrescription.mutateAsync({
        case_id: caseId,
        patient_id: patientId,
        diagnosis,
        notes: notes || "",
        medications: medName
          ? [
              {
                name: medName,
                dosage: medDosage || "1 dose",
                frequency: "Once daily",
                duration: "30 days",
                start_date: new Date().toISOString().split("T")[0],
                end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
              },
            ]
          : [],
      });
      toast({ title: "Prescription Issued", description: "Prescription recorded in database successfully." });
      setShowPad(false);
    } catch {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not record prescription." });
    }
  };

  const columns: Column<PrescriptionResponse>[] = [
    {
      key: "patient_name",
      header: "Patient",
      sortable: true,
      sortValue: (p) => p.patient_name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-semibold text-sm text-primary">
            {p.patient_name ? p.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "PT"}
          </div>
          <p className="font-medium text-foreground">{p.patient_name}</p>
        </div>
      ),
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      render: (p) => <span className="text-body-sm text-muted-foreground line-clamp-1 max-w-xs">{p.diagnosis}</span>,
    },
    {
      key: "medications",
      header: "Medications",
      render: (p) => <span className="text-body-sm font-medium text-foreground">{p.medications?.length || 0} items</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <StatusBadge variant={p.status === "active" ? "success" : "neutral"} dot>{p.status}</StatusBadge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <button onClick={() => setSelected(p)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground hover:bg-surface-container hover:text-primary">
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search prescriptions...">
      <PageHeader
        title="Prescription Center"
        subtitle="Create, review, and manage prescriptions for your patients."
        breadcrumbs={[{ label: "Doctor" }, { label: "Prescriptions" }]}
        actions={
          <button onClick={() => setShowPad(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
            <Pill className="h-4 w-4" /> New Prescription
          </button>
        }
      />

      {prescriptions.length === 0 ? (
        <SectionCard title="Prescriptions">
          <EmptyState icon={<Pill className="h-8 w-8" />} title="No prescriptions issued yet" description="Issued prescriptions will appear here." />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={prescriptions} rowKey={(p) => p.id} onRowClick={(p) => setSelected(p)} />
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-headline text-headline-md text-foreground">{selected.diagnosis}</h2>
                <p className="text-body-sm text-muted-foreground">Patient: {selected.patient_name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>
            {selected.notes && <div className="mb-4 rounded-xl bg-surface-container-low p-4"><p className="text-body-sm text-foreground">{selected.notes}</p></div>}
            <div className="space-y-3">
              {selected.medications?.map((m) => (
                <div key={m.id || m.name} className="rounded-xl border border-border-subtle p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{m.name} {m.dosage}</p>
                    <StatusBadge variant={m.status === "active" ? "success" : "info"}>{m.status}</StatusBadge>
                  </div>
                  <p className="text-body-sm text-muted-foreground mt-1">{m.frequency} • {m.duration}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelected(null)} className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* New Prescription Modal */}
      {showPad && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setShowPad(false)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-headline-md text-foreground">Issue Prescription</h2>
              <button onClick={() => setShowPad(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Case UUID</label>
                  <input name="caseId" required placeholder="Enter Case UUID" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Patient UUID</label>
                  <input name="patientId" required placeholder="Enter Patient UUID" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Diagnosis</label>
                <input name="diagnosis" required placeholder="Primary Diagnosis" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Medication Name</label>
                  <input name="medName" placeholder="e.g. Amoxicillin" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Dosage</label>
                  <input name="medDosage" placeholder="e.g. 500mg" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Doctor Notes</label>
                <textarea name="notes" rows={3} placeholder="Special instructions..." className="w-full resize-none rounded-xl border border-border-subtle bg-card p-3 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={writePrescription.isPending}
                  className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {writePrescription.isPending ? "Issuing..." : "Issue Prescription"}
                </button>
                <button type="button" onClick={() => setShowPad(false)} className="rounded-xl border border-border-subtle px-5 py-3 font-semibold text-foreground">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
