import { describe, expect, it } from "vitest";
import {
  EMPTY_EMERGENCY_FORM,
  cleanPhone,
  cleanPincode,
  cleanText,
  validateEmergencyForm,
  type EmergencyFormValues,
} from "@/components/patient/emergency/emergencyProfileValidation";

/**
 * These mirror `app/schemas/emergency_profile.py`. The server is the authority
 * — nothing here is a security control — but the two must agree, or a patient
 * is told their input is fine and then rejected on submit (or the reverse,
 * which is worse: a form that blocks input the API would have accepted).
 */

const VALID: EmergencyFormValues = {
  contact_name: "Ravi Kumar",
  contact_phone: "+919876543210",
  contact_relationship: "Brother",
  alternate_phone: "",
  house_number: "12/A",
  street: "Gandhi Road",
  landmark: "Near City Hospital",
  locality: "Rajendra Nagar",
  city: "Patna",
  district: "Patna",
  state: "Bihar",
  country: "India",
  pincode: "800001",
};

const valid = (overrides: Partial<EmergencyFormValues> = {}) => ({
  ...VALID,
  ...overrides,
});

describe("normalisation", () => {
  it("trims and collapses internal whitespace", () => {
    expect(cleanText("  Ravi   Kumar  ")).toBe("Ravi Kumar");
  });

  it("collapses newlines and tabs to a space rather than deleting them", () => {
    // Deleting them would fuse the words: a pasted two-line address would
    // become "PatnaBihar", which is nowhere.
    expect(cleanText("Patna\nBihar")).toBe("Patna Bihar");
    expect(cleanText("Patna\tBihar")).toBe("Patna Bihar");
  });

  it("removes non-whitespace control characters", () => {
    expect(cleanText("Patna\x00")).toBe("Patna");
    expect(cleanText("Pat\x07na")).toBe("Patna");
  });

  it("reduces a phone number to + and digits", () => {
    expect(cleanPhone("+91 98765-43210")).toBe("+919876543210");
    expect(cleanPhone("(0)98765.43210")).toBe("09876543210");
  });

  it("strips spacing and hyphens from a pincode", () => {
    expect(cleanPincode("800 001")).toBe("800001");
    expect(cleanPincode("sw1a-1aa")).toBe("SW1A1AA");
  });
});

describe("valid input", () => {
  it("accepts a complete, ordinary profile", () => {
    expect(validateEmergencyForm(VALID)).toEqual({});
  });

  it("accepts real Indian address punctuation", () => {
    const errors = validateEmergencyForm(
      valid({
        house_number: "#12/A-3",
        street: "M.G. Road (East)",
        locality: "D'Souza Colony & Annexe",
      })
    );
    expect(errors).toEqual({});
  });

  it("treats landmark and alternative number as optional", () => {
    expect(
      validateEmergencyForm(valid({ landmark: "", alternate_phone: "" }))
    ).toEqual({});
  });
});

describe("required fields", () => {
  it.each([
    "contact_name",
    "contact_phone",
    "contact_relationship",
    "house_number",
    "street",
    "locality",
    "city",
    "district",
    "state",
    "country",
    "pincode",
  ] as (keyof EmergencyFormValues)[])("flags a blank %s", (field) => {
    const errors = validateEmergencyForm(valid({ [field]: "   " }));
    expect(errors[field]).toBeTruthy();
  });

  it("reports every missing field at once on an empty form", () => {
    const errors = validateEmergencyForm(EMPTY_EMERGENCY_FORM);
    // Country is pre-filled with India, so it is not among the failures.
    expect(Object.keys(errors).filter((k) => errors[k as never])).toHaveLength(10);
  });
});

describe("phone rules", () => {
  it.each([
    "12345",
    "1234567890123456",
    "not-a-number",
    "+91abcdefghij",
    "<script>alert(1)</script>",
  ])("rejects %s", (phone) => {
    expect(validateEmergencyForm(valid({ contact_phone: phone })).contact_phone)
      .toBeTruthy();
  });

  it("rejects an alternative number equal to the primary, however typed", () => {
    const errors = validateEmergencyForm(
      valid({ contact_phone: "+919876543210", alternate_phone: "+91 98765 43210" })
    );
    expect(errors.alternate_phone).toBeTruthy();
  });

  it("accepts a genuinely different alternative number", () => {
    expect(
      validateEmergencyForm(
        valid({ contact_phone: "+919876543210", alternate_phone: "+919876543211" })
      )
    ).toEqual({});
  });
});

describe("pincode rules", () => {
  it.each(["12345", "1234567", "012345", "abcdef"])(
    "rejects %s for India",
    (pincode) => {
      expect(validateEmergencyForm(valid({ pincode })).pincode).toBeTruthy();
    }
  );

  it("accepts a spaced Indian pincode", () => {
    expect(validateEmergencyForm(valid({ pincode: "800 001" })).pincode)
      .toBeUndefined();
  });

  it("applies the general rule outside India", () => {
    const errors = validateEmergencyForm(
      valid({ country: "United Kingdom", pincode: "SW1A1AA" })
    );
    expect(errors.pincode).toBeUndefined();
  });
});

describe("character rules", () => {
  it.each(["<script>alert(1)</script>", "Rd | rm -rf", "{{constructor}}"])(
    "rejects %s in an address field",
    (value) => {
      expect(validateEmergencyForm(valid({ city: value })).city).toBeTruthy();
    }
  );

  it("rejects digits in a person's name", () => {
    expect(validateEmergencyForm(valid({ contact_name: "Ravi 123" })).contact_name)
      .toBeTruthy();
  });

  it("enforces maximum lengths", () => {
    expect(validateEmergencyForm(valid({ contact_name: "A".repeat(200) })).contact_name)
      .toBeTruthy();
    expect(validateEmergencyForm(valid({ city: "A".repeat(200) })).city).toBeTruthy();
  });

  it("requires a name of at least two characters", () => {
    expect(validateEmergencyForm(valid({ contact_name: "R" })).contact_name)
      .toBeTruthy();
  });
});
