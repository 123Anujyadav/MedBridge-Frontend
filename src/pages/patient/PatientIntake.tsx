import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, PhoneCall } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import patientService from "@/lib/patient-service";
import intakeService, { type IntakeSession } from "@/lib/intake-service";
import { toClinicalCaseData, toDoctorCards } from "@/lib/intake-mapping";
import { useToast } from "@/hooks/use-toast";

// Intake Components
import {
  MedicalCaseHeader,
  CaseProgress,
  SymptomInputCard,
  RecommendedDoctors,
  AICasePreview,
  ClinicalCaseData,
  ProcessingOverlay,
  SuccessScreen,
  Doctor,
} from "@/components/intake";

/**
 * Patient symptom intake.
 *
 * Runs on the production intake agent (`POST /ai/intake/*`): a stateful
 * multi-turn workflow with evidence-grounded extraction, a closed specialty
 * vocabulary and deterministic red-flag escalation that fires before any model
 * call. This page previously called the single-shot `/ai/symptom-intake`
 * endpoint, which returned a constant "General Medicine" / "high" for every
 * complaint, and then displayed three hardcoded specialists who existed in no
 * database — selecting one routed nothing anywhere.
 *
 * Three agent states have to be honoured here, and all three are:
 *
 *   collecting                the agent needs an answer before it will produce
 *                             a case, and will not guess one
 *   awaiting_doctor_selection the case and its ranked clinicians are ready
 *   emergency_escalated       stop. The patient needs care now; routing them
 *                             into a consultation queue would be the wrong
 *                             thing to do with the finding
 */
