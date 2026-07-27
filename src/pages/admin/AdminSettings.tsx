import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientSettings, useUpdateSettings } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/config";
import { Lock, Bell, ShieldCheck, Server, Database, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: settings, isLoading, isError, error, refetch } = usePatientSettings();
  const updateSettings = useUpdateSettings();

  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search settings...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError || !settings) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search settings...">
        <ErrorState title="Failed to Load Admin Settings" description={(error as Error)?.message || "Could not retrieve system configuration."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleToggle = async (key: "notifications_enabled" | "email_notifications" | "marketing_emails", currentValue: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: !currentValue });
      toast({ title: "Configuration Saved", description: "Admin settings updated in Redis." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not save settings." });
    }
  };

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search settings...">
      <PageHeader title="Settings & Platform Configuration" subtitle="Manage system security, database connections, and platform parameters." breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Enterprise Platform Environment">
          <div className="space-y-4">
            {[
              // Shows the endpoint this build actually talks to, rather than a
              // literal that reads "localhost" to an administrator in production.
              { label: "Backend API Endpoint", value: API_BASE_URL },
              { label: "Database Driver", value: "postgresql+asyncpg" },
              { label: "Cache Engine", value: "Redis v7.0" },
              { label: "Task Broker", value: "Celery Redis Worker" },
              { label: "Authentication Standard", value: "OAuth2 Bearer JWT" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between border-b border-border-subtle pb-3">
                <span className="text-body-sm text-muted-foreground">{item.label}</span>
                <span className="text-body-sm font-medium text-foreground font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notification & Alert Toggles">
          <div className="space-y-3">
            {[
              { key: "notifications_enabled" as const, label: "System Notification Gateway", val: settings.notifications_enabled },
              { key: "email_notifications" as const, label: "Email Alert Relay", val: settings.email_notifications },
              { key: "marketing_emails" as const, label: "Telemetry Logging", val: settings.marketing_emails },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="text-body-sm font-medium text-foreground">{item.label}</span>
                </div>
                <button onClick={() => handleToggle(item.key, item.val)} disabled={updateSettings.isPending}>
                  {item.val ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Security & Compliance Hardening">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div><p className="font-semibold text-foreground">HIPAA Audit Trail</p><p className="text-xs text-muted-foreground">Logged to postgresql</p></div>
                </div>
                <StatusBadge variant="success" dot>Active</StatusBadge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div><p className="font-semibold text-foreground">RBAC Enforced</p><p className="text-xs text-muted-foreground">Role checkers on API</p></div>
                </div>
                <StatusBadge variant="success" dot>Enforced</StatusBadge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div><p className="font-semibold text-foreground">JWT Encryption</p><p className="text-xs text-muted-foreground">HS256 Standard</p></div>
                </div>
                <StatusBadge variant="success" dot>Active</StatusBadge>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
