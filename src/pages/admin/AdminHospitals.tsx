import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useAdminHospitals, useRegisterHospital } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import type { HospitalResponse } from "@/types/api";
import { Building2, MapPin, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminHospitals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: hospitals = [], isLoading, isError, error, refetch } = useAdminHospitals();
  const registerHospitalMutation = useRegisterHospital();

  const [selected, setSelected] = useState<HospitalResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search hospitals...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search hospitals...">
        <ErrorState title="Failed to Load Hospital Directory" description={(error as Error)?.message || "Could not retrieve hospital network list."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleRegisterHospital = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const phone = formData.get("phone") as string;
    const totalBeds = parseInt(formData.get("totalBeds") as string, 10) || 50;

    if (!name || !city || !address) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please enter hospital name, address, and city." });
      return;
    }

    try {
      await registerHospitalMutation.mutateAsync({
        name,
        address,
        city,
        state: state || "IL",
        phone: phone || "+1 (555) 000-0000",
        total_beds: totalBeds,
        emergency_services: true,
      });
      toast({ title: "Hospital Registered", description: "Hospital record created in PostgreSQL database." });
      setShowAddModal(false);
    } catch {
      toast({ variant: "destructive", title: "Registration Failed", description: "Could not create hospital record." });
    }
  };

  const columns: Column<HospitalResponse>[] = [
    {
      key: "name",
      header: "Hospital Network",
      sortable: true,
      sortValue: (h) => h.name,
      render: (h) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{h.name}</p>
            <p className="text-xs text-muted-foreground">{h.city}, {h.state}</p>
          </div>
        </div>
      ),
    },
    {
      key: "total_beds",
      header: "Total Beds",
      sortable: true,
      sortValue: (h) => h.total_beds,
      render: (h) => <span className="text-body-sm font-medium">{h.available_beds}/{h.total_beds} available</span>,
    },
    {
      key: "emergency_capacity",
      header: "Emergency Capacity",
      render: (h) => <StatusBadge variant={h.emergency_capacity === "available" ? "success" : "warning"} dot>{h.emergency_capacity}</StatusBadge>,
    },
    {
      key: "verification_status",
      header: "Status",
      render: (h) => <StatusBadge variant={h.verification_status === "verified" ? "success" : "neutral"} dot>{h.verification_status}</StatusBadge>,
    },
  ];

  return (
    <AppShell portal="admin" userName={user?.email || "Admin"} userRole="System Administrator" searchPlaceholder="Search hospitals...">
      <PageHeader
        title="Hospital Network Directory"
        subtitle="Manage hospital partnerships, emergency centers, and bed capacities."
        breadcrumbs={[{ label: "Admin" }, { label: "Hospital Directory" }]}
        actions={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Register Hospital
          </button>
        }
      />

      {hospitals.length === 0 ? (
        <SectionCard title="Hospitals">
          <EmptyState icon={<Building2 className="h-8 w-8" />} title="No registered hospitals" description="Registered hospital facilities will appear here." />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={hospitals} rowKey={(h) => h.id} onRowClick={(h) => setSelected(h)} />
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-headline text-headline-md text-foreground">{selected.name}</h2>
                <p className="text-body-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {selected.address}, {selected.city}, {selected.state}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs text-muted-foreground">Total Beds</p><p className="font-semibold text-foreground">{selected.total_beds}</p></div>
              <div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs text-muted-foreground">Available Beds</p><p className="font-semibold text-foreground">{selected.available_beds}</p></div>
              <div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs text-muted-foreground">Phone</p><p className="font-semibold text-foreground">{selected.phone || "N/A"}</p></div>
              <div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs text-muted-foreground">Verification</p><p className="font-semibold text-foreground capitalize">{selected.verification_status}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-headline-md text-foreground">Register New Hospital</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterHospital} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Facility Name</label>
                <input name="name" required placeholder="e.g. St. Jude General Hospital" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Street Address</label>
                  <input name="address" required placeholder="123 Health Ave" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">City</label>
                  <input name="city" required placeholder="Chicago" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Total Beds</label>
                  <input name="totalBeds" type="number" defaultValue={100} className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label>
                  <input name="phone" placeholder="+1 (555) 000-0000" className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={registerHospitalMutation.isPending} className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50">
                  {registerHospitalMutation.isPending ? "Registering..." : "Register Facility"}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-border-subtle px-5 py-3 font-semibold text-foreground">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
