// ============================================
// Prescription & AI Safety Review — MedBridge Platform
// Mirrors Backend/app/schemas/rx_safety_api.py
// ============================================

/**
 * `unknown` is a first-class verdict, not a loading state.
 *
 * It means the check ran but could not reach a conclusion — typically because
 * a drug could not be identified or a label source was unreachable. The UI must
 * render it distinctly from `safe`; collapsing the two would tell a patient a
 * prescription was cleared when nothing was actually checked.
 */
export type RxVerdict = "safe" | "warning" | "critical" | "unknown";

/**
 * `degraded` means findings were produced but coverage was incomplete.
 * `failed` means nothing usable was produced at all.
 */
export type RxVerificationStatus = "pending" | "completed" | "failed" | "degraded";

export type RxFindingCategory =
  | "drug_interaction"
  | "duplicate_therapy"
  | "contraindication"
  | "max_dosage"
  | "allergy"
  | "renal"
  | "hepatic"
  | "pregnancy"
  | "elderly"
  | "food_interaction";

export type FoodInstruction =
  | "before_food"
  | "after_food"
  | "with_food"
  | "empty_stomach"
  | "anytime";

/** A citable excerpt from a source document backing a finding. */
export interface RxEvidence {
  source: string;
  section: string;
  excerpt: string;
  reference: string;
}

export interface RxFinding {
  id: string;
  category: RxFindingCategory;
  severity: RxVerdict;
  confidence: number;
  title: string;
  detail: string;
  /** Advisory only. Never applied automatically to the prescription. */
  recommendation: string;
  medications_involved: string[];
  /** `rxnorm` | `openfda` | `groq` | `rules` */
  source: string;
  /** Empty means the finding is model-generated and must be badged as such. */
  evidence: RxEvidence[];
}

export interface RxVerification {
  id: string;
  prescription_id: string;
  status: RxVerificationStatus;
  verdict: RxVerdict;
  /** Confidence in the review's coverage, 0–1. */
  confidence: number;
  summary: string;
  checked_medication_count: number;
  /** Named explicitly so the reader knows what was *not* reviewed. */
  unchecked_medications: string[];
  sources_used: string[];
  engine_version: string;
  model_used: string | null;
  duration_ms: number;
  completed_at: string | null;
  created_at: string;
  findings: RxFinding[];
}

/**
 * The prescriber as recorded on the prescription at signing time.
 *
 * These are snapshot values, not the clinician's current profile — a doctor who
 * later changes hospital does not retroactively alter prescriptions they signed.
 */
export interface PrescriberCard {
  doctor_id: string;
  doctor_name: string;
  specialty: string | null;
  qualification: string | null;
  hospital: string | null;
  registration_number: string | null;
  experience_years: number | null;
  avatar_url: string | null;
  consultation_date: string | null;
  signed_at: string | null;
  signature_url: string | null;
  consultation_completed: boolean;
  prescription_signed: boolean;
}

export interface MedicationLine {
  id: string;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  food_instruction: FoodInstruction | null;
  route: string | null;
  quantity: number | null;
  /** RxNorm concept id; null when the name could not be normalised. */
  rxcui: string | null;
  special_instructions: string;
  scheduled_times: string[];
  start_date: string;
  end_date: string;
}

export interface PrescriptionDocument {
  id: string;
  status: string;
  diagnosis: string;
  notes: string;
  follow_up_date: string | null;
  created_at: string;
  prescriber: PrescriberCard;
  medications: MedicationLine[];
  /** Null when no review has been run, or the feature is switched off. */
  verification: RxVerification | null;
  pdf_url: string | null;
  prescription_image_url: string | null;
}

/** Display labels for food timing. Keep in step with the backend enum. */
export const FOOD_INSTRUCTION_LABELS: Record<FoodInstruction, string> = {
  before_food: "Before food",
  after_food: "After food",
  with_food: "With food",
  empty_stomach: "Empty stomach",
  anytime: "Any time",
};

export const VERDICT_LABELS: Record<RxVerdict, string> = {
  safe: "Safe",
  warning: "Warning",
  critical: "Critical",
  unknown: "Not checked",
};
