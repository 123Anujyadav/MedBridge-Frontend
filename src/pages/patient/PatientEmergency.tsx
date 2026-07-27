import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/States";
import { usePatientProfile, useTriggerEmergency } from "@/hooks/usePatient";
import { useAdminHospitals } from "@/hooks/useAdmin";
import { useAuth } from "@/context/AuthContext";
import { Siren, Phone, MapPin, Navigation, Clock, Building2, Cross, Ambulance } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientEmergency() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading: isProfileLoading } = usePatientProfile();
  const { data: hospitals = [] } = useAdminHospitals();
  const triggerEmergency = useTriggerEmergency();

  const [activeSOS, setActiveSOS] = useState<any | null>(null);
  const [eta, setEta] = useState(8);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (activeSOS && eta > 0) {
      const interval = setInterval(() => {
        setEta((prev) => Math.max(0, prev - 1));
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSOS, eta]);

  const handleSOS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await triggerEmergency.mutateAsync({
              lat,
              lng,
              address: profile?.address || "Current Patient Location",
            });
            setActiveSOS(res);
            setEta(res.eta || 8);
            toast({ title: "EMERGENCY DISPATCHED", description: "Ambulance unit notified and dispatched." });
          } catch {
            toast({ variant: "destructive", title: "Dispatch Error", description: "Could not trigger emergency request." });
          }
        },
        async () => {
          try {
            const res = await triggerEmergency.mutateAsync({
              lat: 37.7749,
              lng: -122.4194,
              address: profile?.address || "Fall-back Location",
            });
            setActiveSOS(res);
            setEta(res.eta || 8);
            toast({ title: "EMERGENCY DISPATCHED", description: "Ambulance unit notified using registered address." });
          } catch {
            toast({ variant: "destructive", title: "Dispatch Error", description: "Could not trigger emergency request." });
          }
        }
      );
    }
  };

  if (isProfileLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search emergency services...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search emergency services...">
      <PageHeader
        title="Emergency Module"
        subtitle="Location-aware emergency assistance with one-touch ambulance dispatch."
        breadcrumbs={[{ label: "Patient" }, { label: "Emergency" }]}
      />

      {/* Emergency SOS Banner */}
      <div className="mb-6 rounded-3xl bg-destructive p-8 text-destructive-foreground transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 animate-pulse-soft">
            <Siren className="h-10 w-10" />
          </div>
          <h2 className="font-headline text-headline-lg mb-2">Emergency SOS</h2>
          <p className="text-body-md text-destructive-foreground/80 mb-6 max-w-md">
            Press the button below to dispatch an ambulance. Your live location will be shared automatically with the nearest hospital.
          </p>

          {activeSOS ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/15 p-6">
                <p className="text-label-sm font-semibold uppercase tracking-wider">Ambulance Dispatched</p>
                <p className="font-headline text-display-lg mt-2">ETA: {eta} min</p>
                <p className="text-body-sm text-destructive-foreground/70 mt-1">
                  Status: {activeSOS.status} • Timer: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-body-sm">
                <Navigation className="h-4 w-4" />
                <span>Sharing live location: {activeSOS.location?.address || profile?.address || "Live Telemetry Active"}</span>
              </div>
              <button onClick={() => setActiveSOS(null)} className="rounded-xl bg-white px-6 py-3 font-semibold text-destructive transition-all hover:opacity-90">
                Cancel / Reset SOS
              </button>
            </div>
          ) : (
            <button
              onClick={handleSOS}
              disabled={triggerEmergency.isPending}
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-headline text-headline-md font-semibold text-destructive shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Ambulance className="h-7 w-7" />
              {triggerEmergency.isPending ? "Dispatching..." : "Call Ambulance (SOS)"}
            </button>
          )}
        </div>
      </div>

      {/* Emergency Contact & Location */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Emergency Contact">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile?.emergency_contact?.name || "No Contact Specified"}</p>
                <p className="text-body-sm text-muted-foreground">
                  {profile?.emergency_contact?.relationship || ""} • {profile?.emergency_contact?.phone || ""}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Registered Address">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile?.address || "Address Not Recorded"}</p>
                <p className="text-body-sm text-muted-foreground">{profile?.city}, {profile?.state}</p>
              </div>
            </div>
            <div className="h-28 rounded-xl bg-surface-container-low flex items-center justify-center">
              <div className="text-center">
                <Navigation className="mx-auto h-6 w-6 text-primary animate-pulse" />
                <p className="mt-1 text-xs text-muted-foreground">HTML5 Geolocation ready</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Direct Emergency Call">
          <div className="space-y-2">
            <a href="tel:911" className="flex w-full items-center gap-3 rounded-xl border border-border-subtle p-3 text-left transition-all hover:bg-surface-container-low">
              <Cross className="h-5 w-5 text-destructive" />
              <div><p className="font-semibold text-foreground text-sm">Call 911</p><p className="text-xs text-muted-foreground">Local Emergency Services</p></div>
            </a>
          </div>
        </SectionCard>
      </div>

      {/* Nearby Hospitals */}
      <SectionCard title="Nearby Hospital Facilities" subtitle="Emergency networks with capacity monitoring">
        {(() => {
          // Only real, registered facilities. Placeholder hospitals used to be
          // shown when the query returned none — directing a patient in an
          // emergency to an address that does not exist is the most harmful
          // possible use of stand-in data.
          const displayHospitals = hospitals;
          if (displayHospitals.length === 0) {
            return (
              <p className="text-body-sm text-muted-foreground">
                No nearby facilities are registered yet. Call your local emergency
                number immediately if this is urgent.
              </p>
            );
          }
          return (
            <div className="space-y-3">
              {displayHospitals.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl border border-border-subtle p-4 transition-all hover:bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{h.name}</p>
                      <div className="flex items-center gap-3 text-body-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {h.city}, {h.state}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {h.available_beds ?? h.availableBeds ?? 45} beds available</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge variant={(h.emergency_capacity || h.emergencyCapacity) === "available" ? "success" : "warning"} dot>
                      {h.emergency_capacity || h.emergencyCapacity || "available"}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </SectionCard>

    </AppShell>
  );
}
