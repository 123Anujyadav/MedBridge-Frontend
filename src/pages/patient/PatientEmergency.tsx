import { useCallback, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { Siren, Cross, Ambulance, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmergencyProfileSection } from "@/components/patient/emergency/EmergencyProfileSection";
import { SOSConfirmDialog } from "@/components/patient/emergency/SOSConfirmDialog";
import { SOSLiveStatus } from "@/components/patient/emergency/SOSLiveStatus";
import { SOSCommunicationPanel } from "@/components/patient/emergency/SOSCommunicationPanel";
import { NearbyHospitals } from "@/components/patient/emergency/NearbyHospitals";
import { useActiveSOS, useCancelMySOS, useTriggerSOS } from "@/hooks/useSOS";
import { requestBrowserLocation } from "@/hooks/useEmergencyProfile";

export default function PatientEmergency() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: activeSOS, isLoading: isSOSLoading } = useActiveSOS();
  const triggerSOS = useTriggerSOS();
  const cancelSOS = useCancelMySOS();

  const [confirming, setConfirming] = useState(false);
  // Bumped after an SOS is raised so the facility list re-queries against the
  // position that was just shared, rather than showing a pre-emergency cache.
  const [hospitalRefresh, setHospitalRefresh] = useState(0);

  const emergency = activeSOS?.emergency ?? null;
  const hasActive = !!activeSOS?.active;

  /**
   * Raise the emergency once the countdown finishes.
   *
   * The live position is requested first, but a refusal is not fatal: the
   * request is sent without coordinates and the server falls back to the
   * position stored on the emergency profile. Someone who declined a browser
   * prompt still gets an ambulance.
   */
  const handleConfirm = useCallback(async () => {
    let coords: { latitude: number; longitude: number } | null = null;
    try {
      coords = await requestBrowserLocation();
    } catch {
      coords = null;
    }

    try {
      await triggerSOS.mutateAsync(coords ?? {});
      setConfirming(false);
      setHospitalRefresh((n) => n + 1);
      toast({
        title: "Emergency raised",
        description: coords
          ? "Your live location has been shared with the response team."
          : "Location access was unavailable, so your saved location was used.",
      });
    } catch (err) {
      setConfirming(false);
      toast({
        variant: "destructive",
        title: "Could not raise emergency",
        description:
          (err as Error)?.message ||
          "Your emergency could not be raised. Please call your local emergency number.",
      });
    }
  }, [triggerSOS, toast]);

  const handleCancel = async () => {
    if (!emergency) return;
    try {
      await cancelSOS.mutateAsync({ id: emergency.id, reason: "Cancelled by patient" });
      toast({
        title: "Emergency cancelled",
        description: "The response team has been notified that you stood it down.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not cancel",
        description: (err as Error)?.message || "Please try again.",
      });
    }
  };

  const isProfileLoading = isSOSLoading;

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

      {/* Emergency SOS Banner.
          The old banner counted down a hard-coded twelve-minute ETA against a
          fabricated ambulance the moment the button was pressed. Nothing had
          been dispatched. It now reflects the real record: raised, assigned,
          dispatched, and so on, each written by a responder. */}
      <div className="mb-6 rounded-3xl bg-destructive p-8 text-destructive-foreground transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 animate-pulse-soft">
            <Siren className="h-10 w-10" />
          </div>
          <h2 className="font-headline text-headline-lg mb-2">Emergency SOS</h2>
          <p className="text-body-md text-destructive-foreground/80 mb-6 max-w-md">
            Raising an SOS shares your saved location and emergency contact with
            the response team. Use it only in a genuine emergency.
          </p>

          {hasActive ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-6 py-4">
              <ShieldAlert className="h-6 w-6" />
              <div className="text-left">
                <p className="font-headline text-headline-md">Emergency already active</p>
                <p className="text-body-sm text-destructive-foreground/80">
                  Its live status is shown below.
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={triggerSOS.isPending}
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-headline text-headline-md font-semibold text-destructive shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Ambulance className="h-7 w-7" />
              {triggerSOS.isPending ? "Raising..." : "Call Ambulance (SOS)"}
            </button>
          )}
        </div>
      </div>

      <SOSConfirmDialog
        open={confirming}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
        isSubmitting={triggerSOS.isPending}
      />

      {emergency && (
        <div className="mb-6">
          <SOSLiveStatus
            emergency={emergency}
            onCancel={handleCancel}
            isCancelling={cancelSOS.isPending}
          />
        </div>
      )}

      {/* Who has been contacted, and what the platform found. Sits directly
          under the live status because it answers the question a patient asks
          next: "has anyone been told?" */}
      {emergency && (
        <div className="mb-6">
          <SOSCommunicationPanel emergencyId={emergency.id} />
        </div>
      )}

      {/* Emergency Profile — real data, editable in place.
          Replaces the "No Contact Specified" / "Address Not Recorded"
          placeholders, which read from the three-key `patients.emergency_contact`
          JSON blob and had no way to be filled in. */}
      <div className="mb-6">
        <EmergencyProfileSection />
      </div>

      <div className="mb-6">
        <SectionCard title="Direct Emergency Call">
          <div className="space-y-2">
            <a href="tel:911" className="flex w-full items-center gap-3 rounded-xl border border-border-subtle p-3 text-left transition-all hover:bg-surface-container-low">
              <Cross className="h-5 w-5 text-destructive" />
              <div><p className="font-semibold text-foreground text-sm">Call 911</p><p className="text-xs text-muted-foreground">Local Emergency Services</p></div>
            </a>
          </div>
        </SectionCard>
      </div>

      <NearbyHospitals refreshToken={hospitalRefresh} />

    </AppShell>
  );
}
