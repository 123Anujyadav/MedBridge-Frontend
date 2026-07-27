import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/States";
import { usePendingDoctors, useVerifyDoctor } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: pendingDoctors = [], isLoading, isError, error, refetch } = usePendingDoctors();
  const verifyDoctorMutation = useVerifyDoctor();

  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search verification queue...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search verification queue...">
        <ErrorState title="Failed to Load Verification Queue" description={(error as Error)?.message || "Could not retrieve pending doctor verifications."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleVerifyAction = async (id: string, statusVal: "verified" | "rejected") => {
    try {
      await verifyDoctorMutation.mutateAsync({
        id,
        verifyIn: { verification_status: statusVal },
      });
      toast({ title: "Doctor Verification Processed", description: `Doctor status updated to ${statusVal}.` });
    } catch {
      toast({ variant: "destructive", title: "Action Error", description: "Could not complete verification decision." });
    }
  };

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search verification queue...">
      <PageHeader
        title="Verification Center"
        subtitle="Review and verify clinician credentials, licenses, and compliance status."
        breadcrumbs={[{ label: "Admin" }, { label: "Verification Center" }]}
      />

      <SectionCard title="Pending Clinician Verifications" subtitle="Review credentials and issue verification status">
        {pendingDoctors.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="h-8 w-8" />} title="No pending doctor verifications" description="All registered clinician credentials are up to date." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendingDoctors.map((d) => (
              <div key={d.id} className="rounded-xl border border-border-subtle p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Dr. {d.first_name} {d.last_name}</p>
                    <p className="text-body-sm text-muted-foreground">{d.specialty}</p>
                  </div>
                  <StatusBadge variant="warning" dot>Pending Review</StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-surface-container-low p-2">
                    <span className="text-muted-foreground">License Number</span>
                    <p className="font-mono font-semibold text-foreground">{d.license_number}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-2">
                    <span className="text-muted-foreground">Hospital</span>
                    <p className="font-semibold text-foreground">{d.hospital_name || "Independent"}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleVerifyAction(d.id, "verified")}
                    disabled={verifyDoctorMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success py-2 text-xs font-semibold text-success-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve & Verify
                  </button>
                  <button
                    onClick={() => handleVerifyAction(d.id, "rejected")}
                    disabled={verifyDoctorMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-error-soft py-2 text-xs font-semibold text-error-edge hover:opacity-90 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
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
