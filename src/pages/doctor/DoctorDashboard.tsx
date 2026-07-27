import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { SectionCard } from "@/components/shared/FilterBar";
import { UrgencyBadge, CaseStatusBadge, AppointmentStatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { useDoctorDashboard, useDoctorAnalytics } from "@/hooks/useDoctor";
import { useToast } from "@/hooks/use-toast";
import doctorService from "@/lib/doctor-service";
import {
  WorkloadPanel, PatientPanel, AIPanel, ReportPanel,
  PrescriptionPanel, AppointmentPanel, ActivityPanel,
} from "@/components/doctor/AnalyticsPanels";
import type { AnalyticsRangePreset } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Folders, Clock, Brain, Calendar, ArrowRight,
  AlertTriangle, FileText, CheckCircle, Bell, Download,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboard, isLoading, isError, error, refetch } = useDoctorDashboard();
  const { toast } = useToast();
  const [range, setRange] = useState<AnalyticsRangePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const analyticsQuery =
    range === "custom" && customFrom && customTo
      ? { range: "custom" as const, date_from: customFrom, date_to: customTo }
      : { range };
  const { data: analytics, isFetching: analyticsFetching } =
    useDoctorAnalytics(analyticsQuery);

  const exportAnalytics = useCallback(
    async (format: "csv" | "pdf") => {
      try {
        const { blob, filename } = await doctorService.exportAnalytics(
          analyticsQuery, format
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        toast({ variant: "destructive", title: "Export Failed",
                description: "Could not export analytics." });
      }
    },
    [analyticsQuery, toast]
  );
  // Chart data comes from real case rows via /doctor/analytics.
  const caseTrend = analytics?.case_trend ?? [];

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients, cases, or codes...">
        <LoadingState rows={4} />
      </AppShell>
    );
  }

  if (isError || !dashboard) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients, cases, or codes...">
        <ErrorState title="Failed to Load Clinician Dashboard" description={(error as Error)?.message || "Could not retrieve doctor portal data."} onRetry={refetch} />
      </AppShell>
    );
  }

  // Real rows only. The previous implementation substituted three invented
  // patients with fabricated symptoms and AI confidence scores whenever the
  // real collections were empty, which put fictional clinical data on a
  // clinician's dashboard. Empty now renders as empty.
  const todayAppointments = dashboard.today_appointments ?? [];
  const pendingCases = dashboard.pending_cases ?? [];
  const summary = analytics?.summary;


  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search patients, cases, or codes...">
      {/* Welcome Banner */}
      <section className="mb-8 flex items-center justify-between rounded-3xl bg-primary p-8 text-primary-foreground">
        <div>
          <h2 className="font-headline text-headline-lg mb-2">Welcome to Clinical Workbench.</h2>
          <p className="text-body-md text-primary-foreground/80">
            You have {pendingCases.length} pending case(s) and {todayAppointments.length} appointment(s) scheduled today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-white/15 px-5 py-3">
          <Brain className="h-8 w-8" />
          <div>
            <p className="text-headline-md font-headline font-semibold">AI Assistant</p>
            <p className="text-body-sm text-primary-foreground/70">Rating: {dashboard.rating}/5.0</p>
          </div>
        </div>
      </section>

      {/* Range filter + export. Same chip styling used across the portal. */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {([
          ["today", "Today"], ["yesterday", "Yesterday"], ["7d", "Last 7 Days"],
          ["30d", "Last 30 Days"], ["90d", "Last 90 Days"], ["custom", "Custom"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setRange(id)}
            className={
              range === id
                ? "rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                : "rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container"
            }
          >
            {label}
          </button>
        ))}
        {range === "custom" && (
          <>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                   className="rounded-xl border border-border-subtle bg-card p-2 text-xs" />
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                   className="rounded-xl border border-border-subtle bg-card p-2 text-xs" />
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {analyticsFetching && (
            <span className="text-xs text-muted-foreground">Updating...</span>
          )}
          <button type="button" onClick={() => exportAnalytics("csv")}
                  className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button type="button" onClick={() => exportAnalytics("pdf")}
                  className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container">
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Summary cards — all real aggregates from /doctor/analytics. */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Appointments" value={summary?.todays_appointments ?? dashboard.today_appointments?.length ?? 0} icon={Calendar} accent="tertiary" />
        <StatCard label="Pending AI Reviews" value={summary?.pending_ai_reviews ?? 0} icon={Brain} accent="primary" />
        <StatCard label="Completed Consultations" value={summary?.completed_consultations ?? 0} icon={CheckCircle} accent="success" />
        <StatCard label="Pending Reports" value={summary?.pending_reports ?? 0} icon={FileText} accent="secondary" />
        <StatCard label="Critical Cases" value={summary?.critical_cases ?? 0} icon={AlertTriangle} accent="primary" />
        <StatCard label="Follow-up Cases" value={summary?.follow_up_cases ?? 0} icon={Folders} accent="tertiary" />
        <StatCard label="Patients Seen Today" value={summary?.patients_seen_today ?? 0} icon={Users} accent="success" />
        <StatCard label="Unread Notifications" value={summary?.unread_notifications ?? 0} icon={Bell} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Case Trends */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Case Volume Trends" subtitle="Monthly case intake and resolution telemetry">
            {caseTrend.length === 0 ? (
              <EmptyState
                icon={<Folders className="h-8 w-8" />}
                title="No case history yet"
                description="Monthly case volume appears here once you have assigned cases."
              />
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={caseTrend}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00685f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00685f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6bd8cb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6bd8cb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Area type="monotone" dataKey="cases" stroke="#00685f" strokeWidth={2} fill="url(#colorCases)" name="New Cases" />
                <Area type="monotone" dataKey="resolved" stroke="#6bd8cb" strokeWidth={2} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Pending Case Queue */}
          <SectionCard
            title="Pending Consultation Queue"
            subtitle="Cases requiring clinician diagnosis and review"
            actions={<button onClick={() => navigate("/doctor/cases")} className="text-sm font-semibold text-primary hover:underline">View all</button>}
          >
            {pendingCases.length === 0 ? (
              <EmptyState icon={<Folders className="h-8 w-8" />} title="No pending cases" description="Consultation cases assigned to you will appear here." />
            ) : (
              <div className="space-y-3">
                {pendingCases.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-border-subtle p-4 transition-all hover:bg-surface-container-low">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                        {c.patient_name ? c.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "PT"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{c.patient_name}</p>
                        <p className="text-body-sm text-muted-foreground">{c.symptom_summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <UrgencyBadge level={c.urgency_level} />
                      <CaseStatusBadge status={c.status} />
                      <button onClick={() => navigate("/doctor/consultation")} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90">
                        Open <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Specialty Distribution */}
          <SectionCard title="Patient Adherence Rate" subtitle="Calculated across active prescriptions">
            <div className="text-center py-4">
              <p className="font-headline text-display-lg text-primary">{typeof analytics?.adherence_rate === "number" ? `${analytics.adherence_rate}%` : "—"}</p>
              <p className="text-body-sm text-muted-foreground mt-1">Patient Medication Compliance Index</p>
            </div>
          </SectionCard>

          {/* Today's Schedule */}
          <SectionCard title="Today's Schedule" actions={<button onClick={() => navigate("/doctor/schedule")} className="text-sm font-semibold text-primary hover:underline">View schedule</button>}>
            {todayAppointments.length === 0 ? (
              <EmptyState icon={<Calendar className="h-8 w-8" />} title="No appointments scheduled today" />
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 4).map((apt) => (
                  <div key={apt.id} className="rounded-xl border border-border-subtle p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground text-sm">{apt.patient_name}</p>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>
                    <p className="text-body-sm text-muted-foreground">{apt.time} • {apt.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Enterprise analytics. Rendered only when the backend returned them. */}
      {/* Each panel guards its own section rather than assuming the backend
          always returns the whole set together. */}
      <div className="mt-6 space-y-6">
        {analytics?.workload && <WorkloadPanel data={analytics.workload} />}
        {analytics?.patients && <PatientPanel data={analytics.patients} />}
        {(analytics?.ai || analytics?.reports) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {analytics?.ai && <AIPanel data={analytics.ai} />}
            {analytics?.reports && <ReportPanel data={analytics.reports} />}
          </div>
        )}
        {(analytics?.prescriptions || analytics?.appointments) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {analytics?.prescriptions && <PrescriptionPanel data={analytics.prescriptions} />}
            {analytics?.appointments && <AppointmentPanel data={analytics.appointments} />}
          </div>
        )}
        {analytics?.activity && <ActivityPanel events={analytics.activity} />}
      </div>
    </AppShell>
  );
}