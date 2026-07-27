import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { useNotificationCenter, useNotificationMutations } from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import {
  Bell, Pill, Calendar, FileText, Siren, Settings, Folders,
  CheckCheck, Brain, ShieldAlert, Search, X, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NotificationCard } from "@/types/api";

const typeIcons: Record<string, typeof Bell> = {
  case: Folders,
  ai: Brain,
  appointment: Calendar,
  report: FileText,
  prescription: Pill,
  patient: User,
  system: Settings,
  security: ShieldAlert,
  general: Bell,
};

/** Critical must be unmistakable; the rest use the standard badge vocabulary. */
const priorityTone: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  critical: "error",
  urgent: "error",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "critical", label: "Critical" },
  { id: "appointment", label: "Appointments" },
  { id: "ai", label: "AI" },
  { id: "report", label: "Reports" },
  { id: "patient", label: "Patients" },
  { id: "case", label: "Cases" },
  { id: "system", label: "System" },
  { id: "security", label: "Security" },
] as const;

const CATEGORY_IDS = new Set([
  "appointment", "ai", "report", "patient", "case", "system", "security",
]);

const chipBtn =
  "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all border border-border-subtle text-muted-foreground hover:bg-surface-container-low";
const chipActive =
  "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all bg-primary text-primary-foreground";
const smallBtn =
  "rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container disabled:opacity-50";

const PAGE = 30;

export default function DoctorNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [limit, setLimit] = useState(PAGE);

  const query = useMemo(
    () => ({
      unread_only: filter === "unread" || undefined,
      critical_only: filter === "critical" || undefined,
      category: CATEGORY_IDS.has(filter) ? filter : undefined,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      limit,
    }),
    [filter, search, dateFrom, dateTo, limit]
  );

  // Reads /shared/notifications/center. The previous implementation called the
  // patient-only route, which is role-gated — a doctor got a 403 and this page
  // could only ever render its error state.
  const { data, isLoading, isError, error, refetch } = useNotificationCenter(query);
  const { markRead, markAllRead, markSelectedRead, archive, open } =
    useNotificationMutations();

  const notifications = data?.notifications ?? [];

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const applySearch = useCallback(() => {
    setLimit(PAGE);
    setSearch(searchInput.trim());
  }, [searchInput]);

  const handleAction = useCallback(
    async (n: NotificationCard) => {
      // Recorded before navigating, so the audit trail distinguishes a
      // notification that was acted on from one merely seen.
      try {
        await open.mutateAsync(n.id);
      } catch {
        /* Navigation is the point; a failed audit write must not block it. */
      }
      if (n.action_url) navigate(n.action_url);
    },
    [navigate, open]
  );

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search notifications...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search notifications...">
        <ErrorState title="Failed to Load Notifications" description={(error as Error)?.message || "Could not retrieve doctor notifications."} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search notifications...">
      <PageHeader
        title="Notification Center"
        subtitle="Case updates, appointments, AI alerts, and system notifications."
        breadcrumbs={[{ label: "Doctor" }, { label: "Notifications" }]}
        actions={
          <button
            onClick={async () => {
              const updated = await markAllRead.mutateAsync();
              toast({ title: "Notifications Updated", description: `${updated} marked as read.` });
            }}
            disabled={markAllRead.isPending || !data?.unread_count}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark All as Read
          </button>
        }
      />

      {/* Counters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge variant="info" dot>{data?.unread_count ?? 0} unread</StatusBadge>
        {(data?.critical_count ?? 0) > 0 && (
          <StatusBadge variant="error" dot>{data?.critical_count} critical</StatusBadge>
        )}
        <span className="text-xs text-muted-foreground">
          Showing {notifications.length} of {data?.total ?? 0}
        </span>
      </div>

      {/* Grouped summaries — only groups of two or more are reported. */}
      {(data?.groups?.length ?? 0) > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {data!.groups.map((g) => (
            <StatusBadge key={g.group_key} variant={priorityTone[g.highest_priority] ?? "neutral"}>
              {g.count} {g.label}
            </StatusBadge>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setLimit(PAGE); setSelected([]); }}
            className={filter === f.id ? chipActive : chipBtn}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search + date range */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2 flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Search patient, case ID or event type"
            className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm"
          />
          <button onClick={applySearch} className={smallBtn}>
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
        <input type="date" value={dateFrom}
               onChange={(e) => { setDateFrom(e.target.value); setLimit(PAGE); }}
               className="rounded-xl border border-border-subtle bg-card p-3 text-sm" />
        <input type="date" value={dateTo}
               onChange={(e) => { setDateTo(e.target.value); setLimit(PAGE); }}
               className="rounded-xl border border-border-subtle bg-card p-3 text-sm" />
      </div>

      {/* Selection actions */}
      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-surface-container p-4">
          <StatusBadge variant="info" dot>{selected.length} selected</StatusBadge>
          <button
            className={smallBtn}
            disabled={markSelectedRead.isPending}
            onClick={async () => {
              const updated = await markSelectedRead.mutateAsync(selected);
              setSelected([]);
              toast({ title: "Notifications Updated", description: `${updated} marked as read.` });
            }}
          >
            Mark Selected as Read
          </button>
          <button onClick={() => setSelected([])}
                  className="ml-auto flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <SectionCard title="Notifications">
          <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications"
                      description="You're all caught up!" />
        </SectionCard>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = typeIcons[n.category] ?? Bell;
            const critical = n.priority === "critical" || n.priority === "urgent";
            return (
              <div key={n.id} className={`premium-card p-4 ${!n.read ? "border-primary/20" : ""}`}>
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    aria-label={`Select ${n.title}`}
                    className="mt-3 h-4 w-4 rounded border-border-subtle"
                  />
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${critical ? "bg-error-soft text-error-edge" : "bg-accent text-primary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      <StatusBadge variant={priorityTone[n.priority] ?? "neutral"}>
                        {n.priority}
                      </StatusBadge>
                      <StatusBadge variant="neutral">{n.category}</StatusBadge>
                    </div>
                    <p className="text-body-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {n.patient_name && (
                        <span className="text-xs text-muted-foreground">
                          Patient: <span className="font-medium text-foreground">{n.patient_name}</span>
                        </span>
                      )}
                      {n.case_short_id && (
                        <span className="text-xs text-muted-foreground">Case {n.case_short_id}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {n.action_url && (
                      <button onClick={() => handleAction(n)} className={smallBtn}>
                        {n.action_label || "Open"}
                      </button>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        disabled={markRead.isPending}
                        title="Mark as read"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-container hover:text-primary"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => archive.mutate(n.id)}
                      disabled={archive.isPending}
                      title="Dismiss"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-container"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {data?.has_more && (
            <button onClick={() => setLimit((n) => n + PAGE)}
                    className={`${smallBtn} w-full justify-center py-3`}>
              Load more notifications
            </button>
          )}
        </div>
      )}
    </AppShell>
  );
}
