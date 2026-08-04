import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  MapPin,
  Navigation,
  Package,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { LazyMap, type MapMarker } from "@/components/shared/map/LazyMap";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useAdvanceDelivery,
  useCaptureProof,
  useDelivery,
  useDeliveryRoute,
  useFailDelivery,
  useMyDeliveries,
  useVerifyOtp,
} from "@/hooks/useDelivery";
import {
  ADVANCE_LABELS,
  DELIVERY_JOURNEY,
  DELIVERY_STATUS_LABELS,
  NEXT_TARGET,
  type DeliveryStatus,
} from "@/types/delivery";

const TONE: Record<DeliveryStatus, "success" | "warning" | "error" | "info" | "neutral"> = {
  offered: "warning",
  accepted: "info",
  en_route_pickup: "info",
  at_pharmacy: "info",
  picked_up: "info",
  out_for_delivery: "info",
  at_patient: "warning",
  delivered: "success",
  cancelled: "neutral",
  failed: "error",
};

/** Read the browser's position, or nothing if it is unavailable. */
async function position(): Promise<{ latitude?: number; longitude?: number }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return {};
  return new Promise((resolve) =>
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      // A missing fix must not block a rider from advancing a delivery.
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    ),
  );
}

export function DeliveryOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("active");
  const { data, isLoading, isError, error, refetch } = useMyDeliveries({ status, limit: 50 });

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="delivery"
      userName={user?.email || "Delivery Partner"}
      userRole="Delivery Portal"
      searchPlaceholder="Search deliveries..."
    >
      {children}
    </AppShell>
  );

  if (isError) {
    return shell(
      <ErrorState
        title="Failed to load deliveries"
        description={(error as Error)?.message ?? "Your deliveries could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const rows = data?.items ?? [];

  return shell(
    <>
      <PageHeader
        title="My Deliveries"
        subtitle="Accept, navigate and complete."
        breadcrumbs={[{ label: "Delivery" }, { label: "Orders" }]}
      />

      <SectionCard title="Assignments" subtitle={`${data?.total ?? 0} total`}>
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { value: "active", label: "In flight" },
            { value: "offered", label: "Offered" },
            { value: "delivered", label: "Delivered" },
            { value: "failed", label: "Failed" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={
                status === tab.value
                  ? "rounded-xl bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground"
                  : "rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && rows.length === 0 ? (
          <LoadingState rows={3} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="Nothing here"
            description="Deliveries matching this filter will appear as they arrive."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((assignment) => (
              <button
                key={assignment.id}
                type="button"
                onClick={() => navigate(`/delivery/orders/${assignment.id}`)}
                className="w-full rounded-xl border border-border-subtle p-4 text-left transition-all hover:bg-surface-container-low/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <StatusBadge variant={TONE[assignment.status]} dot>
                      {DELIVERY_STATUS_LABELS[assignment.status]}
                    </StatusBadge>
                    <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {assignment.pickup_address} → {assignment.drop_address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      ₹{assignment.partner_earning.toFixed(2)}
                    </p>
                    {assignment.distance_km && (
                      <p className="text-body-sm text-muted-foreground">
                        {assignment.distance_km} km
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>
    </>,
  );
}

/** One delivery: journey, navigation, OTP and proof. */
export function DeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: assignment, isLoading, isError, error, refetch } = useDelivery(id);
  const { data: route } = useDeliveryRoute(id);
  const advance = useAdvanceDelivery();
  const verifyOtp = useVerifyOtp();
  const captureProof = useCaptureProof();
  const failDelivery = useFailDelivery();

  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [failReason, setFailReason] = useState("");
  const [showFail, setShowFail] = useState(false);

  // Pickup and drop, both shown so the rider sees the whole leg at a glance.
  const mapMarkers = useMemo<MapMarker[]>(() => {
    if (!assignment) return [];
    const pins: MapMarker[] = [];
    if (assignment.pickup_latitude != null && assignment.pickup_longitude != null) {
      pins.push({
        id: "pickup",
        latitude: assignment.pickup_latitude,
        longitude: assignment.pickup_longitude,
        kind: "pharmacy",
        title: "Pickup",
        popup: <span>{assignment.pickup_address || "Pharmacy"}</span>,
      });
    }
    if (assignment.drop_latitude != null && assignment.drop_longitude != null) {
      pins.push({
        id: "drop",
        latitude: assignment.drop_latitude,
        longitude: assignment.drop_longitude,
        kind: "patient",
        title: "Drop",
        popup: <span>{assignment.drop_address || "Patient"}</span>,
      });
    }
    return pins;
  }, [assignment]);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="delivery"
      userName={user?.email || "Delivery Partner"}
      userRole="Delivery Portal"
      searchPlaceholder="Search deliveries..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !assignment) {
    return shell(
      <ErrorState
        title="Failed to load delivery"
        description={(error as Error)?.message ?? "This delivery could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const next = NEXT_TARGET[assignment.status];
  const currentIndex = DELIVERY_JOURNEY.indexOf(assignment.status);

  const detail = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
    (e as Error)?.message ??
    fallback;

  const handleAdvance = async () => {
    if (!next || !id) return;
    try {
      await advance.mutateAsync({ assignmentId: id, target: next, ...(await position()) });
      toast({ title: ADVANCE_LABELS[next] });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Could not update",
        description: detail(e, "That step is not allowed right now."),
      });
    }
  };

  const handleVerify = async () => {
    if (!id || !code.trim()) return;
    try {
      await verifyOtp.mutateAsync({
        assignmentId: id,
        code: code.trim(),
        ...(await position()),
      });
      setCode("");
      toast({
        title: "Delivery confirmed",
        description: "The patient's order is now marked delivered.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Code not accepted",
        description: detail(e, "That code is not correct."),
      });
    }
  };

  return shell(
    <>
      <PageHeader
        title={DELIVERY_STATUS_LABELS[assignment.status]}
        subtitle={`₹${assignment.partner_earning.toFixed(2)} · ${
          assignment.distance_km ?? "—"
        } km`}
        breadcrumbs={[{ label: "Delivery" }, { label: "Orders" }, { label: "Detail" }]}
        actions={
          <button
            type="button"
            onClick={() => navigate("/delivery/orders")}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        }
      />

      <div className="space-y-6">
        <SectionCard title="Journey">
          <ol className="space-y-0">
            {DELIVERY_JOURNEY.map((stage, index) => {
              const done = index < currentIndex;
              const active = index === currentIndex;
              const isLast = index === DELIVERY_JOURNEY.length - 1;
              return (
                <li key={stage} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        done
                          ? "border-success bg-success text-white"
                          : active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border-subtle text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    {!isLast && (
                      <span
                        className={`h-8 w-0.5 ${done ? "bg-success" : "bg-border-subtle"}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p
                    className={`pb-2 ${
                      done || active ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {DELIVERY_STATUS_LABELS[stage]}
                  </p>
                </li>
              );
            })}
          </ol>

          {next && (
            <button
              type="button"
              onClick={handleAdvance}
              disabled={advance.isPending}
              className="mt-4 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {ADVANCE_LABELS[next]}
            </button>
          )}
        </SectionCard>

        <SectionCard title="Navigation">
          <div className="space-y-3">
            {mapMarkers.length > 0 && (
              <LazyMap markers={mapMarkers} height="260px" ariaLabel="Delivery route" />
            )}
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Heading to {route?.heading_to ?? "pharmacy"}
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-body-sm text-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {route?.destination_label || "—"}
              </p>
              <p className="mt-2 text-body-sm text-muted-foreground">
                {route?.distance_text ?? (route?.distance_km ? `${route.distance_km} km` : "—")}
                {" · "}
                {route?.duration_text ??
                  (route?.eta_minutes ? `${route.eta_minutes} min` : "—")}
              </p>
              {route && !route.maps_enabled && (
                // Stated rather than shown as a blank: the figure above is a
                // local estimate, not a live road reading.
                <p className="mt-2 text-body-sm text-warning">
                  Live traffic is unavailable — distance and time are estimates.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {route?.navigation_url && (
                <a
                  href={route.navigation_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </a>
              )}
              {route?.map_url && (
                <a
                  href={route.map_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
                >
                  <MapPin className="h-4 w-4" />
                  Open map
                </a>
              )}
            </div>
          </div>
        </SectionCard>

        {assignment.status === "at_patient" && !assignment.otp_verified && (
          <SectionCard
            title="Confirm handover"
            subtitle="Ask the patient for their delivery code"
          >
            <div className="flex flex-wrap gap-3">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                placeholder="6-digit code"
                className="flex-1 min-w-[160px] rounded-xl border border-border-subtle bg-background p-3 text-center font-mono text-headline-md tracking-widest text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={!code.trim() || verifyOtp.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                Confirm delivery
              </button>
            </div>
            {assignment.otp_attempts > 0 && (
              <p className="mt-2 text-body-sm text-warning">
                {assignment.otp_attempts} incorrect attempt(s) so far.
              </p>
            )}
            <p className="mt-2 text-body-sm text-muted-foreground">
              A delivery is only complete once this code is verified.
            </p>
          </SectionCard>
        )}

        {(assignment.status === "at_patient" || assignment.status === "delivered") && (
          <SectionCard title="Proof of delivery">
            <div className="space-y-3">
              <input
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder="Photo URL"
                className="w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                placeholder="Delivery notes"
                className="w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!id) return;
                  try {
                    await captureProof.mutateAsync({
                      assignmentId: id,
                      photo_url: photoUrl || null,
                      notes,
                      ...(await position()),
                    });
                    toast({ title: "Proof captured" });
                  } catch (e) {
                    toast({
                      variant: "destructive",
                      title: "Could not save proof",
                      description: detail(e, "The proof was not accepted."),
                    });
                  }
                }}
                disabled={captureProof.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
                Save proof
              </button>
              {assignment.proof_captured_at && (
                <p className="text-body-sm text-muted-foreground">
                  Captured {new Date(assignment.proof_captured_at).toLocaleString()} with GPS.
                </p>
              )}
            </div>
          </SectionCard>
        )}

        {assignment.status !== "delivered" && assignment.status !== "failed" && (
          <SectionCard title="Report a problem">
            {showFail ? (
              <div className="space-y-3">
                <input
                  value={failReason}
                  onChange={(event) => setFailReason(event.target.value)}
                  placeholder="What went wrong?"
                  className="w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!failReason.trim() || failDelivery.isPending}
                    onClick={async () => {
                      if (!id) return;
                      try {
                        await failDelivery.mutateAsync({
                          assignmentId: id,
                          reason: failReason.trim(),
                          ...(await position()),
                        });
                        toast({ title: "Delivery marked failed" });
                        setShowFail(false);
                      } catch (e) {
                        toast({
                          variant: "destructive",
                          title: "Could not report",
                          description: detail(e, "This delivery cannot be failed now."),
                        });
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-error-edge px-5 py-2.5 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Confirm failure
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFail(false)}
                    className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowFail(true)}
                className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground transition-all hover:bg-surface-container"
              >
                Cannot complete this delivery
              </button>
            )}
          </SectionCard>
        )}
      </div>
    </>,
  );
}

export default DeliveryOrders;