export default function PatientIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Page States
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Describe, 2: AI Analysis, 3: Case Review, 4: Sent
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice"); // Voice first default!
  const [symptomText, setSymptomText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showProcessingOverlay, setShowProcessingOverlay] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasGeneratedCase, setHasGeneratedCase] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<ClinicalCaseData | null>(null);

  // Agent session state
  const [session, setSession] = useState<IntakeSession | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [emergency, setEmergency] = useState<{ guidance: string; redFlags: string[] } | null>(null);

  // Selected Doctor routing state
  const [routedDoctor, setRoutedDoctor] = useState<Doctor | null>(null);

  // Case Metadata. `caseId` stays blank until the backend issues a real one —
  // it used to be a random `CAS-2026-4821` generated in the browser, which was
  // shown to the patient as their case reference and matched no record.
  const [caseMetadata, setCaseMetadata] = useState({
    caseId: "",
    createdDate: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    estimatedReviewTime: "Awaiting doctor review",
    assignedDepartment: "",
  });

  const pendingQuestion = session?.awaiting_input ? session.pending_question : null;

  /**
   * Apply one agent response to the page.
   *
   * Every branch here is driven by `status`; nothing is inferred from the
   * presence or absence of fields.
   */
  const applySession = (next: IntakeSession) => {
    setSession(next);

    if (next.status === "emergency_escalated") {
      setEmergency({
        guidance:
          next.notices?.[0] ||
          [...(next.turns || [])].reverse().find((t) => t.role === "agent")?.text ||
          "Your description contains signs that may indicate a medical emergency. Call your local emergency number or go to the nearest emergency department immediately.",
        redFlags: next.red_flags || [],
      });
      setAiResult(next.medical_case ? toClinicalCaseData(next.medical_case) : null);
      setDoctors([]);
      setHasGeneratedCase(false);
      setShowProcessingOverlay(false);
      setCurrentStep(1);
      return;
    }

    setEmergency(null);

    if (next.awaiting_input) {
      // The agent wants a clarification. Clear the box so the patient answers
      // the question rather than editing their original description.
      setSymptomText("");
      setShowProcessingOverlay(false);
      setCurrentStep(1);
      setHasGeneratedCase(false);
      return;
    }

    if (next.medical_case) {
      setAiResult(toClinicalCaseData(next.medical_case));
      setCaseMetadata((prev) => ({
        ...prev,
        assignedDepartment: next.medical_case!.recommended_specialty,
      }));
      setHasGeneratedCase(true);
    }
  };

  /** Load the directory so cards can show real fee, rating and experience. */
  const loadDoctorCards = async (next: IntakeSession) => {
    const recs = next.recommendations || [];
    if (recs.length === 0) {
      setDoctors([]);
      return;
    }
    try {
      const directory = await patientService.listBookableDoctors();
      setDoctors(toDoctorCards(recs, directory));
    } catch {
      // The directory is an enrichment, not a dependency: without it the cards
      // still carry the agent's own name, specialty, hospital and rationale.
      setDoctors(toDoctorCards(recs, []));
    }
  };

  // Main Action: start the session, or answer the agent's outstanding question
  const handleGenerateMedicalCase = async () => {
    if (!symptomText.trim()) {
      toast({
        variant: "destructive",
        title: pendingQuestion ? "Answer Required" : "Symptom Description Required",
        description: pendingQuestion
          ? "Please answer the question above so your case can be completed."
          : "Please speak or type your health concern before generating a case.",
      });
      return;
    }

    setIsProcessing(true);
    const answering = Boolean(pendingQuestion);
    if (!answering) {
      setCurrentStep(2); // Step 2: AI Medical Analysis
      setShowProcessingOverlay(true);
    }

    try {
      const next = answering
        ? await intakeService.submitAnswer(session!.session_id, symptomText)
        : await intakeService.startSession({ symptoms: symptomText });

      applySession(next);

      if (next.status === "emergency_escalated") {
        toast({
          variant: "destructive",
          title: "Seek emergency care now",
          description: "Your description matched emergency warning signs. Do not wait for an online consultation.",
        });
        return;
      }

      if (next.awaiting_input) {
        toast({
          title: "One more question",
          description: "The AI needs a little more detail before it can complete your case.",
        });
        return;
      }

      await loadDoctorCards(next);

      if (answering) {
        // No processing overlay on this path, so advance to review directly.
        setCurrentStep(3);
        toast({
          title: "Medical Case Created",
          description: "Select a specialist below to route your case.",
        });
      }
    } catch (err) {
      // A failed analysis must fail visibly. This branch used to synthesise a
      // complete clinical case — invented symptoms, a severity of
      // "Moderate (6/10)", a Cardiology referral and 90% confidence — and set it
      // as the result. The patient saw a normal-looking case and no error, and
      // nothing was persisted, so it could also be routed to a clinician as if
      // it were real analysis. Reporting the failure is the only safe option.
      console.error("Symptom intake analysis failed:", err);
      setAiResult(null);
      setHasGeneratedCase(false);
      setShowProcessingOverlay(false);
      setCurrentStep(1);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description:
          (err as Error)?.message ||
          "Your case could not be analysed. Please try again. If this is urgent, contact a doctor directly.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Called when processing animation overlay finishes
  const handleProcessingComplete = () => {
    setShowProcessingOverlay(false);
    if (emergency) return; // escalation already took over the page
    if (session?.awaiting_input) return; // a question is outstanding
    if (!hasGeneratedCase) return; // the request failed
    setCurrentStep(3); // Step 3: Case Review
    toast({
      title: "Medical Case Created",
      description: "Select a specialist below to route your case.",
    });
  };

  /**
   * Route the case to the chosen clinician.
   *
   * This is the call that creates the row in `cases` and puts it in that
   * doctor's queue. Until it returns, nothing has been sent anywhere.
   */
  const handleConfirmDoctorRouting = async (
    doctor: Doctor,
    _consultationType: "video" | "in-person"
  ) => {
    if (!session) return;
    setIsRouting(true);
    try {
      const result = await intakeService.selectDoctor(session.session_id, doctor.id);
      setRoutedDoctor(doctor);
      setCaseMetadata((prev) => ({
        ...prev,
        caseId: result.case_id,
        assignedDepartment: `${result.specialty} • ${result.doctor_name}`,
      }));
      setIsSuccess(true);
      setCurrentStep(4); // Step 4: Sent to Doctor
      toast({
        title: "Medical Case Routed",
        description: `Your case has been sent to ${result.doctor_name} (${result.specialty}).`,
      });
    } catch (err) {
      console.error("Case routing failed:", err);
      toast({
        variant: "destructive",
        title: "Routing Failed",
        description:
          (err as Error)?.message ||
          "Your case could not be sent to this doctor. Please try again or choose another specialist.",
      });
    } finally {
      setIsRouting(false);
    }
  };

  // Success Screen CTAs
  const handleSendToDoctor = () => {
    navigate("/patient/appointments");
  };

  const handleEditCase = () => {
    // Start over: the previous session is already routed and cannot be reused.
    setIsSuccess(false);
    setSession(null);
    setAiResult(null);
    setDoctors([]);
    setHasGeneratedCase(false);
    setRoutedDoctor(null);
    setSymptomText("");
    setCaseMetadata((prev) => ({ ...prev, caseId: "", assignedDepartment: "" }));
    setCurrentStep(1); // Return to Step 1: Describe Symptoms
  };

  return (
    <AppShell
      portal="patient"
      userName={user?.email || "Patient"}
      userRole="Patient Portal"
      searchPlaceholder="Search symptoms, records, or cases..."
    >
      <div className="space-y-6 pb-12">
        {/* Medical Case Header */}
        <MedicalCaseHeader />

        {/* Top Progress Indicator */}
        <CaseProgress currentStep={currentStep} />

        {/* Processing Step Overlay Modal */}
        {showProcessingOverlay && (
          <ProcessingOverlay onComplete={handleProcessingComplete} />
        )}

        {/*
          Emergency escalation. Deterministic red-flag screening runs before any
          model call, so this appears even when the LLM is unavailable — which
          is exactly when it matters most. Intake stops here: the patient is not
          offered a consultation queue.
        */}
        {emergency && (
          <div
            role="alert"
            className="rounded-3xl border-2 border-destructive/40 bg-destructive/10 p-6 md:p-8 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="font-headline text-xl md:text-2xl font-bold text-destructive">
                This may be a medical emergency
              </h2>
            </div>

            <p className="text-sm md:text-base leading-relaxed text-foreground">
              {emergency.guidance}
            </p>

            {emergency.redFlags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                  Warning signs matched
                </span>
                <ul className="space-y-1">
                  {emergency.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-destructive shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/patient/emergency")}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-destructive px-8 py-4 font-headline text-base font-bold text-destructive-foreground shadow-lg transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="h-5 w-5" />
              <span>Go to Emergency</span>
            </button>
          </div>
        )}

        {/* Conditional Render: Intake Form vs Success Screen */}
        {isSuccess && aiResult ? (
          <SuccessScreen
            caseId={caseMetadata.caseId}
            createdDate={caseMetadata.createdDate}
            estimatedReviewTime={caseMetadata.estimatedReviewTime}
            assignedDepartment={caseMetadata.assignedDepartment}
            caseSummary={aiResult}
            onEditCase={handleEditCase}
            onSendToDoctor={handleSendToDoctor}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left Main Form Column (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Main Input Card (Voice & Text Input) */}
              <SymptomInputCard
                inputMode={inputMode}
                setInputMode={setInputMode}
                symptomText={symptomText}
                setSymptomText={setSymptomText}
                onGenerateCase={handleGenerateMedicalCase}
                isProcessing={isProcessing}
                pendingQuestion={pendingQuestion}
              />

              {/* AI Recommended Specialists Section */}
              <RecommendedDoctors
                hasGeneratedCase={hasGeneratedCase}
                isLoading={isProcessing && !pendingQuestion}
                doctors={doctors}
                isRouting={isRouting}
                onConfirmDoctorRouting={handleConfirmDoctorRouting}
              />
            </div>

            {/* Right Column: AI Live Preview Panel (4 cols on desktop) */}
            <div className="lg:col-span-4">
              <AICasePreview
                symptomText={symptomText}
                aiResult={aiResult}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
