import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreatePharmacy } from "@/hooks/usePharmacyAdmin";

interface FormState {
  name: string;
  business_name: string;
  owner_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  whatsapp: string;
  emergency_phone: string;
  latitude: string;
  longitude: string;
  gst_number: string;
  drug_license_number: string;
  is_24x7: boolean;
  opens_at: string;
  closes_at: string;
  delivers: boolean;
  express_delivery: boolean;
  pickup_available: boolean;
  delivery_radius_km: string;
  delivery_fee: string;
  min_order_value: string;
  avg_prep_minutes: string;
  platform_commission_percent: string;
  upi_id: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
}

const EMPTY: FormState = {
  name: "", business_name: "", owner_name: "", address: "", city: "",
  postal_code: "", phone: "", email: "", whatsapp: "", emergency_phone: "",
  latitude: "", longitude: "", gst_number: "", drug_license_number: "",
  is_24x7: false, opens_at: "09:00", closes_at: "22:00",
  delivers: true, express_delivery: false, pickup_available: false,
  delivery_radius_km: "8", delivery_fee: "0", min_order_value: "0",
  avg_prep_minutes: "15", platform_commission_percent: "0",
  upi_id: "", bank_account_name: "", bank_account_number: "", bank_ifsc: "",
};

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary";
const labelClass =
  "text-label-sm font-semibold uppercase tracking-wider text-muted-foreground";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/**
 * Onboard a partner pharmacy.
 *
 * The record is created in `pending` with no partner status — this form
 * captures the application; the verification workflow on the detail screen is
 * what makes a pharmacy dispensable.
 */
