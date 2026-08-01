// ============================================
// AI Medical Case Intake Service — MedBridge Platform
// Wraps all /api/v1/ai/intake/* API calls
// ============================================
//
// This is the client for the production intake agent (`Backend/app/intake`):
// a stateful, multi-turn LangGraph workflow with evidence-grounded extraction,
// deterministic multilingual red-flag escalation and a closed specialty
// vocabulary.
//
// It replaces the single-shot `/ai/symptom-intake` call the intake page used
// to make. That endpoint still exists and is unchanged — other consumers and
// its test suite depend on it — but no frontend code calls it any more.
//
// The important difference for callers: this is a *conversation*. A session
// does not necessarily produce a case on the first request. It reports one of
// three states, and the caller has to honour all three:
//
//   collecting                → `pending_question` must be put to the patient
//   awaiting_doctor_selection → `medical_case` + `recommendations` are ready
//   emergency_escalated       → stop; the patient needs care now, not a queue
//
import api from "./api";

export type IntakeStatus =
  | "collecting"
  | "awaiting_doctor_selection"
  | "routed"
  | "emergency_escalated"
  | "abandoned";

export interface IntakeConfidence {
  score: number; // 0.0 – 1.0
  band: "high" | "medium" | "low" | "unknown";
}

export interface SpecialistRecommendation {
  specialty: string;
  rationale: string;
  match_score: number;
  doctor_id: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
  is_available: boolean;
  avatar_url: string | null;
}

export interface IntakeMedicalCase {
  chief_complaint: string;
  symptoms: string[];
  duration: string;
  severity: string;
  onset: string;
  body_sites: string[];
  allergies: string[];
  current_medications: string[];
  medical_history: string[];
  aggravating_factors: string[];
  relieving_factors: string[];
  urgency: "low" | "medium" | "high" | "critical";
  red_flags: string[];
  differential_considerations: string[];
  missing_information: string[];
  recommended_specialty: string;
  overall_confidence: IntakeConfidence;
  patient_language: string;
  summary_for_doctor: string;
  generated_at: string;
}

export interface IntakeTurn {
  role: "patient" | "agent";
  text: string;
  timestamp: string;
}

export interface IntakeSession {
  session_id: string;
  status: IntakeStatus;
  language: string;
  intent: string;
  followup_rounds: number;
  pending_question: string | null;
  red_flags: string[];
  turns: IntakeTurn[];
  entities: unknown[];
  medical_case: IntakeMedicalCase | null;
  recommendations: SpecialistRecommendation[];
  routed_case_id: string | null;
  routed_doctor_id: string | null;
  created_at: string;
  updated_at: string;
  is_emergency: boolean;
  awaiting_input: boolean;
  /**
   * Extractions the agent discarded this turn for citing text the patient
   * never said. Non-zero means the model attempted to fabricate clinical data.
   */
  rejected_extraction_count: number;
  degraded: boolean;
  notices: string[];
}

export interface IntakeRoutingResult {
  session_id: string;
  case_id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  urgency: string;
  message: string;
}

const intakeService = {
  /** Open a session from the patient's own description, in any language. */
  async startSession(payload: {
    symptoms: string;
    age?: string;
    gender?: string;
  }): Promise<IntakeSession> {
    const { data } = await api.post<IntakeSession>("/ai/intake/sessions", payload);
    return data;
  },

  /** Answer the agent's outstanding follow-up question. */
  async submitAnswer(sessionId: string, answer: string): Promise<IntakeSession> {
    const { data } = await api.post<IntakeSession>(
      `/ai/intake/sessions/${sessionId}/turns`,
      { answer }
    );
    return data;
  },

  /** Re-read a session the caller owns. */
  async getSession(sessionId: string): Promise<IntakeSession> {
    const { data } = await api.get<IntakeSession>(`/ai/intake/sessions/${sessionId}`);
    return data;
  },

  /**
   * Finalise the intake against a chosen clinician.
   *
   * This is the call that actually creates the row in `cases` and puts it in
   * that doctor's queue. Selecting a doctor in the UI without calling this
   * changes nothing server-side.
   */
  async selectDoctor(sessionId: string, doctorId: string): Promise<IntakeRoutingResult> {
    const { data } = await api.post<IntakeRoutingResult>(
      `/ai/intake/sessions/${sessionId}/select-doctor`,
      { doctor_id: doctorId }
    );
    return data;
  },
};

export default intakeService;
