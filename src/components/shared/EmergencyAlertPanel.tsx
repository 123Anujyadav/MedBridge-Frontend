import { useState } from "react";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  Siren, MapPin, Phone, Droplet, User, Clock, ExternalLink, Loader2,
} from "lucide-react";
import {
  SOS_STATUS_LABELS,
  useAdminEmergencies,
  useAdminUpdateEmergency,
  useDoctorEmergencies,
  useDoctorUpdateEmergency,
} from "@/hooks/useSOS";
import type { SOSEmergencyResponse, SOSStatus } from "@/types/api";

/** What a responder may move an emergency to, given where it is now. */
const NEXT_STATUSES: Record<string, { status: SOSStatus; label: string }[]> = {
  pending: [
    { status: "accepted", label: "Accept" },
    { status: "ambulance_dispatched", label: "Dispatch Ambulance" },
  ],
  accepted: [
    { status: "doctor_assigned", label: "Take Case" },
    { status: "ambulance_dispatched", label: "Dispatch Ambulance" },
  ],
  doctor_assigned: [
    { status: "ambulance_dispatched", label: "Dispatch Ambulance" },
    { status: "hospital_reached", label: "Hospital Reached" },
    { status: "resolved", label: "Resolve" },
  ],
  ambulance_dispatched: [
    { status: "hospital_reached", label: "Hospital Reached" },
    { status: "resolved", label: "Resolve" },
  ],
  hospital_reached: [{ status: "resolved", label: "Resolve" }],
};

function elapsed(from?: string | null): string {
  if (!from) return "";
  const started = new Date(from).getTime();
  if (Number.isNaN(started)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - started) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg bg-surface-container-low p-2.5">
      <div className="mb-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground break-words">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function EmergencyCard({
  emergency,
  onAdvance,
  isBusy,
}: {
  emergency: SOSEmergencyResponse;
  onAdvance: (status: SOSStatus) => void;
  isBusy: boolean;
}) {
  const options = NEXT_STATUSES[emergency.status] ?? [];

  return (
    <div className="rounded-xl border-2 border-destructive/30 bg-destructive/[0.03] p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Siren className="h-5 w-5 animate-pulse-soft" />
          </span>
          <div>
            <p className="font-headline text-headline-md text-foreground">
              {emergency.patient_name}
            </p>
            <p className="text-body-sm text-muted-foreground">
              {emergency.patient_age ? `${emergency.patient_age} yrs` : "Age unknown"}
              {emergency.assigned_doctor_name
                ? ` · ${emergency.assigned_doctor_name}`
                : " · Unassigned"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge variant={emergency.is_active ? "error" : "success"} dot={emergency.is_active}>
            {SOS_STATUS_LABELS[emergency.status] ?? emergency.status}
          </StatusBadge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {elapsed(emergency.triggered_at)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Fact icon={<Droplet className="h-3 w-3" />} label="Blood Group" value={emergency.blood_type} />
        <Fact icon={<Phone className="h-3 w-3" />} label="Patient" value={emergency.patient_phone} />
        <Fact
          icon={<User className="h-3 w-3" />}
          label="Emergency Contact"
          value={
            emergency.contact_name
              ? `${emergency.contact_name}${
                  emergency.contact_relationship ? ` (${emergency.contact_relationship})` : ""
                }`
              : null
          }
        />
        <Fact icon={<Phone className="h-3 w-3" />} label="Contact Number" value={emergency.contact_phone} />
      </div>

      <div className="mt-2 rounded-lg bg-surface-container-low p-2.5">
        <div className="mb-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> Address
        </div>
        <p className="text-sm font-medium text-foreground">{emergency.address || "—"}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {emergency.maps_url && (
          <a
            href={emergency.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Location
          </a>
        )}
        {options.map((option) => (
          <button
            key={option.status}
            onClick={() => onAdvance(option.status)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-container-low disabled:opacity-50"
          >
            {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The live emergency queue, for a clinician or an administrator.
 *
 * Kept current by the WebSocket rather than a timer — `useWebSocket`
 * invalidates the SOS keys when an emergency is raised or changes. Polling an
 * emergency dashboard would be slower to show the thing that matters and a
 * constant load for the long stretches when nothing is happening.
 *
 * Which emergencies arrive here is decided on the server: a clinician sees the
 * ones assigned to them plus the unclaimed queue, an administrator sees all.
 */
export function EmergencyAlertPanel({ portal }: { portal: "doctor" | "admin" }) {
  const { toast } = useToast();
  const [actingOn, setActingOn] = useState<string | null>(null);

  const doctorQuery = useDoctorEmergencies(true);
  const adminQuery = useAdminEmergencies(true);
  const doctorMutation = useDoctorUpdateEmergency();
  const adminMutation = useAdminUpdateEmergency();

  const query = portal === "doctor" ? doctorQuery : adminQuery;
  const mutation = portal === "doctor" ? doctorMutation : adminMutation;

  const emergencies = query.data ?? [];

  const advance = async (id: string, status: SOSStatus) => {
    setActingOn(id);
    try {
      await mutation.mutateAsync({ id, status });
      toast({
        title: "Emergency updated",
        description: `Marked as ${SOS_STATUS_LABELS[status] ?? status}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not update emergency",
        description: (err as Error)?.message || "Please try again.",
      });
    } finally {
      setActingOn(null);
    }
  };

  if (query.isLoading) {
    return (
      <SectionCard title="Active Emergencies">
        <div className="h-24 animate-pulse rounded-xl bg-surface-container-low" />
      </SectionCard>
    );
  }

  if (query.isError) {
    return (
      <SectionCard title="Active Emergencies">
        <p className="text-body-sm text-muted-foreground">
          The emergency queue could not be loaded.
        </p>
      </SectionCard>
    );
  }

  if (emergencies.length === 0) return null; // nothing to shout about

  return (
    <SectionCard
      title={`Active Emergencies (${emergencies.length})`}
      subtitle="Live — updates arrive as responders act"
    >
      <div className="space-y-3">
        {emergencies.map((emergency) => (
          <EmergencyCard
            key={emergency.id}
            emergency={emergency}
            isBusy={actingOn === emergency.id}
            onAdvance={(status) => advance(emergency.id, status)}
          />
        ))}
      </div>
    </SectionCard>
  );
}