export default function AdminPharmacyForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createPharmacy = useCreatePharmacy();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const coordsValid =
    form.latitude !== "" &&
    form.longitude !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  const canSubmit = form.name.trim().length > 0 && coordsValid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const created = await createPharmacy.mutateAsync({
        name: form.name.trim(),
        business_name: form.business_name.trim() || null,
        owner_name: form.owner_name.trim() || null,
        address: form.address.trim(),
        city: form.city.trim() || null,
        postal_code: form.postal_code.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        emergency_phone: form.emergency_phone.trim() || null,
        latitude,
        longitude,
        gst_number: form.gst_number.trim() || null,
        drug_license_number: form.drug_license_number.trim() || null,
        is_24x7: form.is_24x7,
        opens_at: form.is_24x7 ? null : form.opens_at,
        closes_at: form.is_24x7 ? null : form.closes_at,
        delivers: form.delivers,
        express_delivery: form.express_delivery,
        pickup_available: form.pickup_available,
        delivery_radius_km: Number(form.delivery_radius_km) || 8,
        delivery_fee: Number(form.delivery_fee) || 0,
        min_order_value: Number(form.min_order_value) || 0,
        avg_prep_minutes: Number(form.avg_prep_minutes) || 15,
        platform_commission_percent: Number(form.platform_commission_percent) || 0,
        upi_id: form.upi_id.trim() || null,
        bank_account_name: form.bank_account_name.trim() || null,
        bank_account_number: form.bank_account_number.trim() || null,
        bank_ifsc: form.bank_ifsc.trim() || null,
      } as never);

      toast({
        title: "Pharmacy onboarded",
        description: `${created.name} was created and is awaiting verification.`,
      });
      navigate(`/admin/pharmacies/${created.id}`);
    } catch (submitError) {
      // The server rejects a duplicate GST with a specific message; that is the
      // useful one to show, not a generic failure.
      setError(
        (submitError as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "The pharmacy could not be created.",
      );
    }
  };

  return (
    <AppShell
      portal="admin"
      userName={user?.email || "Administrator"}
      userRole="Admin Portal"
      searchPlaceholder="Search pharmacies..."
    >
      <PageHeader
        title="Add Pharmacy"
        subtitle="Onboard a partner. It stays hidden from patients until verified."
        breadcrumbs={[{ label: "Admin" }, { label: "Pharmacies" }, { label: "Add" }]}
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin/pharmacies")}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Business identity">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Pharmacy name *">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </Field>
            <Field label="Registered business name">
              <input
                className={inputClass}
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
              />
            </Field>
            <Field label="Owner name">
              <input
                className={inputClass}
                value={form.owner_name}
                onChange={(e) => set("owner_name", e.target.value)}
              />
            </Field>
            <Field label="GST number">
              <input
                className={inputClass}
                value={form.gst_number}
                onChange={(e) => set("gst_number", e.target.value)}
              />
            </Field>
            <Field label="Drug licence number">
              <input
                className={inputClass}
                value={form.drug_license_number}
                onChange={(e) => set("drug_license_number", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Contact & location">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone">
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="WhatsApp">
              <input
                className={inputClass}
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </Field>
            <Field label="Emergency number">
              <input
                className={inputClass}
                value={form.emergency_phone}
                onChange={(e) => set("emergency_phone", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
            <Field label="Postal code">
              <input
                className={inputClass}
                value={form.postal_code}
                onChange={(e) => set("postal_code", e.target.value)}
              />
            </Field>
            <Field label="Latitude *">
              <input
                className={inputClass}
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                placeholder="28.6315"
                required
              />
            </Field>
            <Field label="Longitude *">
              <input
                className={inputClass}
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                placeholder="77.2167"
                required
              />
            </Field>
          </div>
          {!coordsValid && (form.latitude || form.longitude) && (
            <p className="mt-3 text-body-sm text-warning">
              Coordinates must be valid — latitude −90 to 90, longitude −180 to 180.
              Patient search ranks by distance from these.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Delivery configuration">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Delivery radius (km)">
              <input
                type="number"
                className={inputClass}
                value={form.delivery_radius_km}
                onChange={(e) => set("delivery_radius_km", e.target.value)}
              />
            </Field>
            <Field label="Delivery fee">
              <input
                type="number"
                className={inputClass}
                value={form.delivery_fee}
                onChange={(e) => set("delivery_fee", e.target.value)}
              />
            </Field>
            <Field label="Minimum order value">
              <input
                type="number"
                className={inputClass}
                value={form.min_order_value}
                onChange={(e) => set("min_order_value", e.target.value)}
              />
            </Field>
            <Field label="Average prep (min)">
              <input
                type="number"
                className={inputClass}
                value={form.avg_prep_minutes}
                onChange={(e) => set("avg_prep_minutes", e.target.value)}
              />
            </Field>
            <Field label="Platform commission (%)">
              <input
                type="number"
                className={inputClass}
                value={form.platform_commission_percent}
                onChange={(e) => set("platform_commission_percent", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-5">
            {(
              [
                ["is_24x7", "Open 24×7"],
                ["delivers", "Home delivery"],
                ["express_delivery", "Express delivery"],
                ["pickup_available", "Pickup available"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-body-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          {!form.is_24x7 && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Opens at">
                <input
                  type="time"
                  className={inputClass}
                  value={form.opens_at}
                  onChange={(e) => set("opens_at", e.target.value)}
                />
              </Field>
              <Field label="Closes at">
                <input
                  type="time"
                  className={inputClass}
                  value={form.closes_at}
                  onChange={(e) => set("closes_at", e.target.value)}
                />
              </Field>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Settlement">
          <p className="mb-4 text-body-sm text-muted-foreground">
            Stored for payouts and auditable, but never returned by the API — these
            fields are write-only and will not be shown back on the detail screen.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="UPI ID">
              <input
                className={inputClass}
                value={form.upi_id}
                onChange={(e) => set("upi_id", e.target.value)}
              />
            </Field>
            <Field label="Account holder">
              <input
                className={inputClass}
                value={form.bank_account_name}
                onChange={(e) => set("bank_account_name", e.target.value)}
              />
            </Field>
            <Field label="Account number">
              <input
                className={inputClass}
                value={form.bank_account_number}
                onChange={(e) => set("bank_account_number", e.target.value)}
              />
            </Field>
            <Field label="IFSC">
              <input
                className={inputClass}
                value={form.bank_ifsc}
                onChange={(e) => set("bank_ifsc", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>

        {error && (
          <p className="rounded-xl bg-error-soft p-4 text-body-sm text-error-edge">{error}</p>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/pharmacies")}
            className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || createPharmacy.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {createPharmacy.isPending ? "Creating…" : "Create pharmacy"}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
