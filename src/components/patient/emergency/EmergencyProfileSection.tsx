import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  MapPin,
  Navigation,
  Pencil,
  Trash2,
  Save,
  X,
  LocateFixed,
  ExternalLink,
  UserRound,
  AlertCircle,
} from "lucide-react";
import {
  requestBrowserLocation,
  useClearEmergencyLocation,
  useDeleteEmergencyProfile,
  useEmergencyProfile,
  useSaveEmergencyProfile,
  useUpdateEmergencyLocation,
  type GeolocationFailure,
} from "@/hooks/useEmergencyProfile";
import {
  EMPTY_EMERGENCY_FORM,
  cleanPhone,
  cleanPincode,
  cleanText,
  validateEmergencyForm,
  type EmergencyFormErrors,
  type EmergencyFormValues,
} from "./emergencyProfileValidation";

/** A labelled input with its validation message beneath it. */
function Field({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  maxLength,
}: {
  label: string;
  name: keyof EmergencyFormValues;
  value: string;
  onChange: (name: keyof EmergencyFormValues, value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = `emergency-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full rounded-xl border bg-card px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/10 ${
          error
            ? "border-destructive focus:border-destructive"
            : "border-border-subtle focus:border-primary"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** A read-only label/value pair. */
function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground break-words">{value || "—"}</p>
    </div>
  );
}

export function EmergencyProfileSection() {
  const { toast } = useToast();
  const { data: profile, isLoading, isError, refetch } = useEmergencyProfile();

  const saveProfile = useSaveEmergencyProfile();
  const updateLocation = useUpdateEmergencyLocation();
  const clearLocation = useClearEmergencyLocation();
  const deleteProfile = useDeleteEmergencyProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<EmergencyFormValues>(EMPTY_EMERGENCY_FORM);
  const [errors, setErrors] = useState<EmergencyFormErrors>({});
  const [locating, setLocating] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  /** The stored profile, flattened back into form fields. */
  const formFromProfile = useMemo<EmergencyFormValues>(() => {
    if (!profile) return EMPTY_EMERGENCY_FORM;
    return {
      contact_name: profile.contact_name ?? "",
      contact_phone: profile.contact_phone ?? "",
      contact_relationship: profile.contact_relationship ?? "",
      alternate_phone: profile.alternate_phone ?? "",
      house_number: profile.house_number ?? "",
      street: profile.street ?? "",
      landmark: profile.landmark ?? "",
      locality: profile.locality ?? "",
      city: profile.city ?? "",
      district: profile.district ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "India",
      pincode: profile.pincode ?? "",
    };
  }, [profile]);

  /**
   * Whether the form is on screen.
   *
   * Not the same as `isEditing`: a patient with no profile yet is shown the
   * form without ever pressing Edit. Guarding the seeding effect on `isEditing`
   * alone meant that first-time case was unguarded, so any refetch that landed
   * while they were filling it in reset every field to blank.
   */
  const showForm = isEditing || !profile;

  // Seed the form from the server's copy, but never while it is on screen —
  // a refetch arriving mid-edit would otherwise discard what has been typed.
  useEffect(() => {
    if (!showForm) setValues(formFromProfile);
  }, [formFromProfile, showForm]);

  const setField = (name: keyof EmergencyFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear the message as soon as the field is touched; re-validated on save.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSave = async () => {
    const found = validateEmergencyForm(values);
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      toast({
        variant: "destructive",
        title: "Check the highlighted fields",
        description: "Some details are missing or not in the expected format.",
      });
      return;
    }
    setErrors({});

    try {
      await saveProfile.mutateAsync({
        contact: {
          contact_name: cleanText(values.contact_name),
          contact_phone: cleanPhone(values.contact_phone),
          contact_relationship: cleanText(values.contact_relationship),
          alternate_phone: cleanPhone(values.alternate_phone) || null,
        },
        address: {
          house_number: cleanText(values.house_number),
          street: cleanText(values.street),
          landmark: cleanText(values.landmark) || null,
          locality: cleanText(values.locality),
          city: cleanText(values.city),
          district: cleanText(values.district),
          state: cleanText(values.state),
          country: cleanText(values.country),
          pincode: cleanPincode(values.pincode),
        },
      });
      setIsEditing(false);
      toast({
        title: "Emergency profile saved",
        description: "Your emergency contact and address have been updated.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not save",
        description:
          (err as Error)?.message ||
          "Your emergency profile could not be saved. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setValues(formFromProfile);
    setErrors({});
    setIsEditing(false);
  };

  const handleUseCurrentLocation = async () => {
    if (!profile) {
      toast({
        variant: "destructive",
        title: "Save your details first",
        description:
          "Add your emergency contact and address before capturing your location.",
      });
      return;
    }

    setLocating(true);
    try {
      const coords = await requestBrowserLocation();
      await updateLocation.mutateAsync(coords);
      toast({
        title: "Location captured",
        description: "Your current coordinates have been saved to your profile.",
      });
    } catch (err) {
      // Covers a denied permission, an unavailable sensor, a timeout and a
      // rejected save alike. The page stays on screen either way.
      const failure = err as GeolocationFailure & { message?: string };
      toast({
        variant: "destructive",
        title:
          failure?.code === "denied"
            ? "Location permission denied"
            : "Could not capture location",
        description:
          failure?.message ||
          "Your location could not be captured. Please try again.",
      });
    } finally {
      setLocating(false);
    }
  };

  const handleClearLocation = async () => {
    try {
      await clearLocation.mutateAsync();
      toast({
        title: "Location removed",
        description: "Your stored coordinates have been deleted.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not remove location",
        description: (err as Error)?.message || "Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProfile.mutateAsync();
      setConfirmingDelete(false);
      setIsEditing(false);
      setValues(EMPTY_EMERGENCY_FORM);
      toast({
        title: "Emergency profile deleted",
        description: "Your emergency contact and address have been removed.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not delete",
        description: (err as Error)?.message || "Please try again.",
      });
    }
  };

  // ── loading / error ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SectionCard title="Emergency Profile">
        <div className="space-y-3" role="status" aria-label="Loading emergency profile">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-container-low" />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (isError) {
    return (
      <SectionCard title="Emergency Profile">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="font-medium text-foreground">
            Your emergency profile could not be loaded.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </SectionCard>
    );
  }

  const saving = saveProfile.isPending;
  const hasProfile = !!profile;

  // ── edit mode ──────────────────────────────────────────────────────────

  if (showForm) {
    return (
      <SectionCard
        title="Emergency Profile"
        subtitle={
          hasProfile
            ? "Update the contact and address used in an emergency"
            : "Add the contact and address to be used in an emergency"
        }
      >
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <UserRound className="h-4 w-4 text-primary" /> Emergency Contact
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Contact Name" name="contact_name" required maxLength={120}
                placeholder="Ravi Kumar"
                value={values.contact_name} onChange={setField} error={errors.contact_name} />
              <Field label="Relationship" name="contact_relationship" required maxLength={60}
                placeholder="Brother"
                value={values.contact_relationship} onChange={setField} error={errors.contact_relationship} />
              <Field label="Contact Number" name="contact_phone" required maxLength={20}
                placeholder="+91 98765 43210"
                value={values.contact_phone} onChange={setField} error={errors.contact_phone} />
              <Field label="Alternative Number (optional)" name="alternate_phone" maxLength={20}
                placeholder="+91 98765 43211"
                value={values.alternate_phone} onChange={setField} error={errors.alternate_phone} />
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Registered Address
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="House Number" name="house_number" required maxLength={60}
                placeholder="12/A" value={values.house_number} onChange={setField} error={errors.house_number} />
              <Field label="Street" name="street" required maxLength={150}
                placeholder="Gandhi Road" value={values.street} onChange={setField} error={errors.street} />
              <Field label="Landmark (optional)" name="landmark" maxLength={150}
                placeholder="Near City Hospital" value={values.landmark} onChange={setField} error={errors.landmark} />
              <Field label="Village / Locality" name="locality" required maxLength={120}
                placeholder="Rajendra Nagar" value={values.locality} onChange={setField} error={errors.locality} />
              <Field label="City" name="city" required maxLength={100}
                placeholder="Patna" value={values.city} onChange={setField} error={errors.city} />
              <Field label="District" name="district" required maxLength={100}
                placeholder="Patna" value={values.district} onChange={setField} error={errors.district} />
              <Field label="State" name="state" required maxLength={100}
                placeholder="Bihar" value={values.state} onChange={setField} error={errors.state} />
              <Field label="Country" name="country" required maxLength={100}
                placeholder="India" value={values.country} onChange={setField} error={errors.country} />
              <Field label="Pincode" name="pincode" required maxLength={12}
                placeholder="800001" value={values.pincode} onChange={setField} error={errors.pincode} />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end">
            {hasProfile && (
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Emergency Profile
                </>
              )}
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  // ── view mode ──────────────────────────────────────────────────────────

  return (
    <SectionCard
      title="Emergency Profile"
      subtitle="Used by emergency services to reach you and your contact"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Contact */}
          <div className="rounded-xl border border-border-subtle p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-foreground">Emergency Contact</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Name" value={profile.contact_name} />
              <Detail label="Relationship" value={profile.contact_relationship} />
              <Detail label="Phone" value={profile.contact_phone} />
              <Detail label="Alternative" value={profile.alternate_phone} />
            </div>
            <a
              href={`tel:${profile.contact_phone}`}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low"
            >
              <Phone className="h-3.5 w-3.5" /> Call {profile.contact_name.split(" ")[0]}
            </a>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-border-subtle p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-foreground">Registered Address</h4>
            </div>
            <p className="text-sm font-medium text-foreground">
              {profile.formatted_address}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Detail label="Landmark" value={profile.landmark} />
              <Detail label="Pincode" value={profile.pincode} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-xl border border-border-subtle p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Navigation className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-foreground">Current Location</h4>
            </div>
            {profile.latitude != null ? (
              <StatusBadge variant="success" dot>Coordinates saved</StatusBadge>
            ) : (
              <StatusBadge variant="neutral">Not captured</StatusBadge>
            )}
          </div>

          {profile.latitude != null && profile.longitude != null ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Latitude" value={profile.latitude.toFixed(6)} />
                <Detail label="Longitude" value={profile.longitude.toFixed(6)} />
              </div>
              {profile.location_updated_at && (
                <p className="text-xs text-muted-foreground">
                  Captured {new Date(profile.location_updated_at).toLocaleString()}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {profile.maps_url && (
                  <a
                    href={profile.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                  </a>
                )}
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={locating || updateLocation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  {locating ? "Locating..." : "Update Location"}
                </button>
                <button
                  onClick={handleClearLocation}
                  disabled={clearLocation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-xs font-semibold text-error-edge hover:bg-error-soft disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Location
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Share your position so emergency services can find you faster. Your
                browser will ask for permission.
              </p>
              <button
                onClick={handleUseCurrentLocation}
                disabled={locating || updateLocation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                {locating ? "Locating..." : "Use Current Location"}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end">
          {confirmingDelete ? (
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground">
                Delete your emergency profile? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-xl border border-border-subtle px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Keep it
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteProfile.isPending}
                  className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {deleteProfile.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-error-edge transition-colors hover:bg-error-soft"
              >
                <Trash2 className="h-4 w-4" /> Delete Profile
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
