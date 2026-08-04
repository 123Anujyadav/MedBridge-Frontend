import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, TimelineItem } from "@/components/shared/FilterBar";
import { UrgencyBadge, CaseStatusBadge, StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/States";
import { useDoctorCases, useDiagnoseCase, useUpdateCaseNotes, useWritePrescription, useCompleteConsultation } from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import { Brain, FileText, Mic, Pill, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorConsultation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: cases = [], isLoading, isError, error, refetch } = useDoctorCases();
  const diagnoseCase = useDiagnoseCase();
  const updateNotes = useUpdateCaseNotes();
  const writePrescription = useWritePrescription();
  // Must sit with the other hooks, above every early return below. It used to
  // be declared further down, next to the handler that uses it, which meant
  // the loading and empty branches returned before reaching it — the hook
  // count then changed the moment a case arrived, and React refuses to render
  // when that happens.
  const completeConsultation = useCompleteConsultation();

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptionMode, setPrescriptionMode] = useState<"structured" | "text">("structured");
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("");

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search...">
        <ErrorState title="Failed to Load Consultation Queue" description={(error as Error)?.message || "Could not fetch consultation workbench."} onRetry={refetch} />
      </AppShell>
    );
  }

  const activeCase = cases.find((c) => c.status === "in_consultation" || c.status === "routed" || c.status === "intake") || cases[0];

  if (!activeCase) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search...">
        <PageHeader title="Consultation Workspace" breadcrumbs={[{ label: "Doctor" }, { label: "Consultation" }]} />
        <SectionCard title="No Active Case">
          <EmptyState icon={<Brain className="h-8 w-8" />} title="No active cases assigned" description="Assigned cases will appear here for clinical diagnosis." />
        </SectionCard>
      </AppShell>
    );
  }

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    try {
      await updateNotes.mutateAsync({ id: activeCase.id, notesIn: { notes } });
      toast({ title: "Notes Saved", description: "Progress notes saved to case." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not save progress notes." });
    }
  };

  const handleFinalizeDiagnosis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast({ variant: "destructive", title: "Missing Field", description: "Please enter a diagnosis." });
      return;
    }

    try {
      const meds = medName && medDosage ? [{
        name: medName,
        dosage: medDosage,
        frequency: medFrequency || "Once daily",
        duration: "30 days",
        special_instructions: "Take with water after meals."
      }] : [];

      if (medName && medDosage) {
        await writePrescription.mutateAsync({
          case_id: activeCase.id,
          patient_id: activeCase.patient_id,
          diagnosis,
          notes,
          medications: [
            {
              name: medName,
              dosage: medDosage,
              frequency: medFrequency || "Once daily",
              duration: "30 days",
              start_date: new Date().toISOString().split("T")[0],
              end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
            },
          ],
        });
      }

      const reportRes = await completeConsultation.mutateAsync({
        case_id: activeCase.id,
        diagnosis,
        clinical_notes: notes || "Patient presented symptoms. Clinical examination completed.",
        medications: meds,
        recommended_tests: ["Blood Panel", "Vital Follow-up"],
        follow_up_date: "14 days",
        doctor_remarks: "Maintain medication compliance. Contact clinic if symptoms persist."
      });

      toast({
        title: "Consultation Completed & PDF Report Generated",
        description: `Official PDF report created (${reportRes.file_size}). Synced to Patient & Admin portals.`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Submit Error", description: (err as Error)?.message || "Could not finalize consultation case." });
    }
  };


  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients...">
      <PageHeader
        title="Consultation Workspace"
        subtitle={`Case #${activeCase.id.slice(0, 8)} — ${activeCase.patient_name}`}
        breadcrumbs={[{ label: "Doctor" }, { label: "Cases" }, { label: "Consultation" }]}
        actions={
          <div className="flex items-center gap-3">
            <UrgencyBadge level={activeCase.urgency_level} />
            <CaseStatusBadge status={activeCase.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Patient & AI Information */}
        <div className="space-y-6">
          <SectionCard title="Patient Profile Summary">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary">
                  {activeCase.patient_name ? activeCase.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "PT"}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{activeCase.patient_name}</p>
                  <p className="text-body-sm text-muted-foreground">{activeCase.patient_age}y • {activeCase.patient_gender}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="AI Clinical Summary" actions={<StatusBadge variant="info" dot>AI Confidence: {Math.round((activeCase.ai_confidence_score || 0.8) * 100)}%</StatusBadge>}>
            <div className="space-y-3">
              <div className="rounded-xl bg-accent p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <p className="text-body-sm font-semibold text-primary">AI Extracted Symptoms</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeCase.ai_extracted_symptoms?.map((s, i) => (
                    <span key={i} className="rounded-full bg-card px-2.5 py-1 text-xs font-medium text-primary">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Symptom Telemetry</p>
                <p className="text-body-sm text-foreground">{activeCase.symptom_summary}</p>
              </div>
              {activeCase.ai_specialty_recommendation && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">AI Recommended Specialty</p>
                  <p className="text-body-sm font-semibold text-primary">{activeCase.ai_specialty_recommendation}</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Center/Right Column: Diagnosis & Prescription Pad */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Prescription & Diagnosis Pad" subtitle="Record clinical diagnosis and treatment instructions directly to PostgreSQL">
            <form onSubmit={handleFinalizeDiagnosis} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Clinical Diagnosis</label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  placeholder="Enter primary medical diagnosis (e.g. Acute Hypertension)..."
                  className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-body-md transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Medication Details */}
              <div className="rounded-2xl border border-border-subtle p-5 space-y-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" /> Issue Medication
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Medicine Name</label>
                    <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g. Lisinopril" className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Dosage</label>
                    <input value={medDosage} onChange={(e) => setMedDosage(e.target.value)} placeholder="e.g. 10mg" className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                    <input value={medFrequency} onChange={(e) => setMedFrequency(e.target.value)} placeholder="e.g. Once daily in morning" className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Clinical Progress Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Append clinical observation and progress notes..."
                  className="w-full resize-none rounded-xl border border-border-subtle bg-card p-4 text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={diagnoseCase.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {diagnoseCase.isPending ? "Finalizing..." : "Finalize Diagnosis & Issue Prescription"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={updateNotes.isPending}
                  className="rounded-xl border border-border-subtle px-5 py-3.5 font-semibold text-foreground hover:bg-surface-container-low"
                >
                  Save Notes Only
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
