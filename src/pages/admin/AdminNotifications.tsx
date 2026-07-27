import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientNotifications, useMarkNotificationRead } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { Bell, Pill, Calendar, FileText, Siren, Settings, Folders, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, typeof Bell> = {
  medication: Pill,
  appointment: Calendar,
  report: FileText,
  emergency: Siren,
  system: Settings,
  case_update: Folders,
};

export default function AdminNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: notifications = [], isLoading, isError, error, refetch } = usePatientNotifications();
  const markRead = useMarkNotificationRead();
  const [filter, setFilter] = useState("all");

  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search notifications...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search notifications...">
        <ErrorState title="Failed to Load Notifications" description={(error as Error)?.message || "Could not retrieve system notifications."} onRetry={refetch} />
      </AppShell>
    );
  }

  const filtered = filter === "all" ? notifications : filter === "unread" ? notifications.filter((n) => !n.read) : notifications.filter((n) => n.type === filter);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
      toast({ title: "Notification Updated", description: "Marked as read." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update notification." });
    }
  };

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search notifications...">
      <PageHeader
        title="Notification Center"
        subtitle="System alerts, verification requests, and platform notifications."
        breadcrumbs={[{ label: "Admin" }, { label: "Notifications" }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "unread", "system", "emergency", "case_update"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${filter === f ? "bg-primary text-primary-foreground" : "border border-border-subtle text-muted-foreground hover:bg-surface-container-low"}`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SectionCard title="Notifications">
          <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" description="You're all caught up!" />
        </SectionCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = typeIcons[n.type] ?? Bell;
            return (
              <div key={n.id} className={`premium-card p-4 ${!n.read ? "border-primary/20" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${n.priority === "urgent" ? "bg-error-soft text-error-edge" : "bg-accent text-primary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-body-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">{n.timestamp}</span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      disabled={markRead.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-container hover:text-primary"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
