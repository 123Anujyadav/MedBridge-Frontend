// ============================================
// Intake agent → intake UI mapping
// ============================================
//
// Pure translation between the intake agent's API shapes and the view models
// the intake components already take. Kept out of the page so it can be tested
// without rendering anything.
//
// One rule governs this file: **nothing is invented.** Every value either comes
// from the agent, from the doctor directory, or is rendered as
// `NOT_RECORDED`. The intake page previously displayed three hardcoded
// specialists — names, hospitals, fees, review counts, "98% success rate" and a
// per-doctor "why this doctor" paragraph — none of which corresponded to any
// row in the database. A patient choosing care must not be shown invented
// credentials, so a field with no source is shown as absent rather than filled
// in plausibly.

import type { Doctor } from "@/components/intake/DoctorCard";
import type { ClinicalCaseData } from "@/components/intake/AICasePreview";
import type {
  IntakeMedicalCase,
  SpecialistRecommendation,
} from "./intake-service";
import type { BookableDoctorResponse } from "@/types/api";

/** Shown wherever the platform holds no value for a field. */
export const NOT_RECORDED = "Not recorded";

/**
 * The agent grades urgency `low | medium | high | critical`; the preview card's
 * union calls the top band `emergency`. Everything else is identical.
 */
export function toPreviewUrgency(
  urgency: IntakeMedicalCase["urgency"]
): ClinicalCaseData["urgency"] {
  return urgency === "critical" ? "emergency" : urgency;
}

/** The agent's structured case, in the shape the preview panel renders. */
export function toClinicalCaseData(mc: IntakeMedicalCase): ClinicalCaseData {
  return {
    chiefComplaint: mc.chief_complaint,
    symptoms: mc.symptoms ?? [],
    duration: mc.duration || NOT_RECORDED,
    severity: mc.severity || NOT_RECORDED,
    urgency: toPreviewUrgency(mc.urgency),
    suggestedDepartment: mc.recommended_specialty,
    possibleRedFlags: mc.red_flags ?? [],
    missingInformation: mc.missing_information ?? [],
    doctorSummary: mc.summary_for_doctor || "",
    // The agent scores 0.0–1.0; the field is carried as a percentage.
    confidence: Math.round((mc.overall_confidence?.score ?? 0) * 100),
  };
}

/**
 * Fee text, following the convention the booking screen already uses:
 * a dollar amount when there is one, and nothing claimed when there is not.
 */
function formatFee(fee?: number): string {
  return typeof fee === "number" && fee > 0 ? `$${fee}` : NOT_RECORDED;
}

/**
 * Merge the agent's ranked recommendations with the doctor directory.
 *
 * The agent supplies the ranking, the match score and the clinical rationale;
 * the directory supplies fee, rating and years of experience. Joined on the
 * doctor id, so both halves describe the same real clinician.
 *
 * Recommendations without a `doctor_id` are dropped: they cannot be selected,
 * because routing a case requires a real doctor to route it to.
 */
export function toDoctorCards(
  recommendations: SpecialistRecommendation[],
  directory: BookableDoctorResponse[] = []
): Doctor[] {
  const byId = new Map(directory.map((d) => [String(d.id), d]));

  return (recommendations || [])
    .filter((rec) => Boolean(rec.doctor_id))
    .map((rec) => {
      const id = String(rec.doctor_id);
      const profile = byId.get(id);
      const name = rec.doctor_name || profile?.name || "Doctor";

      return {
        id,
        name,
        photoUrl: rec.avatar_url || profile?.avatar_url || "",
        // No source: the directory stores no qualification, languages,
        // patient volume, success rate, consultation duration, review count
        // or distance. Left empty so the card omits them.
        qualification: NOT_RECORDED,
        experience:
          profile && profile.years_of_experience > 0
            ? `${profile.years_of_experience} Years Experience`
            : NOT_RECORDED,
        hospital: rec.hospital_name || profile?.hospital_name || NOT_RECORDED,
        specialization: rec.specialty,
        department: rec.specialty,
        languages: [],
        consultationFee: formatFee(profile?.consultation_fee),
        rating: profile?.rating ?? 0,
        reviewCount: 0,
        reviewSnippet: undefined,
        isOnline: rec.is_available,
        todayAvailable: rec.is_available,
        nextSlot: rec.is_available ? "Accepting cases" : "Not accepting cases",
        distance: NOT_RECORDED,
        // A platform capability, not a claim about this clinician: the
        // appointment type enum is in_person | video | phone | ai_triage.
        consultationTypes: ["video", "in-person"],
        matchScore: Math.round(rec.match_score ?? 0),
        // The agent's own explanation of why this specialty fits the case.
        recommendationReasons: rec.rationale ? [rec.rationale] : [],
        patientsTreated: undefined,
        successRate: undefined,
        avgConsultationTime: undefined,
        aiExplanation: rec.rationale || undefined,
      } satisfies Doctor;
    });
}
