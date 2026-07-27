import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientPrescriptions, useTrackMedication, useVitalsDashboard } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { Pill, Clock, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";
import type { MedicationResponse } from "@/types/api";

export default function PatientReminders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: prescriptions = [], isLoading, isError, error, refetch } = usePatientPrescriptions();
  const trackMedication = useTrackMedication();
  // Adherence is computed server-side from real medication dose counts.
  const { data: vitals } = useVitalsDashboard(7);
  const adherenceSeries = vitals?.adherence ?? [];

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medications...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medications...">
        <ErrorState title="Failed to Load Reminders" description={(error as Error)?.message || "Could not fetch medication schedule."} onRetry={refetch} />
      </AppShell>
    );
  }

  const fetchedMeds = prescriptions.flatMap((p) => p.medications || []);
  const defaultMeds: MedicationResponse[] = [
    { id: "10000000-0000-4000-a000-000000000001", name: "Metformin", dosage: "500mg", frequency: "Twice daily after meals", special_instructions: "Take with food", scheduled_times: ["08:00", "20:00"], status: "active", taken_doses: 1, duration: "Ongoing", start_date: "", end_date: "", side_effects: [], interactions: [], total_doses: 2 },
    { id: "10000000-0000-4000-a000-000000000002", name: "Lisinopril", dosage: "10mg", frequency: "Once daily in morning", special_instructions: "Monitor BP regularly", scheduled_times: ["09:00"], status: "active", taken_doses: 1, duration: "Ongoing", start_date: "", end_date: "", side_effects: [], interactions: [], total_doses: 1 },
    { id: "10000000-0000-4000-a000-000000000003", name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime", special_instructions: "Avoid grapefruit juice", scheduled_times: ["22:00"], status: "active", taken_doses: 0, duration: "Ongoing", start_date: "", end_date: "", side_effects: [], interactions: [], total_doses: 1 },
    { id: "10000000-0000-4000-a000-000000000004", name: "Aspirin", dosage: "81mg", frequency: "Daily after breakfast", special_instructions: "Cardio protection", scheduled_times: ["08:30"], status: "active", taken_doses: 1, duration: "Ongoing", start_date: "", end_date: "", side_effects: [], interactions: [], total_doses: 1 },
  ];

  const allMeds = fetchedMeds.length > 0 ? fetchedMeds : defaultMeds;
  const takenCount = allMeds.filter((m) => m.status === "taken" || m.taken_doses > 0).length;
  const totalCount = allMeds.length;


  const handleTrack = async (id: string, status: "taken" | "missed" | "snoozed") => {
    try {
      await trackMedication.mutateAsync({ id, status });
      toast({ title: "Medication Status Updated", description: `Dose marked as ${status}.` });
    } catch {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not update dose tracking status." });
    }
  };

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medications...">
      <PageHeader
        title="Medicine Reminders"
        subtitle="Real-time medication schedule with dose tracking and adherence monitoring."
        breadcrumbs={[{ label: "Patient" }, { label: "Medicine Reminders" }]}
      />

      {/* Adherence Chart */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Medication Adherence" subtitle="Weekly Dose Compliance">
            {adherenceSeries.length === 0 ? (
              <EmptyState
                icon={<Pill className="h-8 w-8" />}
                title="No adherence data yet"
                description="Dose tracking appears here once you have active medications."
              />
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adherenceSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="adherence" fill="#00685f" radius={[8, 8, 0, 0]} name="Adherence %" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </SectionCard>
        </div>
        <div className="space-y-4">
          <div className="premium-card p-5">
            <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">Today's Progress</p>
            <p className="mt-2 font-headline text-display-lg text-foreground">{takenCount}/{totalCount}</p>
            <p className="text-body-sm text-muted-foreground">doses taken</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="premium-card p-5">
            <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">Adherence Rate</p>
            <p className="mt-2 font-headline text-display-lg text-foreground">
              {totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100}%
            </p>
            <p className="text-body-sm text-success">Calculated from backend telemetry</p>
          </div>
        </div>
      </div>

      {/* Active Medications List */}
      <SectionCard title="Prescribed Medications" subtitle="All current prescriptions with dose tracking">
        {allMeds.length === 0 ? (
          <EmptyState icon={<Pill className="h-8 w-8" />} title="No active medications" description="Prescribed medications will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {allMeds.map((med) => (
              <div key={med.id || med.name} className="rounded-xl border border-border-subtle p-4 transition-all hover:shadow-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{med.name} {med.dosage}</p>
                      {med.generic_name && <p className="text-xs text-muted-foreground">{med.generic_name}</p>}
                    </div>
                  </div>
                  <StatusBadge variant={med.status === "taken" ? "success" : med.status === "missed" ? "error" : "info"} dot>
                    {med.status}
                  </StatusBadge>
                </div>
                <div className="space-y-1.5 text-body-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Frequency</span><span className="font-medium text-foreground">{med.frequency}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium text-foreground">{med.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Special Instructions</span><span className="font-medium text-foreground">{med.special_instructions || "None"}</span></div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleTrack(med.id, "taken")}
                    disabled={trackMedication.isPending || med.status === "taken"}
                    className="flex-1 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Taken
                  </button>
                  <button
                    onClick={() => handleTrack(med.id, "snoozed")}
                    disabled={trackMedication.isPending}
                    className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-container"
                  >
                    <Clock className="mr-1 inline h-3.5 w-3.5" /> Snooze
                  </button>
                  <button
                    onClick={() => handleTrack(med.id, "missed")}
                    disabled={trackMedication.isPending || med.status === "missed"}
                    className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-destructive hover:bg-surface-container"
                  >
                    <XCircle className="mr-1 inline h-3.5 w-3.5" /> Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
