import { describe, expect, it } from "vitest";
import {
  NOT_RECORDED,
  toClinicalCaseData,
  toDoctorCards,
  toPreviewUrgency,
} from "@/lib/intake-mapping";
import type {
  IntakeMedicalCase,
  SpecialistRecommendation,
} from "@/lib/intake-service";
import type { BookableDoctorResponse } from "@/types/api";

/**
 * These guard the one property that matters in this mapping: a field the
 * platform has no value for must render as absent, never as a plausible
 * figure. The intake page previously showed three hardcoded specialists with
 * invented fees, review counts and a "99% success rate", and the components
 * behind it filled missing props with "12,500+" patients and "98%".
 */

const CASE: IntakeMedicalCase = {
  chief_complaint: "Throbbing one-sided headache",
  symptoms: ["throbbing headache", "nausea", "light sensitivity"],
  duration: "3 days",
  severity: "moderate",
  onset: "gradual",
  body_sites: ["head"],
  allergies: [],
  current_medications: [],
  medical_history: [],
  aggravating_factors: [],
  relieving_factors: [],
  urgency: "medium",
  red_flags: [],
  differential_considerations: ["Migraine"],
  missing_information: ["Prior episodes"],
  recommended_specialty: "Neurology",
  overall_confidence: { score: 0.82, band: "high" },
  patient_language: "english",
  summary_for_doctor: "Patient reports a 3-day unilateral headache.",
  generated_at: "2026-08-01T10:00:00Z",
};

const REC: SpecialistRecommendation = {
  specialty: "Neurology",
  rationale: "Unilateral throbbing headache with photophobia fits a neurological review.",
  match_score: 92.4,
  doctor_id: "cf6827a7-f691-4df1-8d74-1324eea72a39",
  doctor_name: "Dr. Marcus Vance",
  hospital_name: "St. Jude General Hospital",
  is_available: true,
  avatar_url: null,
};

const PROFILE: BookableDoctorResponse = {
  id: "cf6827a7-f691-4df1-8d74-1324eea72a39",
  name: "Dr. Marcus Vance",
  specialty: "Neurology",
  hospital_name: "St. Jude General Hospital",
  consultation_fee: 150,
  rating: 4.6,
  years_of_experience: 12,
  availability: "available",
  avatar_url: null,
} as BookableDoctorResponse;

describe("toPreviewUrgency", () => {
  it("renames only the top band", () => {
    expect(toPreviewUrgency("low")).toBe("low");
    expect(toPreviewUrgency("medium")).toBe("medium");
    expect(toPreviewUrgency("high")).toBe("high");
    expect(toPreviewUrgency("critical")).toBe("emergency");
  });
});

describe("toClinicalCaseData", () => {
  it("carries the agent's own findings through unchanged", () => {
    const out = toClinicalCaseData(CASE);
    expect(out.chiefComplaint).toBe("Throbbing one-sided headache");
    expect(out.symptoms).toEqual(["throbbing headache", "nausea", "light sensitivity"]);
    expect(out.suggestedDepartment).toBe("Neurology");
    expect(out.duration).toBe("3 days");
    expect(out.missingInformation).toEqual(["Prior episodes"]);
    expect(out.doctorSummary).toBe("Patient reports a 3-day unilateral headache.");
  });

  it("expresses the 0-1 confidence as a percentage", () => {
    expect(toClinicalCaseData(CASE).confidence).toBe(82);
  });

  it("marks empty fields as not recorded rather than guessing", () => {
    const out = toClinicalCaseData({ ...CASE, duration: "", severity: "" });
    expect(out.duration).toBe(NOT_RECORDED);
    expect(out.severity).toBe(NOT_RECORDED);
  });
});

describe("toDoctorCards", () => {
  it("joins the agent's ranking to the directory profile", () => {
    const [card] = toDoctorCards([REC], [PROFILE]);
    expect(card.id).toBe(REC.doctor_id);
    expect(card.name).toBe("Dr. Marcus Vance");
    expect(card.specialization).toBe("Neurology");
    expect(card.hospital).toBe("St. Jude General Hospital");
    expect(card.consultationFee).toBe("$150");
    expect(card.rating).toBe(4.6);
    expect(card.experience).toBe("12 Years Experience");
    expect(card.matchScore).toBe(92);
    expect(card.aiExplanation).toBe(REC.rationale);
  });

  it("never invents trust metrics for a real clinician", () => {
    const [card] = toDoctorCards([REC], [PROFILE]);
    expect(card.patientsTreated).toBeUndefined();
    expect(card.successRate).toBeUndefined();
    expect(card.avgConsultationTime).toBeUndefined();
    expect(card.reviewCount).toBe(0);
    expect(card.reviewSnippet).toBeUndefined();
    expect(card.languages).toEqual([]);
    expect(card.distance).toBe(NOT_RECORDED);
  });

  it("still works when the directory lookup is unavailable", () => {
    const [card] = toDoctorCards([REC], []);
    expect(card.name).toBe("Dr. Marcus Vance");
    expect(card.consultationFee).toBe(NOT_RECORDED);
    expect(card.experience).toBe(NOT_RECORDED);
    expect(card.rating).toBe(0);
  });

  it("drops recommendations that cannot be routed to", () => {
    const orphan = { ...REC, doctor_id: null };
    expect(toDoctorCards([orphan], [PROFILE])).toHaveLength(0);
  });

  it("reflects availability rather than asserting it", () => {
    const [busy] = toDoctorCards([{ ...REC, is_available: false }], [PROFILE]);
    expect(busy.isOnline).toBe(false);
    expect(busy.todayAvailable).toBe(false);
    expect(busy.nextSlot).toBe("Not accepting cases");
  });

  it("omits a fee the directory does not hold", () => {
    const [card] = toDoctorCards([REC], [{ ...PROFILE, consultation_fee: 0 }]);
    expect(card.consultationFee).toBe(NOT_RECORDED);
  });

  it("preserves the agent's ranking order", () => {
    const second: SpecialistRecommendation = {
      ...REC,
      doctor_id: "1b7df04f-90d5-4f06-be57-6f7ba33dd9d3",
      doctor_name: "Dr. Sarah Jenkins",
      match_score: 71,
    };
    const cards = toDoctorCards([REC, second], [PROFILE]);
    expect(cards.map((c) => c.name)).toEqual(["Dr. Marcus Vance", "Dr. Sarah Jenkins"]);
  });
});
