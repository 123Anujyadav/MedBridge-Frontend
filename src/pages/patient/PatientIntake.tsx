import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import patientService from "@/lib/patient-service";
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

  // Selected Doctor routing state
  const [routedDoctor, setRoutedDoctor] = useState<Doctor | null>(null);

  // Case Metadata
  const [caseMetadata, setCaseMetadata] = useState({
    caseId: `CAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdDate: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    estimatedReviewTime: "< 15 mins (Priority)",
    assignedDepartment: "Cardiology / General Internal Medicine",
  });

  // Main Action: Generate Medical Case
  const handleGenerateMedicalCase = async () => {
    if (!symptomText.trim()) {
      toast({
        variant: "destructive",
        title: "Symptom Description Required",
        description: "Please speak or type your health concern before generating a case.",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2); // Step 2: AI Medical Analysis
    setShowProcessingOverlay(true);

    try {
      // Call backend API integration endpoint
      const data = await patientService.processSymptomIntake({
        symptoms: symptomText,
        age: "30",
        gender: "unspecified",
      });

      // Only values the backend actually returned. Every field below used to
      // carry an invented default — symptom names, a "3 days" duration, a
      // severity score, red flags and a Cardiology department — which presented
      // guesses to the patient and to the receiving clinician as AI findings.
      const extracted = data.extracted_symptoms || data.extractedSymptoms || [];
      const urgency = (data.urgency_level || data.urgency || "medium").toLowerCase() as
        | "low"
        | "medium"
        | "high"
        | "emergency";
      const specialty = data.recommended_specialty || data.specialty || "General Medicine";
      // `??`, not `||`: this pipeline deliberately reports 0 for "never scored",
      // and `|| 94` turned that into a measured-looking 94% confidence badge.
      const confidence = data.ai_confidence ?? data.confidence ?? 0;

      const structuredCase: ClinicalCaseData = {
        chiefComplaint: symptomText.length > 90 ? symptomText.slice(0, 90) + "..." : symptomText,
        symptoms: extracted,
        duration: "As described by patient",
        severity: "Not scored",
        urgency,
        suggestedDepartment: specialty,
        possibleRedFlags:
          urgency === "high" || urgency === "emergency"
            ? [`Urgency assessed as ${urgency} — requires clinical review`]
            : [],
        missingInformation: [],
        doctorSummary: data.summary || data.analysis || "",
        confidence,
      };

      setAiResult(structuredCase);
      setHasGeneratedCase(true);
      setCaseMetadata((prev) => ({
        ...prev,
        assignedDepartment: specialty,
      }));
    } catch (err) {
      // A failed analysis must fail visibly. This branch used to synthesise a
      // complete clinical case — invented symptoms ("Fatigue"), a severity of
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
    setCurrentStep(3); // Step 3: Case Review
    toast({
      title: "Medical Case Created",
      description: `Case ID ${caseMetadata.caseId} generated. Select a specialist below to route your case.`,
    });
  };

  // Handle Confirmation of Doctor Routing
  const handleConfirmDoctorRouting = (doctor: Doctor, consultationType: "video" | "in-person") => {
    setRoutedDoctor(doctor);
    setCaseMetadata((prev) => ({
      ...prev,
      assignedDepartment: `${doctor.department} • ${doctor.name}`,
    }));
    setIsSuccess(true);
    setCurrentStep(4); // Step 4: Sent to Doctor
  };

  // Success Screen CTAs
  const handleSendToDoctor = () => {
    toast({
      title: "Sent to Doctor Dashboard",
      description: `Case ${caseMetadata.caseId} successfully routed to ${routedDoctor?.name || caseMetadata.assignedDepartment}.`,
    });
    setTimeout(() => {
      navigate("/patient/appointments");
    }, 1200);
  };

  const handleEditCase = () => {
    setIsSuccess(false);
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
              />

              {/* REPLACED: AI Recommended Specialists Section */}
              <RecommendedDoctors
                hasGeneratedCase={hasGeneratedCase}
                isLoading={isProcessing}
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
