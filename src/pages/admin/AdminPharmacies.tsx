import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, CheckCircle2, Plus, Search, Store, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useBulkSetActive,
  useDebounced,
  useDeletePharmacy,
  usePharmacyList,
  useSetPharmacyActive,
} from "@/hooks/usePharmacyAdmin";
import {
  VERIFICATION_LABELS,
  type AdminPharmacy,
  type VerificationStatus,
} from "@/types/pharmacy-admin";

const PAGE_SIZE = 25;

const VERIFICATION_TONE: Record<
  VerificationStatus,
  "success" | "warning" | "error" | "info" | "neutral"
> = {
  approved: "success",
  pending: "neutral",
  submitted: "info",
  document_review: "warning",
  rejected: "error",
  suspended: "error",
};

export default function AdminPharmacies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "">("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Debounced so a ten-character query is one request, not ten.
  const search = useDebounced(searchInput);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      verification_status: status || undefined,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    [search, status, page],
  );

  const { data, isLoading, isError, error, refetch } = usePharmacyList(filters);
  const setActive = useSetPharmacyActive();
  const bulkSetActive = useBulkSetActive();
  const removePharmacy = useDeletePharmacy();

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleToggleActive = async (row: AdminPharmacy) => {
    try {
      await setActive.mutateAsync({
        pharmacyId: row.id,
        active: !row.is_active,
        reason: row.is_active ? "Suspended by administrator" : "Reactivated",
      });
      toast({
        title: row.is_active ? "Pharmacy suspended" : "Pharmacy reactivated",
        description: `${row.name} is now ${row.is_active ? "hidden from" : "visible in"} patient search.`,
      });
    } catch (mutationError) {
      toast({
        variant: "destructive",
        title: "Could not update status",
        description: (mutationError as Error)?.message ?? "The change was rejected.",
      });
    }
  };

  const handleBulk = async (active: boolean) => {
    if (selected.size === 0) return;
    try {
      const result = await bulkSetActive.mutateAsync({
        pharmacyIds: [...selected],
        active,
        reason: active ? "Bulk reactivation" : "Bulk suspension",
      });
      setSelected(new Set());
      toast({
        title: "Bulk update applied",
        description: `${result.updated} of ${result.requested} pharmacies updated.`,
      });
    } catch {
      toast({ variant: "destructive", title: "Bulk update failed" });
    }
  };

  const handleDelete = async (row: AdminPharmacy) => {
    try {
      await removePharmacy.mutateAsync(row.id);
      toast({ title: "Pharmacy retired", description: `${row.name} was removed.` });
    } catch (deleteError) {
      // The server refuses while orders are in flight; that message is the
      // useful one, so it is surfaced rather than a generic failure.
      toast({
        variant: "destructive",
        title: "Could not retire pharmacy",
        description:
          (deleteError as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "The pharmacy could not be removed.",
      });
    }
  };

  const columns: Column<AdminPharmacy>[] = [
    {
      key: "select",
      header: "",
      width: "40px",
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={() => toggle(row.id)}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "name",
      header: "Pharmacy",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.name}</p>
          <p className="text-body-sm text-muted-foreground">
            {row.business_name || row.owner_name || "—"}
            {row.city && ` · ${row.city}`}
          </p>
        </div>
      ),
    },
    {
      key: "verification_status",
      header: "Verification",
      sortable: true,
      render: (row) => (
        <StatusBadge variant={VERIFICATION_TONE[row.verification_status]} dot>
          {VERIFICATION_LABELS[row.verification_status]}
        </StatusBadge>
      ),
    },
    {
      key: "can_fulfil",
      header: "Dispensing",
      render: (row) =>
        row.can_fulfil ? (
          <StatusBadge variant="success">Live</StatusBadge>
        ) : (
          <StatusBadge variant="neutral">Not live</StatusBadge>
        ),
    },
    {
      key: "drug_license_number",
      header: "Drug licence",
      render: (row) => (
        <span className="text-body-sm text-muted-foreground">
          {row.drug_license_number || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleToggleActive(row)}
            className="rounded-lg border border-border-subtle p-1.5 text-muted-foreground transition-all hover:bg-surface-container hover:text-primary"
            title={row.is_active ? "Suspend" : "Activate"}
          >
            {row.is_active ? (
              <Ban className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="rounded-lg border border-border-subtle p-1.5 text-muted-foreground transition-all hover:bg-error-soft hover:text-error-edge"
            title="Retire pharmacy"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="admin"
      userName={user?.email || "Administrator"}
      userRole="Admin Portal"
      searchPlaceholder="Search pharmacies..."
    >
      {children}
    </AppShell>
  );

  if (isError) {
    return shell(
      <ErrorState
        title="Failed to load pharmacies"
        description={(error as Error)?.message ?? "The partner network could not be read."}
        onRetry={refetch}
      />,
    );
  }

  return shell(
    <>
      <PageHeader
        title="Partner Pharmacies"
        subtitle="Onboard, verify and monitor the dispensing network."
        breadcrumbs={[{ label: "Admin" }, { label: "Pharmacies" }]}
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin/pharmacies/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add pharmacy
          </button>
        }
      />

      <SectionCard title="Network directory" subtitle={`${total} pharmacies`}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(0);
              }}
              placeholder="Name, owner, GST, licence or phone"
              className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pl-9 pr-3 text-body-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as VerificationStatus | "");
              setPage(0);
            }}
            className="rounded-xl border border-border-subtle bg-background px-3 py-2.5 text-body-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All verification states</option>
            {Object.entries(VERIFICATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-muted-foreground">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={() => handleBulk(true)}
                className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => handleBulk(false)}
                className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
              >
                Suspend
              </button>
            </div>
          )}
        </div>

        {isLoading && rows.length === 0 ? (
          <LoadingState rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Store className="h-8 w-8" />}
            title="No pharmacies found"
            description={
              search || status
                ? "No pharmacy matches these filters."
                : "Onboard your first partner pharmacy to start dispensing."
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={rows}
              pageSize={PAGE_SIZE}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/admin/pharmacies/${row.id}`)}
            />

            {/* Server-side paging. The table's own pager only sorts the page it
                was handed, so the row count comes from the API total. */}
            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="text-body-sm text-muted-foreground">
                  Page {page + 1} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </>,
  );
}
