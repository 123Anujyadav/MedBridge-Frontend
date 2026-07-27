import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, TimelineItem } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientProfile, usePatientPrescriptions, usePatientReports } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { Heart, Pill, FileText, AlertTriangle } from "lucide-react";

export default function PatientHistory() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, error: profileErr, refetch } = usePatientProfile();
  const { data: prescriptions = [], isLoading: isRxLoading } = usePatientPrescriptions();
  const { data: reports = [], isLoading: isReportsLoading } = usePatientReports();

  if (isProfileLoading || isRxLoading || isReportsLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medical history...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isProfileError || !profile) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medical history...">
        <ErrorState title="Failed to Load Medical History" description={(profileErr as Error)?.message || "Could not retrieve medical history records."} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell portal="patient" userName={`${profile.first_name} ${profile.last_name}`} userRole="Patient Portal" searchPlaceholder="Search medical history...">
      <PageHeader
        title="Medical History"
        subtitle="Your complete longitudinal health record — prescriptions, reports, and clinical profile."
        breadcrumbs={[{ label: "Patient" }, { label: "Medical History" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Patient Summary */}
        <div className="space-y-6">
          <SectionCard title="Clinical Profile Summary">
            <div className="space-y-3 text-body-sm">
              {/* Every value is the patient's own record. Placeholder vitals and
                  a stand-in insurer used to fill these gaps, which presented
                  invented clinical facts as though they were this patient's. */}
              <div className="flex justify-between"><span className="text-muted-foreground">Blood Type</span><span className="font-semibold text-foreground">{profile.blood_type || "Not recorded"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Height</span><span className="font-semibold text-foreground">{profile.height ? `${profile.height} cm` : "Not recorded"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-semibold text-foreground">{profile.weight ? `${profile.weight} kg` : "Not recorded"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span className="font-semibold text-foreground">{profile.date_of_birth || "Not recorded"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span className="font-semibold text-foreground">{profile.insurance_provider || "Not recorded"}</span></div>
            </div>
          </SectionCard>

          <SectionCard title="Known Allergies">
            {/* Never substituted: a fabricated allergy list is a clinical safety
                problem, and an empty list must read as "none recorded" rather
                than as two allergies this patient may not have. */}
            {profile.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((allergy) => (
                <div key={allergy} className="flex items-center gap-2 rounded-xl bg-error-soft p-3 mb-2">
                  <AlertTriangle className="h-4 w-4 text-error-edge" />
                  <span className="text-body-sm font-medium text-error-edge">{allergy}</span>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-muted-foreground">No allergies recorded.</p>
            )}
          </SectionCard>

          <SectionCard title="Chronic Conditions">
            {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
              profile.chronic_conditions.map((cond) => (
                <div key={cond} className="flex items-center gap-2 rounded-xl bg-warning-soft p-3 mb-2">
                  <Heart className="h-4 w-4 text-warning" />
                  <span className="text-body-sm font-medium text-warning">{cond}</span>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-muted-foreground">No chronic conditions recorded.</p>
            )}
          </SectionCard>

        </div>

        {/* Right: History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Health Events Timeline" subtitle="Chronological clinical records">
            <div className="space-y-1">
              <TimelineItem title="Account & Health Profile Created" timestamp={profile.date_of_birth} description="Registered in MedBridge Enterprise Database" status="success" />
              {prescriptions.map((rx, i) => (
                <TimelineItem
                  key={rx.id}
                  title={`Prescription: ${rx.diagnosis}`}
                  timestamp="Clinical Record"
                  description={`Doctor: ${rx.doctor_name} • ${rx.medications?.length || 0} medication(s)`}
                  status="info"
                  isLast={i === prescriptions.length - 1 && reports.length === 0}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Prescription History">
            {prescriptions.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No prescriptions issued yet</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-xl border border-border-subtle p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{rx.diagnosis}</p>
                      <StatusBadge variant="success" dot>{rx.status}</StatusBadge>
                    </div>
                    <p className="text-body-sm text-muted-foreground">{rx.doctor_name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rx.medications?.map((m) => (
                        <span key={m.id || m.name} className="rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-foreground">
                          {m.name} {m.dosage}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Report History">
            {reports.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No reports generated yet</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    {r.ai_generated && <StatusBadge variant="info">AI Report</StatusBadge>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
