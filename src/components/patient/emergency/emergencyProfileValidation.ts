// ============================================
// Emergency Profile — client-side form validation
// ============================================
//
// Deliberately mirrors `app/schemas/emergency_profile.py`. The server remains
// the authority: nothing here is a security control, and every rule below is
// enforced again on the way in. What this buys is a patient being told which
// box is wrong, next to that box, without a round trip — the API answers a bad
// payload with one flat "Request validation failed", which is no help to
// someone filling in a form.
//
// Keep the two in step. If a rule changes on the server, change it here too.

export interface EmergencyFormValues {
  contact_name: string;
  contact_phone: string;
  contact_relationship: string;
  alternate_phone: string;
  house_number: string;
  street: string;
  landmark: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
}

export type EmergencyFormErrors = Partial<
  Record<keyof EmergencyFormValues, string>
>;

const NAME_ALLOWED = /^[A-Za-z .\-']+$/;
const TEXT_ALLOWED = /^[A-Za-z0-9 .,\-'/&()#]+$/;
const PHONE_ALLOWED = /^\+?[0-9]{7,15}$/;
const INDIA_PIN = /^[1-9][0-9]{5}$/;
const GENERIC_POSTCODE = /^[A-Za-z0-9]{3,10}$/;

/**
 * Trim, collapse internal runs of whitespace, drop control characters.
 *
 * The deletion range excludes \x09–\x0d (tab, newline, vertical tab, form feed,
 * carriage return): those are whitespace and are collapsed to a single space
 * instead. Deleting them would fuse the words either side, turning a pasted
 * two-line address into `PatnaBihar`.
 */
export function cleanText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0e-\x1f\x7f]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Reduce a typed number to `+` and digits.
 *
 * People paste numbers with spaces, brackets and hyphens. None of that changes
 * which telephone rings, so it is removed before validating or comparing —
 * otherwise `+91 98765 43210` and `+919876543210` would look like two different
 * numbers and the duplicate check would miss.
 */
export function cleanPhone(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x1f\x7f]/g, "").replace(/[\s\-().]/g, "").trim();
}

export function cleanPincode(value: string): string {
  return cleanText(value).replace(/[\s-]/g, "").toUpperCase();
}

const MAX: Partial<Record<keyof EmergencyFormValues, number>> = {
  contact_name: 120,
  contact_phone: 20,
  contact_relationship: 60,
  alternate_phone: 20,
  house_number: 60,
  street: 150,
  landmark: 150,
  locality: 120,
  city: 100,
  district: 100,
  state: 100,
  country: 100,
  pincode: 12,
};

const LABELS: Record<keyof EmergencyFormValues, string> = {
  contact_name: "Emergency contact name",
  contact_phone: "Emergency contact number",
  contact_relationship: "Relationship",
  alternate_phone: "Alternative contact number",
  house_number: "House number",
  street: "Street",
  landmark: "Landmark",
  locality: "Village / Locality",
  city: "City",
  district: "District",
  state: "State",
  country: "Country",
  pincode: "Pincode",
};

const REQUIRED_ADDRESS: (keyof EmergencyFormValues)[] = [
  "house_number",
  "street",
  "locality",
  "city",
  "district",
  "state",
  "country",
];

export function validateEmergencyForm(
  values: EmergencyFormValues
): EmergencyFormErrors {
  const errors: EmergencyFormErrors = {};

  // ── contact ────────────────────────────────────────────────────────────
  const name = cleanText(values.contact_name);
  if (!name) errors.contact_name = `${LABELS.contact_name} is required.`;
  else if (name.length < 2)
    errors.contact_name = `${LABELS.contact_name} must be at least 2 characters.`;
  else if (name.length > MAX.contact_name!)
    errors.contact_name = `${LABELS.contact_name} must be at most ${MAX.contact_name} characters.`;
  else if (!NAME_ALLOWED.test(name))
    errors.contact_name =
      "Use letters, spaces, apostrophes, hyphens and full stops only.";

  const relationship = cleanText(values.contact_relationship);
  if (!relationship)
    errors.contact_relationship = `${LABELS.contact_relationship} is required.`;
  else if (relationship.length > MAX.contact_relationship!)
    errors.contact_relationship = `${LABELS.contact_relationship} must be at most ${MAX.contact_relationship} characters.`;
  else if (!NAME_ALLOWED.test(relationship))
    errors.contact_relationship =
      "Use letters, spaces, apostrophes, hyphens and full stops only.";

  const phone = cleanPhone(values.contact_phone);
  if (!phone) errors.contact_phone = `${LABELS.contact_phone} is required.`;
  else if (!PHONE_ALLOWED.test(phone))
    errors.contact_phone =
      "Enter 7 to 15 digits, optionally with a country code such as +91.";

  const alternate = cleanPhone(values.alternate_phone);
  if (alternate) {
    if (!PHONE_ALLOWED.test(alternate))
      errors.alternate_phone =
        "Enter 7 to 15 digits, optionally with a country code such as +91.";
    else if (alternate === phone)
      errors.alternate_phone =
        "This must be different from the primary emergency number.";
  }

  // ── address ────────────────────────────────────────────────────────────
  for (const field of REQUIRED_ADDRESS) {
    const value = cleanText(values[field]);
    if (!value) {
      errors[field] = `${LABELS[field]} is required.`;
    } else if (value.length > MAX[field]!) {
      errors[field] = `${LABELS[field]} must be at most ${MAX[field]} characters.`;
    } else if (!TEXT_ALLOWED.test(value)) {
      errors[field] =
        "Use letters, digits, spaces and . , - ' / & ( ) # only.";
    }
  }

  const landmark = cleanText(values.landmark);
  if (landmark) {
    if (landmark.length > MAX.landmark!)
      errors.landmark = `${LABELS.landmark} must be at most ${MAX.landmark} characters.`;
    else if (!TEXT_ALLOWED.test(landmark))
      errors.landmark =
        "Use letters, digits, spaces and . , - ' / & ( ) # only.";
  }

  const pincode = cleanPincode(values.pincode);
  const country = cleanText(values.country).toLowerCase();
  if (!pincode) {
    errors.pincode = `${LABELS.pincode} is required.`;
  } else if (["india", "in", "bharat"].includes(country)) {
    // The home country's rule is unambiguous, so it is checked precisely
    // rather than left to the generic form.
    if (!INDIA_PIN.test(pincode))
      errors.pincode = "An Indian pincode is exactly 6 digits and cannot start with 0.";
  } else if (!GENERIC_POSTCODE.test(pincode)) {
    errors.pincode = "Pincode must be 3 to 10 letters or digits.";
  }

  return errors;
}

export const EMPTY_EMERGENCY_FORM: EmergencyFormValues = {
  contact_name: "",
  contact_phone: "",
  contact_relationship: "",
  alternate_phone: "",
  house_number: "",
  street: "",
  landmark: "",
  locality: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  pincode: "",
};
