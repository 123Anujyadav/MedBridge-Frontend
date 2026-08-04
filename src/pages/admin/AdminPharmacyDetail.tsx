import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileWarning,
  History,
  Package,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { PharmacyOwnerPanel } from "@/components/admin/PharmacyOwnerPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import pharmacyAdminService from "@/lib/pharmacy-admin-service";
import {
  useImportInventory,
  useInventorySearch,
  usePharmacyAudit,
  usePharmacyDetail,
  useReviewDocument,
  useTransitionVerification,
} from "@/hooks/usePharmacyAdmin";
import {
  DOCUMENT_TYPE_LABELS,
  STOCK_STATE_LABELS,
  VERIFICATION_LABELS,
  VERIFICATION_TRANSITIONS,
  type AdminInventoryItem,
  type PharmacyDocument,
  type StockState,
  type VerificationStatus,
} from "@/types/pharmacy-admin";

const STOCK_TONE: Record<StockState, "success" | "warning" | "error" | "neutral"> = {
  available: "success",
  low: "warning",
  critical: "warning",
  out_of_stock: "error",
  expired: "error",
  near_expiry: "warning",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
}

export default function AdminPharmacyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pharmacy, isLoading, isError, error, refetch } = usePharmacyDetail(id);
  const { data: inventory } = useInventorySearch({ pharmacy_id: id, limit: 100 });
  const { data: audit } = usePharmacyAudit(id, 25);
  const transition = useTransitionVerification(id);
  const reviewDocument = useReviewDocument(id);
  const importInventory = useImportInventory(id);

  const [note, setNote] = useState("");

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

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !pharmacy) {
    return shell(
      <ErrorState
        title="Failed to load pharmacy"
        description={(error as Error)?.message ?? "This pharmacy could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const nextStates = VERIFICATION_TRANSITIONS[pharmacy.verification_status] ?? [];

  const handleTransition = async (toStatus: VerificationStatus) => {
    try {
      await transition.mutateAsync({ toStatus, note });
      setNote("");
      toast({
        title: "Verification updated",
        description: `${pharmacy.name} is now ${VERIFICATION_LABELS[toStatus]}.`,
      });
    } catch (transitionError) {
      toast({
        variant: "destructive",
        title: "Transition refused",
        description:
          (transitionError as { response?: { data?: { detail?: string } } })?.response
            ?.data?.detail ?? "That change is not allowed from the current state.",
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const result = await importInventory.mutateAsync(text);
      toast({
        title: "Import complete",
        description: `${result.created} created, ${result.updated} updated, ${result.errors.length} rejected.`,
      });
      if (result.errors.length > 0) {
        // Line numbers are what make a rejected row fixable, so the first few
        // are surfaced rather than only a count.
        toast({
          variant: "destructive",
          title: `${result.errors.length} row(s) rejected`,
          description: result.errors
            .slice(0, 3)
            .map((e) => `Line ${e.line}: ${e.error}`)
            .join(" · "),
        });
      }
    } catch {
      toast({ variant: "destructive", title: "Import failed" });
    }
  };

  const inventoryColumns: Column<AdminInventoryItem>[] = [
    {
      key: "medicine_name",
      header: "Medicine",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.medicine_name}</p>
          <p className="text-body-sm text-muted-foreground">
            {row.generic_name || row.brand_name || "—"}
            {row.strength && ` · ${row.strength}`}
          </p>
        </div>
      ),
    },
    { key: "sku", header: "SKU", sortable: true },
    { key: "batch_number", header: "Batch", render: (row) => row.batch_number || "—" },
    {
      key: "expiry_date",
      header: "Expiry",
      sortable: true,
      sortValue: (row) => row.expiry_date ?? "",
      render: (row) => formatDate(row.expiry_date),
    },
    {
      key: "stock_quantity",
      header: "Stock",
      sortable: true,
      sortValue: (row) => row.stock_quantity,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{row.stock_quantity}</span>
          <StatusBadge variant={STOCK_TONE[row.stock_state]}>
            {STOCK_STATE_LABELS[row.stock_state]}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: "selling_price",
      header: "Price",
      sortable: true,
      sortValue: (row) => row.selling_price,
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">₹{row.selling_price.toFixed(2)}</p>
          {row.discount_percent > 0 && (
            <p className="text-body-sm text-muted-foreground line-through">
              ₹{row.mrp.toFixed(2)}
            </p>
          )}
        </div>
      ),
    },
  ];

  return shell(
    <>
      <PageHeader
        title={pharmacy.name}
        subtitle={`${pharmacy.business_name || pharmacy.owner_name || "Partner pharmacy"}${
          pharmacy.city ? ` · ${pharmacy.city}` : ""
        }`}
        breadcrumbs={[
          { label: "Admin" },
          { label: "Pharmacies" },
          { label: pharmacy.name },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin/pharmacies")}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      <div className="space-y-6">
        <SectionCard title="Verification" subtitle="Multi-step onboarding review">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              variant={
                pharmacy.verification_status === "approved"
                  ? "success"
                  : pharmacy.verification_status === "rejected" ||
                      pharmacy.verification_status === "suspended"
                    ? "error"
                    : "warning"
              }
              dot
            >
              {VERIFICATION_LABELS[pharmacy.verification_status]}
            </StatusBadge>
            {pharmacy.can_fulfil ? (
              <StatusBadge variant="success">Dispensing live</StatusBadge>
            ) : (
              <StatusBadge variant="neutral">Not dispensing</StatusBadge>
            )}
          </div>

          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Reviewer note (recorded on the timeline)"
            className="mt-4 w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {nextStates.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">
                No further transitions available from this state.
              </p>
            ) : (
              // Only the transitions the server will accept are offered; it
              // re-checks every one regardless.
              nextStates.map((next) => (
                <button
                  key={next}
                  type="button"
                  disabled={transition.isPending}
                  onClick={() => handleTransition(next)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Move to {VERIFICATION_LABELS[next]}
                </button>
              ))
            )}
          </div>

          {pharmacy.verification_events.length > 0 && (
            <ol className="mt-5 space-y-3 border-t border-border-subtle pt-4">
              {pharmacy.verification_events.map((event, index) => (
                <li key={index} className="flex gap-3">
                  <History className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-body-sm text-foreground">
                      {event.from_status ? `${event.from_status} → ` : ""}
                      <span className="font-semibold">{event.to_status}</span>
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                      {event.actor_name && ` · ${event.actor_name}`}
                      {event.note && ` · ${event.note}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>

        <SectionCard
          title="Pharmacy owner"
          subtitle="Who can sign in and operate this store"
        >
          <PharmacyOwnerPanel pharmacy={pharmacy} />
        </SectionCard>

        <SectionCard title="Compliance documents">
          {pharmacy.documents.length === 0 ? (
            <EmptyState
              icon={<FileWarning className="h-8 w-8" />}
              title="No documents uploaded"
              description="Drug licence, GST and registration documents appear here."
            />
          ) : (
            <div className="space-y-2">
              {pharmacy.documents.map((document: PharmacyDocument) => (
                <div
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {DOCUMENT_TYPE_LABELS[document.doc_type]}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      {document.document_number || document.file_name || "—"} · expires{" "}
                      {formatDate(document.expires_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.is_expired && (
                      <StatusBadge variant="error">Expired</StatusBadge>
                    )}
                    <StatusBadge
                      variant={
                        document.status === "approved"
                          ? "success"
                          : document.status === "rejected"
                            ? "error"
                            : "warning"
                      }
                    >
                      {document.status}
                    </StatusBadge>
                    <button
                      type="button"
                      onClick={() =>
                        reviewDocument.mutate({
                          documentId: document.id,
                          status: "approved",
                          notes: "Approved by administrator",
                        })
                      }
                      className="rounded-xl border border-border-subtle px-3 py-1.5 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Inventory"
          subtitle={`${inventory?.total ?? 0} catalogue items`}
        >
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                pharmacyAdminService.exportInventory(pharmacy.id, pharmacy.name)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container">
              <Upload className="h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleImport(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          {(inventory?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No stock listed"
              description="Import a CSV or add medicines to start dispensing from here."
            />
          ) : (
            <DataTable
              columns={inventoryColumns}
              data={inventory?.items ?? []}
              pageSize={15}
              rowKey={(row) => row.id}
            />
          )}
        </SectionCard>

        <SectionCard title="Audit trail" subtitle="Every administrator action">
          {(audit?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<History className="h-8 w-8" />}
              title="No recorded activity"
              description="Changes to this pharmacy will be listed here."
            />
          ) : (
            <div className="space-y-2">
              {audit?.items.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border-subtle p-3 text-body-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{entry.action}</span>
                    <span className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {entry.user_name} ({entry.user_role}) · {entry.ip_address}
                    {entry.field_changed && (
                      <>
                        {" · "}
                        {entry.field_changed}: {entry.previous_value ?? "—"} →{" "}
                        {entry.new_value ?? "—"}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>,
  );
}
