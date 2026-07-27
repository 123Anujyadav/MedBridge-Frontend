import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard, HealthScoreRing } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientProfile, useUpdateProfile } from "@/hooks/usePatient";
import { useRemovePatientAvatar, useUploadPatientAvatar } from "@/hooks/useAvatar";
import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { useAuth } from "@/context/AuthContext";
import { User, Phone, Mail, MapPin, Heart, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading, isError, error, refetch } = usePatientProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadPatientAvatar();
  const removeAvatar = useRemovePatientAvatar();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search profile...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError || !profile) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search profile...">
        <ErrorState title="Failed to Load Profile" description={(error as Error)?.message || "Could not fetch profile information."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;

    try {
      await updateProfile.mutateAsync({
        phone: phone || profile.phone,
        address: address || profile.address,
        city: city || profile.city,
        state: state || profile.state,
      });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      setIsEditing(false);
    } catch {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save profile changes." });
    }
  };

  return (
    <AppShell portal="patient" userName={`${profile.first_name} ${profile.last_name}`} userRole="Patient Portal" searchPlaceholder="Search profile...">
      <PageHeader
        title="Patient Profile"
        subtitle="Your complete health profile and personal information."
        breadcrumbs={[{ label: "Patient" }, { label: "Profile" }]}
        actions={
          <button onClick={() => setIsEditing(!isEditing)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90">
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        }
      />

      {/* Edit Form Modal/Drawer */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="mb-6 rounded-2xl border border-primary/20 bg-card p-6 shadow-card space-y-4">
          <h3 className="font-headline text-headline-md text-foreground">Update Demographics</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <input name="phone" defaultValue={profile.phone} className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Street Address</label>
              <input name="address" defaultValue={profile.address || ""} className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">City</label>
              <input name="city" defaultValue={profile.city || ""} className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">State</label>
              <input name="state" defaultValue={profile.state || ""} className="mt-1 w-full rounded-xl border border-border-subtle p-3 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={updateProfile.isPending} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Profile Header */}
      <div className="mb-6 premium-card p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <AvatarUploader
            avatarUrl={profile.avatar_url}
            name={`${profile.first_name} ${profile.last_name}`}
            avatarClassName="h-24 w-24 rounded-3xl"
            onUpload={(file) => uploadAvatar.mutateAsync(file)}
            onRemove={() => removeAvatar.mutateAsync()}
            isUploading={uploadAvatar.isPending}
            isRemoving={removeAvatar.isPending}
          />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-headline text-headline-lg text-foreground">{profile.first_name} {profile.last_name}</h2>
            <p className="text-body-md text-muted-foreground">Patient Account • {profile.insurance_provider || "No Insurance"}</p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <StatusBadge variant="success" dot>Active Record</StatusBadge>
              <StatusBadge variant="info">{profile.blood_type || "Blood Type Unspecified"}</StatusBadge>
              <StatusBadge variant="neutral">{profile.gender.toUpperCase()}</StatusBadge>
            </div>
          </div>
          <HealthScoreRing score={profile.health_score} size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <SectionCard title="Contact Information">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Account Email", value: user?.email || "N/A" },
              { icon: Phone, label: "Phone", value: profile.phone },
              { icon: MapPin, label: "Address", value: profile.address ? `${profile.address}, ${profile.city}, ${profile.state}` : "Not provided" },
              { icon: User, label: "Emergency Contact", value: `${profile.emergency_contact?.name || "N/A"} (${profile.emergency_contact?.relationship || ""})` },
              { icon: Phone, label: "Emergency Phone", value: profile.emergency_contact?.phone || "N/A" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    <p className="text-body-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Medical Info */}
        <SectionCard title="Medical Parameters">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-semibold text-foreground">{profile.date_of_birth}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-semibold text-foreground capitalize">{profile.gender}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="font-semibold text-foreground">{profile.height ? `${profile.height} cm` : "N/A"}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">{profile.weight ? `${profile.weight} kg` : "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Known Allergies</p>
              <div className="flex flex-wrap gap-2">
                {profile.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((a) => (
                    <span key={a} className="flex items-center gap-1.5 rounded-lg bg-error-soft px-3 py-1.5 text-body-sm font-medium text-error-edge">
                      <AlertTriangle className="h-3.5 w-3.5" /> {a}
                    </span>
                  ))
                ) : (
                  <span className="text-body-sm text-muted-foreground">No known allergies</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
                  profile.chronic_conditions.map((c) => (
                    <span key={c} className="flex items-center gap-1.5 rounded-lg bg-warning-soft px-3 py-1.5 text-body-sm font-medium text-warning">
                      <Heart className="h-3.5 w-3.5" /> {c}
                    </span>
                  ))
                ) : (
                  <span className="text-body-sm text-muted-foreground">None recorded</span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Insurance */}
        <SectionCard title="Insurance Details">
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider</p>
              <p className="mt-1 font-semibold text-foreground">{profile.insurance_provider || "Self-Pay"}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insurance ID / Policy Number</p>
              <p className="mt-1 font-semibold text-foreground">{profile.insurance_number || "N/A"}</p>
            </div>
          </div>
        </SectionCard>

        {/* Consent Summary */}
        <div className="lg:col-span-3">
          <SectionCard title="HIPAA Consent Flags" subtitle="Your active privacy and data sharing settings">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Data Sharing", value: profile.consent_flags?.dataSharing },
                { label: "AI Processing", value: profile.consent_flags?.aiProcessing },
                { label: "Emergency Access", value: profile.consent_flags?.emergencyAccess },
                { label: "Research", value: profile.consent_flags?.researchParticipation },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 rounded-xl border border-border-subtle p-3">
                  <Shield className={`h-5 w-5 ${c.value ? "text-success" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{c.label}</p>
                    <StatusBadge variant={c.value ? "success" : "neutral"}>{c.value ? "Granted" : "Denied"}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
