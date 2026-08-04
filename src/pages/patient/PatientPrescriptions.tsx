import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientPrescriptions } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import type { PrescriptionResponse } from "@/types/api";
import { Pill, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function PatientPrescriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: prescriptions = [], isLoading, isError, error, refetch } = usePatientPrescriptions();
  const [selected, setSelected] = useState<PrescriptionResponse | null>(null);

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search prescriptions...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search prescriptions...">
        <ErrorState title="Failed to Load Prescriptions" description={(error as Error)?.message || "Could not retrieve medical prescriptions."} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search prescriptions...">
      <PageHeader
        title="Prescription Center"
        subtitle="View your medical prescriptions, medication details, and treatment plans."
        breadcrumbs={[{ label: "Patient" }, { label: "Prescriptions" }]}
      />

      {prescriptions.length === 0 ? (
        <SectionCard title="Your Prescriptions">
          <EmptyState icon={<Pill className="h-8 w-8" />} title="No prescriptions yet" description="Your issued prescriptions will appear here after a doctor consultation." />
        </SectionCard>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="premium-card p-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-headline text-headline-md text-foreground">{rx.diagnosis}</h3>
                  </div>
                  <p className="mt-1 text-body-sm text-muted-foreground">Prescribed by {rx.doctor_name || "Doctor"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge variant={rx.status === "active" ? "success" : "neutral"} dot>
                    {rx.status}
                  </StatusBadge>
                  {/* Opens the full page: prescriber card, AI safety review,
                      printable PDF and pharmacy ordering. The lightweight modal
                      below is kept as the quick peek it always was. */}
                  <button
                    onClick={() => navigate(`/patient/prescriptions/${rx.id}`)}
                    className="rounded-lg border border-border-subtle px-3 py-1.5 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container hover:text-primary"
                  >
                    Open
                  </button>
                  <button onClick={() => setSelected(rx)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground transition-all hover:bg-surface-container hover:text-primary">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notes */}
              {rx.notes && (
                <div className="mt-4 rounded-xl bg-surface-container-low p-4">
                  <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Doctor's Clinical Notes</p>
                  <p className="text-body-sm text-foreground">{rx.notes}</p>
                </div>
              )}

              {/* Medications */}
              <div className="mt-4 space-y-3">
                <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">Prescribed Medications</p>
                {rx.medications && rx.medications.length > 0 ? (
                  rx.medications.map((med) => (
                    <div key={med.id || med.name} className="rounded-xl border border-border-subtle p-4 transition-all hover:bg-surface-container-low/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Pill className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{med.name} <span className="text-primary">{med.dosage}</span></p>
                            {med.generic_name && <p className="text-body-sm text-muted-foreground">{med.generic_name}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {med.frequency}</span>
                              <span>•</span>
                              <span>{med.duration}</span>
                              {med.special_instructions && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium text-primary">{med.special_instructions}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {(med.side_effects?.length > 0 || med.interactions?.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {med.side_effects?.length > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
                              <AlertCircle className="h-3 w-3" /> Side effects: {med.side_effects.join(", ")}
                            </div>
                          )}
                          {med.interactions?.length > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-error-soft px-2.5 py-1 text-xs font-medium text-error-edge">
                              <AlertCircle className="h-3 w-3" /> Interactions: {med.interactions.join(", ")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-muted-foreground">No specific medication items listed.</p>
                )}
              </div>

              {/* Follow-up */}
              {rx.follow_up_date && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/5 p-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="text-body-sm text-foreground">Recommended Follow-Up Date: <span className="font-semibold">{rx.follow_up_date}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-headline text-headline-lg text-foreground">{selected.diagnosis}</h2>
                <p className="mt-1 text-body-sm text-muted-foreground">Issued by {selected.doctor_name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">✕</button>
            </div>
            <div className="space-y-4">
              {selected.medications?.map((med) => (
                <div key={med.id || med.name} className="rounded-xl border border-border-subtle p-4">
                  <p className="font-semibold text-foreground">{med.name} {med.dosage}</p>
                  <p className="text-body-sm text-muted-foreground">{med.frequency} • {med.duration}</p>
                  <p className="text-body-sm text-primary mt-1">{med.special_instructions}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelected(null)} className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground">Close</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
