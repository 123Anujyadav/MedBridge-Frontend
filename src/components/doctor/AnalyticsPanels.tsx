// ============================================
// Doctor Analytics Panels
//
// Every figure here comes from a real aggregate over the doctor's own rows.
// The two rules the components enforce structurally:
//
//   * A null metric renders "Not measured", never 0. A zero is a measurement;
//     "we never recorded this" is a different statement and a clinician must be
//     able to tell them apart.
//   * A chart renders only when there is enough real data to plot. An empty
//     axis implies a measured absence that may not exist.
//
// Built from existing tokens: premium-card, SectionCard, StatCard, StatusBadge,
// EmptyState and the portal's Recharts palette. No new design tokens.
// ============================================
import { memo } from "react";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/States";
import type {
  AnalyticsAI,
  AnalyticsAppointments,
  AnalyticsActivityEvent,
  AnalyticsPatients,
  AnalyticsPrescriptions,
  AnalyticsReports,
  AnalyticsWorkload,
  NamedCount,
} from "@/types/api";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, BarChart3 } from "lucide-react";

const PALETTE = ["#00685f", "#6bd8cb", "#D97706", "#DC2626", "#2563EB", "#7C3AED"];

const NOT_MEASURED = "Not measured";

/** A metric that distinguishes "zero" from "never measured". */
function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
}) {
  const missing = value === null || value === undefined;
  return (
    <div className="rounded-xl border border-border-subtle p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          missing
            ? "mt-1 text-sm text-muted-foreground"
            : "mt-1 font-headline text-headline-md font-semibold text-foreground"
        }
      >
        {missing ? NOT_MEASURED : `${value}${suffix}`}
      </p>
    </div>
  );
}

