import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { useDoctorProfile, useUpdateAvailability } from "@/hooks/useDoctor";
import { useRemoveDoctorAvatar, useUploadDoctorAvatar } from "@/hooks/useAvatar";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { useAuth } from "@/context/AuthContext";
import { Lock, Bell, ShieldCheck, Stethoscope, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading, isError, error, refetch } = useDoctorProfile();
  const updateAvailability = useUpdateAvailability();
  const uploadAvatar = useUploadDoctorAvatar();
  const removeAvatar = useRemoveDoctorAvatar();

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search settings...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError || !profile) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search settings...">
        <ErrorState title="Failed to Load Settings" description={(error as Error)?.message || "Could not retrieve doctor profile."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleToggle = async () => {
    const nextStatus = profile.availability === "available" ? "busy" : "available";
    try {
      await updateAvailability.mutateAsync({ availability: nextStatus, next_available: "Now" });
      toast({ title: "Availability Changed", description: `Set to ${nextStatus}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update availability." });
    }
  };

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search settings...">
      <PageHeader title="Settings" subtitle="Manage your profile, availability, notifications, and security." breadcrumbs={[{ label: "Doctor" }, { label: "Settings" }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Professional Profile">
          <div className="mb-6 flex justify-center border-b border-border-subtle pb-6">
            <AvatarUploader
              avatarUrl={profile.avatar_url}
              name={`Dr. ${profile.first_name} ${profile.last_name}`}
              avatarClassName="h-24 w-24 rounded-3xl"
              onUpload={(file) => uploadAvatar.mutateAsync(file)}
              onRemove={() => removeAvatar.mutateAsync()}
              isUploading={uploadAvatar.isPending}
              isRemoving={removeAvatar.isPending}
            />
          </div>
          <div className="space-y-4">
            {[
              { label: "Full Name", value: `Dr. ${profile.first_name} ${profile.last_name}` },
              { label: "Specialty", value: profile.specialty },
              { label: "License Number", value: profile.license_number },
              { label: "Hospital", value: profile.hospital_name || "Independent Practice" },
              { label: "Years of Experience", value: profile.years_of_experience ? `${profile.years_of_experience} years` : "N/A" },
              { label: "Verification Status", value: profile.verification_status.toUpperCase() },
            ].map((item) => (
              <div key={item.label} className="flex justify-between border-b border-border-subtle pb-3">
                <span className="text-body-sm text-muted-foreground">{item.label}</span>
                <span className="text-body-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Availability & Credentials">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-primary" />
                <div><p className="font-semibold text-foreground">Availability Status</p><p className="text-body-sm text-muted-foreground">Toggle open consultation status</p></div>
              </div>
              <button onClick={handleToggle} disabled={updateAvailability.isPending}>
                <StatusBadge variant={profile.availability === "available" ? "success" : "warning"} dot>{profile.availability}</StatusBadge>
              </button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border-subtle p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div><p className="font-semibold text-foreground">License Verification</p><p className="text-body-sm text-muted-foreground">Verified against state registry</p></div>
              </div>
              <StatusBadge variant={profile.is_verified ? "success" : "neutral"} dot>{profile.is_verified ? "Verified" : "Pending"}</StatusBadge>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
