import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useAuditLogs } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import type { AuditLogResponse } from "@/types/api";
import { ScrollText } from "lucide-react";

export default function AdminCompliance() {
  const { user } = useAuth();
  const { data: auditLogs = [], isLoading, isError, error, refetch } = useAuditLogs(100);

  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search audit logs...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search audit logs...">
        <ErrorState title="Failed to Load Audit Logs" description={(error as Error)?.message || "Could not retrieve system audit logs."} onRetry={refetch} />
      </AppShell>
    );
  }

  const columns: Column<AuditLogResponse>[] = [
    {
      key: "user_name",
      header: "User Identity",
      sortable: true,
      sortValue: (a) => a.user_name || a.user_id,
      render: (a) => (
        <div>
          <p className="font-medium text-foreground">{a.user_name || "System User"}</p>
          <p className="text-xs text-muted-foreground capitalize">{a.user_role}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      sortable: true,
      sortValue: (a) => a.action,
      render: (a) => <span className="text-body-sm font-mono text-foreground">{a.action}</span>,
    },
    {
      key: "resource",
      header: "Resource Target",
      render: (a) => <span className="text-body-sm text-muted-foreground capitalize">{a.resource} ({a.resource_id.slice(0, 8)})</span>,
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (a) => <span className="text-body-sm font-mono text-muted-foreground">{a.ip_address}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <StatusBadge variant={a.status === "success" ? "success" : "error"} dot>
          {a.status}
        </StatusBadge>
      ),
    },
    {
      key: "created_at",
      header: "Timestamp",
      sortable: true,
      sortValue: (a) => a.created_at,
      render: (a) => <span className="text-body-sm text-muted-foreground">{a.created_at}</span>,
    },
  ];

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search audit logs...">
      <PageHeader
        title="Compliance & Audit Logs"
        subtitle="HIPAA audit trail, system telemetry actions, and regulatory compliance monitoring."
        breadcrumbs={[{ label: "Admin" }, { label: "Compliance" }]}
      />

      {auditLogs.length === 0 ? (
        <SectionCard title="Audit Trail">
          <EmptyState icon={<ScrollText className="h-8 w-8" />} title="No audit events logged" description="System actions will be recorded here automatically." />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={auditLogs} rowKey={(a) => a.id} />
      )}
    </AppShell>
  );
}
