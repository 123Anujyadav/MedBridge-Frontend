import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientSettings, useUpdateSettings, usePatientProfile, useUpdateConsent } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Bell, Lock, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: settings, isLoading: isSettingsLoading, isError, error, refetch } = usePatientSettings();
  const { data: profile } = usePatientProfile();
  const updateSettings = useUpdateSettings();
  const updateConsent = useUpdateConsent();

  if (isSettingsLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search settings...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError || !settings) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search settings...">
        <ErrorState title="Failed to Load Settings" description={(error as Error)?.message || "Could not retrieve user preferences."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleToggleNotification = async (key: "notifications_enabled" | "email_notifications" | "marketing_emails", currentValue: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: !currentValue });
      toast({ title: "Preference Updated", description: "Settings saved successfully." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update notification settings." });
    }
  };

  const handleToggleConsent = async (key: "dataSharing" | "aiProcessing" | "emergencyAccess" | "researchParticipation") => {
    if (!profile) return;
    const currentFlags = profile.consent_flags || { dataSharing: true, aiProcessing: true, emergencyAccess: true, researchParticipation: false };
    const updatedFlags = { ...currentFlags, [key]: !currentFlags[key] };
    try {
      await updateConsent.mutateAsync(updatedFlags);
      toast({ title: "HIPAA Consent Updated", description: `Updated ${key} consent preference.` });
    } catch {
      toast({ variant: "destructive", title: "Consent Update Error", description: "Could not save consent flag." });
    }
  };

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search settings...">
      <PageHeader
        title="Settings & Consent Management"
        subtitle="Manage your account, privacy, notification preferences, and HIPAA consent records."
        breadcrumbs={[{ label: "Patient" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notification Preferences */}
        <SectionCard title="Notification Preferences" subtitle="Configured via Redis Session Store">
          <div className="space-y-3">
            {[
              { key: "notifications_enabled" as const, label: "Platform Notifications", val: settings.notifications_enabled },
              { key: "email_notifications" as const, label: "Email Alerts", val: settings.email_notifications },
              { key: "marketing_emails" as const, label: "System Updates", val: settings.marketing_emails },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="text-body-sm font-medium text-foreground">{item.label}</span>
                </div>
                <button onClick={() => handleToggleNotification(item.key, item.val)} disabled={updateSettings.isPending}>
                  {item.val ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Consent & Privacy */}
        <SectionCard title="HIPAA Consent & Privacy" subtitle="Enforced by PostgreSQL Record">
          <div className="space-y-3">
            {[
              { key: "dataSharing" as const, label: "Care Team Data Sharing", desc: "Share health telemetry with assigned clinicians" },
              { key: "aiProcessing" as const, label: "AI Diagnostic Processing", desc: "Allow automated symptom triage and parsing" },
              { key: "emergencyAccess" as const, label: "Emergency SOS Sharing", desc: "Share GPS location during ambulance call" },
              { key: "researchParticipation" as const, label: "Anonymized Research", desc: "Contribute de-identified metrics for AI research" },
            ].map((item) => {
              const flags = profile?.consent_flags || { dataSharing: true, aiProcessing: true, emergencyAccess: true, researchParticipation: false };
              const isEnabled = flags[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`h-5 w-5 ${isEnabled ? "text-success" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-body-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggleConsent(item.key)} disabled={updateConsent.isPending}>
                    {isEnabled ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                  </button>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Security Summary */}
        <div className="lg:col-span-2">
          <SectionCard title="Security Hardening" subtitle="Session and authentication telemetry">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">JWT Session Status</p>
                    <p className="text-body-sm text-muted-foreground">Bearer Token Active (15 min rotation)</p>
                  </div>
                </div>
                <StatusBadge variant="success" dot>Active</StatusBadge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Role Guard</p>
                    <p className="text-body-sm text-muted-foreground">Patient Access Scope</p>
                  </div>
                </div>
                <StatusBadge variant="info">Verified</StatusBadge>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
