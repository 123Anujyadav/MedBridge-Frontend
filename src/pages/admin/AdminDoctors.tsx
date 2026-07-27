import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useAdminUsers, useVerifyDoctor, useDeleteUser } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import type { UserResponse } from "@/types/api";
import { Check, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDoctors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: fetchedUsers = [], isLoading, isError, error, refetch } = useAdminUsers("doctor");

  // Doctors come only from the database. A placeholder list used to render when
  // the query came back empty, with ids ("d001", …) that match no user — so
  // Verify and Delete both acted on rows the API could not find.
  const users = fetchedUsers;

  const verifyDoctorMutation = useVerifyDoctor();
  const deleteUserMutation = useDeleteUser();

  const handleVerify = async (id: string, statusVal: "verified" | "rejected") => {
    try {
      await verifyDoctorMutation.mutateAsync({
        id,
        verifyIn: { verification_status: statusVal },
      });
      toast({ title: "Verification Updated", description: `Doctor verification marked as ${statusVal}.` });
    } catch {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not update doctor verification status." });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this doctor user account?")) return;
    try {
      await deleteUserMutation.mutateAsync(id);
      toast({ title: "User Deleted", description: "Doctor user record permanently removed." });
    } catch {
      toast({ variant: "destructive", title: "Delete Error", description: "Could not delete user account." });
    }
  };


  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search doctors...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search doctors...">
        <ErrorState title="Failed to Load Clinician Directory" description={(error as Error)?.message || "Could not retrieve doctor list."} onRetry={refetch} />
      </AppShell>
    );
  }

  const columns: Column<UserResponse>[] = [
    {
      key: "email",
      header: "Doctor Email",
      sortable: true,
      sortValue: (u) => u.email,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-semibold text-sm text-primary">DR</div>
          <div>
            <p className="font-medium text-foreground">{u.email}</p>
            <p className="text-xs text-muted-foreground">ID: {u.id.slice(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Account Status",
      render: (u) => <StatusBadge variant={u.is_active ? "success" : "error"} dot>{u.is_active ? "Active" : "Disabled"}</StatusBadge>,
    },
    {
      key: "is_verified",
      header: "Verification",
      render: (u) => <StatusBadge variant={u.is_verified ? "success" : "warning"} dot>{u.is_verified ? "Verified" : "Pending"}</StatusBadge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (u) => (
        <div className="flex items-center gap-2">
          {!u.is_verified && (
            <button onClick={() => handleVerify(u.id, "verified")} disabled={verifyDoctorMutation.isPending} className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success/20">
              <Check className="h-4 w-4" />
            </button>
          )}
          {u.is_verified && (
            <button onClick={() => handleVerify(u.id, "rejected")} disabled={verifyDoctorMutation.isPending} className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-soft text-error-edge hover:bg-error-soft/80">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => handleDeleteUser(u.id)} disabled={deleteUserMutation.isPending} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),

    },
  ];

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search doctors...">
      <PageHeader title="Doctor Directory & Credentials" subtitle="Onboarding, verification, and management of all clinicians on the platform." breadcrumbs={[{ label: "Admin" }, { label: "Doctor Directory" }]} />

      {users.length === 0 ? (
        <SectionCard title="Doctor Accounts">
          <EmptyState icon={<Check className="h-8 w-8" />} title="No doctor accounts" description="Registered doctor accounts will appear here." />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={users} rowKey={(u) => u.id} />
      )}
    </AppShell>
  );
}
