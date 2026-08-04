import { useMemo, useState } from "react";
import { Download, Package, ScanLine, Search, Upload } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDebounced } from "@/hooks/usePharmacyAdmin";
import {
  useImportPortalInventory,
  usePortalInventory,
  useUpsertPortalInventory,
} from "@/hooks/usePharmacyPortal";
import pharmacyPortalService from "@/lib/pharmacy-portal-service";
import {
  STOCK_STATE_LABELS,
  type AdminInventoryItem,
  type StockState,
} from "@/types/pharmacy-admin";

const PAGE_SIZE = 50;

const STOCK_TONE: Record<StockState, "success" | "warning" | "error" | "neutral"> = {
  available: "success",
  low: "warning",
  critical: "warning",
  out_of_stock: "error",
  expired: "error",
  near_expiry: "warning",
};

const STATE_FILTERS: (StockState | "")[] = [
  "", "low", "critical", "out_of_stock", "near_expiry", "expired",
];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
}

export default function PharmacyInventory() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [stockState, setStockState] = useState<StockState | "">("");
  const [page, setPage] = useState(0);
  const [scanCode, setScanCode] = useState("");
  const search = useDebounced(searchInput);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      stock_state: stockState || undefined,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    [search, stockState, page],
  );

  const { data, isLoading, isError, error, refetch } = usePortalInventory(filters);
  const upsert = useUpsertPortalInventory();
  const importCsv = useImportPortalInventory();

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /** Barcode / QR scan at the counter. */
  const handleScan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scanCode.trim()) return;
    try {
      const item = await pharmacyPortalService.lookupByCode(scanCode.trim());
      setSearchInput(item.medicine_name);
      setScanCode("");
      toast({
        title: item.medicine_name,
        description: `${item.stock_quantity} in stock · ₹${item.selling_price.toFixed(2)}`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Not found",
        description: "No item in your catalogue matches that barcode or SKU.",
      });
    }
  };

  const adjustStock = async (item: AdminInventoryItem, quantity: number) => {
    try {
      await upsert.mutateAsync({ itemId: item.id, payload: { stock_quantity: quantity } });
      toast({
        title: "Stock updated",
        description: "Patient search reflects this immediately.",
      });
    } catch {
      toast({ variant: "destructive", title: "Could not update stock" });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importCsv.mutateAsync(await file.text());
      toast({
        title: "Import complete",
        description: `${result.created} created, ${result.updated} updated, ${result.errors.length} rejected.`,
      });
      if (result.errors.length > 0) {
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

  const columns: Column<AdminInventoryItem>[] = [
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
          <input
            type="number"
            min={0}
            defaultValue={row.stock_quantity}
            onBlur={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next) && next !== row.stock_quantity && next >= 0) {
                adjustStock(row, next);
              }
            }}
            onClick={(event) => event.stopPropagation()}
            className="w-20 rounded-lg border border-border-subtle bg-background p-1.5 text-body-sm text-foreground outline-none focus:border-primary"
            aria-label={`Stock for ${row.medicine_name}`}
          />
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

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="pharmacy"
      userName={user?.email || "Pharmacy"}
      userRole="Pharmacy Portal"
      searchPlaceholder="Search medicines..."
    >
      {children}
    </AppShell>
  );

  if (isError) {
    return shell(
      <ErrorState
        title="Failed to load inventory"
        description={(error as Error)?.message ?? "Your catalogue could not be read."}
        onRetry={refetch}
      />,
    );
  }

  return shell(
    <>
      <PageHeader
        title="Inventory"
        subtitle="Stock, batches, expiry and pricing. Changes reach patient search at once."
        breadcrumbs={[{ label: "Pharmacy" }, { label: "Inventory" }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => pharmacyPortalService.exportInventory()}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container">
              <Upload className="h-4 w-4" />
              Import
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
          </>
        }
      />

      <SectionCard title="Catalogue" subtitle={`${total} item(s)`}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(0);
              }}
              placeholder="Name, generic, brand, manufacturer, SKU"
              className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pl-9 pr-3 text-body-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <form onSubmit={handleScan} className="relative min-w-[180px]">
            <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={scanCode}
              onChange={(event) => setScanCode(event.target.value)}
              placeholder="Scan barcode / QR"
              className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pl-9 pr-3 text-body-sm text-foreground outline-none focus:border-primary"
            />
          </form>

          <select
            value={stockState}
            onChange={(event) => {
              setStockState(event.target.value as StockState | "");
              setPage(0);
            }}
            className="rounded-xl border border-border-subtle bg-background px-3 py-2.5 text-body-sm text-foreground outline-none focus:border-primary"
          >
            {STATE_FILTERS.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? STOCK_STATE_LABELS[value] : "All stock states"}
              </option>
            ))}
          </select>
        </div>

        {isLoading && rows.length === 0 ? (
          <LoadingState rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No medicines listed"
            description={
              search || stockState
                ? "Nothing matches these filters."
                : "Import a CSV to load your catalogue."
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={rows}
              pageSize={PAGE_SIZE}
              rowKey={(row) => row.id}
            />
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
                    className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground disabled:opacity-50"
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