/** A ranked list, or an honest empty state. */
function RankedList({ items, empty }: { items: NamedCount[]; empty: string }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center justify-between text-xs">
            <span className="truncate text-foreground">{item.name}</span>
            <span className="font-medium text-muted-foreground">{item.value}</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-surface-container">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Bar chart, rendered only when there is something real to plot. */
function CountBar({ data, empty }: { data: NamedCount[]; empty: string }) {
  if (!data?.length) {
    return <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No Data Available" description={empty} />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6d7a77" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
        <Bar dataKey="value" fill="#00685f" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Donut. Two or more slices, else the list conveys it better. */
function CountDonut({ data, empty }: { data: NamedCount[]; empty: string }) {
  if (!data?.length) {
    return <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No Data Available" description={empty} />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Panels ───────────────────────────────────────────────────────────────────

export const WorkloadPanel = memo(function WorkloadPanel({ data }: { data: AnalyticsWorkload }) {
  return (
    <SectionCard title="Clinical Workload" subtitle="Case throughput and turnaround for the selected period">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Metric label="Cases Opened" value={data.cases_opened} />
        <Metric label="Cases Completed" value={data.cases_completed} />
        <Metric label="Pending Cases" value={data.pending_cases} />
        <Metric label="Avg Consultation" value={data.avg_consultation_minutes} suffix=" min" />
        <Metric label="Avg Review Time" value={data.avg_review_minutes} suffix=" min" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cases by Specialty</p>
          <CountBar data={data.cases_by_specialty} empty="No cases opened in this period." />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cases by Urgency</p>
          <CountDonut data={data.cases_by_urgency} empty="No cases opened in this period." />
        </div>
      </div>
    </SectionCard>
  );
});

export const PatientPanel = memo(function PatientPanel({ data }: { data: AnalyticsPatients }) {
  return (
    <SectionCard title="Patient Analytics" subtitle="Demographics and presenting patterns across your caseload">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Metric label="New Patients" value={data.new_patients} />
        <Metric label="Returning Patients" value={data.returning_patients} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age Distribution</p>
          <CountBar data={data.age_distribution} empty="No patient dates of birth are recorded." />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender Distribution</p>
          <CountDonut data={data.gender_distribution} empty="No patients assigned yet." />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-subtle p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Common Symptoms</p>
          <RankedList items={data.common_symptoms} empty="No symptoms recorded." />
        </div>
        <div className="rounded-xl border border-border-subtle p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Common Diagnoses</p>
          {/* Stated explicitly: these are clinician-written, never AI suggestions. */}
          <p className="mb-2 text-xs text-muted-foreground">{data.diagnoses_source}</p>
          <RankedList items={data.common_diagnoses} empty="No prescriptions issued in this period." />
        </div>
        <div className="rounded-xl border border-border-subtle p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requested Specialties</p>
          <RankedList items={data.most_requested_specialties} empty="No cases in this period." />
        </div>
      </div>
    </SectionCard>
  );
});

export const AIPanel = memo(function AIPanel({ data }: { data: AnalyticsAI }) {
  return (
    <SectionCard title="AI Analytics" subtitle="Measured AI activity and clinician review outcomes">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Analyses Generated" value={data.analyses_generated} />
        <Metric label="Suggestions Reviewed" value={data.suggestions_reviewed} />
        <Metric label="Accepted" value={data.suggestions_accepted} />
        <Metric label="Modified" value={data.suggestions_modified} />
        <Metric label="Rejected" value={data.suggestions_rejected} />
        <Metric label="Avg AI Confidence" value={data.avg_confidence_percent} suffix="%" />
        <Metric label="Avg Processing Time" value={data.avg_processing_time_seconds} suffix=" s" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Review outcomes are counted from recorded clinician decisions in the audit
        trail. Accuracy is not shown because no validated ground truth exists.
      </p>
    </SectionCard>
  );
});

export const ReportPanel = memo(function ReportPanel({ data }: { data: AnalyticsReports }) {
  return (
    <SectionCard title="Report Analytics" subtitle="Document throughput for the selected period">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Generated" value={data.generated} />
        <Metric label="Approved" value={data.approved} />
        <Metric label="Rejected" value={data.rejected} />
        <Metric label="Pending" value={data.pending} />
        <Metric label="Shared" value={data.shared_with_patients} />
        <Metric label="Avg Approval" value={data.avg_approval_minutes} suffix=" min" />
      </div>
      <CountDonut data={data.by_status} empty="No reports created in this period." />
    </SectionCard>
  );
});

export const PrescriptionPanel = memo(function PrescriptionPanel({
  data,
}: {
  data: AnalyticsPrescriptions;
}) {
  return (
    <SectionCard title="Prescription Analytics" subtitle="Confirmed prescriptions issued by you">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Metric label="Prescriptions Issued" value={data.issued} />
        <Metric label="With Follow-up" value={data.follow_up_prescriptions} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Most Prescribed</p>
          <RankedList items={data.top_medications} empty="No medications prescribed in this period." />
          <p className="mt-2 text-xs text-muted-foreground">
            Grouped by medication name — no therapeutic classification is stored.
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prescription Trend</p>
          {data.trend?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6d7a77" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6d7a77" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                <Bar dataKey="value" fill="#6bd8cb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No Data Available"
                        description="No prescriptions issued in this period." />
          )}
        </div>
      </div>
    </SectionCard>
  );
});

export const AppointmentPanel = memo(function AppointmentPanel({
  data,
}: {
  data: AnalyticsAppointments;
}) {
  return (
    <SectionCard title="Appointment Analytics" subtitle="Scheduling outcomes for the selected period">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Metric label="Today" value={data.today} />
        <Metric label="Upcoming" value={data.upcoming} />
        <Metric label="Completed" value={data.completed} />
        <Metric label="Cancelled" value={data.cancelled} />
        <Metric label="No-show" value={data.no_show} />
      </div>
      <CountBar data={data.by_status} empty="No appointments in this period." />
    </SectionCard>
  );
});

const ACTOR_GLYPH: Record<string, string> = {
  ai: "🤖", doctor: "👨‍⚕️", patient: "👤", admin: "🛡️", system: "⚙️",
};

export const ActivityPanel = memo(function ActivityPanel({
  events,
}: {
  events: AnalyticsActivityEvent[];
}) {
  return (
    <SectionCard title="Recent Activity" subtitle="Latest events across your cases">
      {!events?.length ? (
        <EmptyState icon={<Activity className="h-8 w-8" />} title="No Recorded Activity"
                    description="Case events appear here as work is recorded." />
      ) : (
        <div className="space-y-2">
          {events.slice(0, 10).map((e) => (
            <div key={e.id} className="rounded-xl border border-border-subtle p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {ACTOR_GLYPH[e.actor_type] ?? "⚙️"} {e.title}
                </span>
                <StatusBadge variant={e.actor_type === "ai" ? "info" : "success"}>
                  {e.actor_label}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
              {e.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
});
