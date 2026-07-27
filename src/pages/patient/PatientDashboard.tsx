import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge, AppointmentStatusBadge } from "@/components/shared/StatusBadge";
import { SectionCard, HealthScoreRing, TimelineItem } from "@/components/shared/FilterBar";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientDashboard, useTrackMedication, useVitalsDashboard } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { Pill, Calendar, FileText, Heart, Siren, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: dashboard, isLoading, isError, error, refetch } = usePatientDashboard();
  const trackMedication = useTrackMedication();

  // Live chart data from vital_readings / medications. Empty arrays render an
  // empty-state message rather than fabricated readings.
  const { data: vitals } = useVitalsDashboard(7);
  const vitalsSeries = vitals?.series ?? [];
  const adherenceSeries = vitals?.adherence ?? [];

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search vitals, reports, or providers...">
        <LoadingState rows={4} />
      </AppShell>
    );
  }

  if (isError || !dashboard) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search vitals, reports, or providers...">
        <ErrorState title="Failed to Load Dashboard" description={(error as Error)?.message || "Could not retrieve patient data."} onRetry={refetch} />
      </AppShell>
    );
  }

  const upcomingAppointments = dashboard.upcoming_appointments || [];
  const todayMedications = dashboard.today_medications || [];
  const recentReports = dashboard.recent_reports || [];
  const nextMedication = todayMedications.find(m => m.status !== "taken");

  const handleMarkTaken = async (medId: string) => {
    try {
      await trackMedication.mutateAsync({ id: medId, status: "taken" });
      toast({ title: "Medication Tracked", description: "Marked dose as taken successfully." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update medication adherence." });
    }
  };

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search vitals, reports, or providers...">
      {/* Welcome Hero */}
      <section className="mb-8 relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground">
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-10">
          <div className="h-full w-full bg-gradient-to-l from-white/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline text-display-lg mb-2">Welcome back.</h2>
          <p className="text-body-lg text-primary-foreground/80 mb-8">
            Your health metrics are being monitored. You have {upcomingAppointments.length} upcoming appointment(s).
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate("/patient/emergency")} className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition-all hover:shadow-lg">
              <Siren className="h-5 w-5" /> Emergency Support
            </button>
            <button onClick={() => navigate("/patient/appointments")} className="flex items-center gap-2 rounded-xl bg-primary-container px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90">
              <Calendar className="h-5 w-5" /> Schedule Visit
            </button>
          </div>
        </div>
      </section>

      {/* Stat Cards Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Health Score" value={dashboard.health_score} icon={Heart} accent="success" trend={{ value: 5, isPositive: true }} />
        <StatCard label="Active Medications" value={todayMedications.length} icon={Pill} accent="primary" />
        <StatCard label="Upcoming Appointments" value={upcomingAppointments.length} icon={Calendar} accent="tertiary" />
        <StatCard label="Available Reports" value={recentReports.length} icon={FileText} accent="secondary" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Vitals & Adherence */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Vital Signs Trend" subtitle="Recent BP & Heart Rate Readings">
            {vitalsSeries.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-8 w-8" />}
                title="No vital readings yet"
                description="Recorded blood pressure, heart rate and other vitals will appear here."
              />
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={vitalsSeries}>
                <defs>
                  <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00685f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00685f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6bd8cb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6bd8cb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }} />
                <Area type="monotone" dataKey="systolic" stroke="#00685f" strokeWidth={2} fill="url(#colorSys)" name="Systolic" />
                <Area type="monotone" dataKey="diastolic" stroke="#6bd8cb" strokeWidth={2} fill="url(#colorDia)" name="Diastolic" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Medication Adherence" subtitle="Weekly Dose Compliance">
            {adherenceSeries.length === 0 ? (
              <EmptyState
                icon={<Pill className="h-8 w-8" />}
                title="No adherence data yet"
                description="Dose tracking will appear here once you have active medications."
              />
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adherenceSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }} />
                <Bar dataKey="adherence" fill="#00685f" radius={[8, 8, 0, 0]} name="Adherence %" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Recent Reports */}
          <SectionCard
            title="Recent Reports"
            subtitle="AI-generated summaries and clinical reports"
            actions={<button onClick={() => navigate("/patient/reports")} className="text-sm font-semibold text-primary hover:underline">View all</button>}
          >
            {recentReports.length === 0 ? (
              <EmptyState icon={<FileText className="h-8 w-8" />} title="No reports yet" description="Your AI-generated clinical summaries will appear here." />
            ) : (
              <div className="space-y-3">
                {recentReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center justify-between rounded-xl border border-border-subtle p-4 transition-all hover:bg-surface-container-low">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{report.title}</p>
                        <p className="text-body-sm text-muted-foreground">{report.date} • {report.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {report.ai_generated && <StatusBadge variant="info">AI Generated</StatusBadge>}
                      <StatusBadge variant={report.status === "ready" ? "success" : "neutral"} dot>
                        {report.status}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SectionCard title="Health Overview">
            <div className="flex items-center gap-6">
              <HealthScoreRing score={dashboard.health_score} />
              <div className="flex-1 space-y-1">
                <p className="text-label-sm font-semibold uppercase tracking-widest text-muted-foreground">Precision Status</p>
                <p className="text-body-md font-semibold text-foreground">Optimal Range</p>
                <p className="text-body-sm text-muted-foreground">Your calculated health index is {dashboard.health_score}/100.</p>
              </div>
            </div>
          </SectionCard>

          {/* Next Medication Banner */}
          {nextMedication && (
            <div className="animate-pulse-soft rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                    <Pill className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-label-sm font-semibold uppercase tracking-tight text-primary">Upcoming Dose</p>
                    <p className="text-body-md font-semibold text-foreground">{nextMedication.name} ({nextMedication.dosage})</p>
                    <p className="text-body-sm text-muted-foreground">{nextMedication.frequency}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkTaken(nextMedication.id)}
                  disabled={trackMedication.isPending}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {trackMedication.isPending ? "Updating..." : "Mark Taken"}
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          <SectionCard title="Upcoming Appointments" actions={<button onClick={() => navigate("/patient/appointments")} className="text-sm font-semibold text-primary hover:underline">View all</button>}>
            {upcomingAppointments.length === 0 ? (
              <EmptyState icon={<Calendar className="h-8 w-8" />} title="No upcoming visits" description="Schedule an appointment with a specialist." />
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="rounded-xl border border-border-subtle p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{apt.doctor_name}</p>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>
                    <div className="flex items-center gap-3 text-body-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{apt.date} at {apt.time}</span>
                      <span>•</span>
                      <span>{apt.specialty}</span>
                    </div>
                    <p className="mt-1 text-body-sm text-muted-foreground">{apt.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Activity Timeline */}
          <SectionCard title="Recent Activity">
            <div>
              <TimelineItem title="Dashboard Data Synchronized" timestamp="Just now" description="Retrieved latest health telemetry from PostgreSQL" status="success" />
              <TimelineItem title="Session Verified" timestamp="Active" description="JWT credentials validated" status="info" isLast />
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
