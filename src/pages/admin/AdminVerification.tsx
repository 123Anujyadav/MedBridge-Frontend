import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/States";
import {
  useAdminAccountCap,
  useDoctorsForReview,
  useSetDoctorAccountActive,
  useVerifyDoctor,
} from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck, Check, X, Ban, RotateCcw, Eye, IdCard, PlayCircle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AdminDoctorResponse } from "@/types/api";

/** The filter tabs across the top of the queue. */
const FILTERS = [
  { key: "pending", label: "Awaiting Approval" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
  { key: "", label: "All Clinicians" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const PAGE_SIZE = 25;

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  if (status === "verified") return "success";
  if (status === "rejected" || status === "expired") return "error";
  if (status === "pending" || status === "under_review") return "warning";
  return "neutral";
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    verified: "Verified",
    pending: "Pending Review",
    under_review: "Under Review",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status] ?? status;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** A labelled read-only field, matching the tiles used elsewhere in the admin UI. */
function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-2">
      <span className="text-muted-foreground">{label}</span>
      <p className={`font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

function ListField({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-2">
      <span className="text-muted-foreground">{label}</span>
      <p className="font-semibold text-foreground">
        {values && values.length > 0 ? values.join(", ") : "—"}
      </p>
    </div>
  );
}

export default function AdminVerification() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [filter, setFilter] = useState<FilterKey>("pending");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useDoctorsForReview(filter || undefined, page, PAGE_SIZE);
  const { data: cap } = useAdminAccountCap();
  const verifyDoctorMutation = useVerifyDoctor();
  const accountStatusMutation = useSetDoctorAccountActive();

  const doctors = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const busy = verifyDoctorMutation.isPending || accountStatusMutation.isPending;

  /** Changing the filter must reset paging — page 7 of "pending" is rarely page 7 of "all". */
  const selectFilter = (key: FilterKey) => {
    setFilter(key);
    setPage(1);
    setExpanded(null);
  };

  // An action can empty the last page (approving the only clinician left on it).
  // Step back rather than stranding the administrator on a blank page.
  useEffect(() => {
    if (!isFetching && page > 1 && doctors.length === 0 && total > 0) {
      setPage((p) => Math.max(1, Math.min(p - 1, pages)));
    }
  }, [isFetching, page, doctors.length, total, pages]);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="admin"
      userName={user?.email || "Admin"}
      userRole="System Administrator"
      searchPlaceholder="Search verification queue..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={3} />);

  if (isError) {
    return shell(
      <ErrorState
        title="Failed to Load Verification Queue"
        description={(error as Error)?.message || "Could not retrieve doctor verifications."}
        onRetry={refetch}
      />
    );
  }

  /** Approve, reject or unverify — all three are the same status write. */
  const handleVerifyAction = async (
    doctor: AdminDoctorResponse,
    statusVal: "verified" | "rejected" | "pending"
  ) => {
    try {
      const updated = await verifyDoctorMutation.mutateAsync({
        id: doctor.id,
        verifyIn: { verification_status: statusVal },
      });

      if (statusVal === "verified") {
        // The Doctor ID is the clinician's third sign-in factor and the
        // administrator is the only person who can pass it on, so it is shown
        // here rather than left to be looked up.
        toast({
          title: `Dr. ${doctor.first_name} ${doctor.last_name} approved`,
          description: `Doctor ID ${updated.doctor_code} — they can now sign in with it.`,
        });
      } else {
        toast({
          title: statusVal === "rejected" ? "Registration rejected" : "Verification withdrawn",
          description: "This clinician can no longer sign in. Active sessions end immediately.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action Error",
        description: (err as Error)?.message || "Could not complete the verification decision.",
      });
    }
  };

  /** Suspend or reinstate — the account-level switch, not the clinical status. */
  const handleAccountAction = async (doctor: AdminDoctorResponse, isActive: boolean) => {
    try {
      await accountStatusMutation.mutateAsync({ id: doctor.id, isActive });
      toast({
        title: isActive ? "Account reinstated" : "Account suspended",
        description: isActive
          ? `Dr. ${doctor.last_name} can sign in again, subject to their verification status.`
          : `Dr. ${doctor.last_name} is signed out and cannot sign in.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action Error",
        description: (err as Error)?.message || "Could not update the account status.",
      });
    }
  };

  return shell(
    <>
      <PageHeader
        title="Verification Center"
        subtitle="Review and verify clinician credentials, licenses, and compliance status."
        breadcrumbs={[{ label: "Admin" }, { label: "Verification Center" }]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key || "all"}
            onClick={() => selectFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {filter === f.key && total > 0 ? ` (${total})` : ""}
          </button>
        ))}
        {cap && (
          <span className="ml-auto text-xs text-muted-foreground">
            Administrator accounts: {cap.in_use} of {cap.maximum} in use
          </span>
        )}
      </div>

      <SectionCard
        title="Clinician Credentials"
        subtitle={
          total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
            : "Approve, reject, unverify or suspend a clinician's access"
        }
      >
        {doctors.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="h-8 w-8" />}
            title="No clinicians in this view"
            description="Nothing matches the selected verification status."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {doctors.map((d) => {
              const isOpen = expanded === d.id;
              return (
                <div key={d.id} className="rounded-xl border border-border-subtle p-4 space-y-3">
                  {/* ── Identity ─────────────────────────────── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {d.avatar_url ? (
                        <img
                          src={d.avatar_url}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full border border-border-subtle object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                          {d.first_name?.[0]}
                          {d.last_name?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          Dr. {d.first_name} {d.last_name}
                        </p>
                        <p className="text-body-sm text-muted-foreground">{d.specialty}</p>
                        <p className="text-xs text-muted-foreground">{d.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge variant={statusVariant(d.verification_status)} dot>
                        {statusLabel(d.verification_status)}
                      </StatusBadge>
                      {!d.is_active && (
                        <StatusBadge variant="error">Suspended</StatusBadge>
                      )}
                    </div>
                  </div>

                  {/* ── Doctor ID ────────────────────────────── */}
                  <div className="flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 px-3 py-2">
                    <IdCard className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-xs text-muted-foreground">Doctor ID</span>
                    <span className="ml-auto font-mono text-sm font-bold tracking-[0.15em] text-primary">
                      {d.doctor_code || "Not issued"}
                    </span>
                  </div>

                  {/* ── Credentials at a glance ──────────────── */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Field label="License Number" value={d.license_number} mono />
                    <Field label="Hospital" value={d.hospital_name || "Independent"} />
                    <Field label="Phone" value={d.phone} />
                    <Field label="Experience" value={`${d.years_of_experience} years`} />
                    <Field label="Registered" value={formatDate(d.registered_at)} />
                    <Field label="Verified On" value={formatDate(d.verified_date)} />
                  </div>

                  {/* ── Full profile ─────────────────────────── */}
                  {isOpen && (
                    <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                      <ListField label="Sub-specialities" values={d.sub_specialties} />
                      <ListField label="Education" values={d.education} />
                      <ListField label="Certificates" values={d.certifications} />
                      <ListField label="Languages" values={d.languages} />
                      <Field label="Consultation Fee" value={`${d.consultation_fee}`} />
                      <Field label="Availability" value={d.availability} />
                      <Field label="Email Confirmed" value={d.account_verified ? "Yes" : "No"} />
                      <Field label="Cases / Patients" value={`${d.total_cases} / ${d.total_patients}`} />
                      <div className="rounded-lg bg-surface-container-low p-2 md:col-span-2">
                        <span className="text-muted-foreground">Biography</span>
                        <p className="font-medium text-foreground">{d.bio || "—"}</p>
                      </div>
                    </div>
                  )}

                  {/* ── Actions ──────────────────────────────── */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setExpanded(isOpen ? null : d.id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" /> {isOpen ? "Hide Profile" : "View Full Profile"}
                    </button>

                    {d.verification_status !== "verified" && (
                      <button
                        onClick={() => handleVerifyAction(d, "verified")}
                        disabled={busy}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success py-2 text-xs font-semibold text-success-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve &amp; Verify
                      </button>
                    )}

                    {d.verification_status === "verified" && (
                      <button
                        onClick={() => handleVerifyAction(d, "pending")}
                        disabled={busy}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-warning-soft py-2 text-xs font-semibold text-warning hover:opacity-90 disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Unverify
                      </button>
                    )}

                    {d.verification_status !== "rejected" && (
                      <button
                        onClick={() => handleVerifyAction(d, "rejected")}
                        disabled={busy}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-error-soft py-2 text-xs font-semibold text-error-edge hover:opacity-90 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}

                    {d.is_active ? (
                      <button
                        onClick={() => handleAccountAction(d, false)}
                        disabled={busy}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-error-edge hover:bg-error-soft disabled:opacity-50"
                      >
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAccountAction(d, true)}
                        disabled={busy}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-success hover:bg-success-soft disabled:opacity-50"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Reinstate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────── */}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-xs text-muted-foreground">
              Page {page} of {pages}
              {isFetching ? " · updating…" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data?.has_prev || isFetching}
                className="flex items-center gap-1 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={!data?.has_next || isFetching}
                className="flex items-center gap-1 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </>
  );
}
