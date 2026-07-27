// ============================================
// Clinical Review Workspace — Doctor Portal
// Opened from "View Full AI Analysis".
//
// Four sections (Patient Overview, AI Clinical Analysis, Medical Evidence,
// Clinical Decision) plus AI suggestions, the case timeline and the
// patient -> AI -> doctor comparison.
//
// Every value rendered here comes from the backend projection. Where the record
// holds nothing, the workspace says so — it never substitutes a placeholder a
// clinician could mistake for a measurement.
//
// Built entirely from the existing design system: premium-card, border-subtle,
// surface-container, the shared StatusBadge/TimelineItem/HealthScoreRing
// primitives and the same input classes used across the portal.
// ============================================
import { useState, type ReactNode } from "react";
import { StatusBadge, UrgencyBadge, CaseStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/States";
import { TimelineItem, HealthScoreRing } from "@/components/shared/FilterBar";
import { CaseTimeline } from "@/components/doctor/CaseTimeline";
import { ReportDocumentPanel } from "@/components/doctor/ReportDocumentPanel";
import { useToast } from "@/hooks/use-toast";
import doctorService from "@/lib/doctor-service";
import {
  useApproveAISummary,
  useSaveConsultation,
  useWritePrescription,
  useIssueAIReport,
} from "@/hooks/useDoctor";
import type {
  ClinicalReviewResponse,
  EvidenceDocument,
  TimelineEvent,
} from "@/types/api";
import {
  Activity,
  AlertTriangle,
  Brain,
  FileText,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";

// ── Small presentational helpers (existing tokens only) ──────────────────────

const NOT_RECORDED = "Not recorded";

function Field({ label, value }: { label: string; value: ReactNode }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className={empty ? "text-sm text-muted-foreground" : "text-sm text-foreground"}>
        {empty ? NOT_RECORDED : value}
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border-subtle p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Chips({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "error" | "warning" | "info" }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{NOT_RECORDED}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <StatusBadge key={item} variant={tone} className="max-w-full">
          {item}
        </StatusBadge>
      ))}
    </div>
  );
}

function Bullets({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="text-sm text-foreground">
          · {item}
        </li>
      ))}
    </ul>
  );
}

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-card p-3 text-sm";
const textareaClass = `${inputClass} resize-none`;
const primaryBtn =
  "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50";
const ghostBtn =
  "rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-container disabled:opacity-50";

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Patient Overview", icon: User },
  { id: "analysis", label: "AI Analysis", icon: Brain },
  { id: "evidence", label: "Medical Evidence", icon: FileText },
  { id: "suggestions", label: "AI Suggestions", icon: Sparkles },
  { id: "timeline", label: "Timeline", icon: Activity },
  { id: "decision", label: "Clinical Decision", icon: Stethoscope },
  { id: "document", label: "Document", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  review: ClinicalReviewResponse;
  onIssued?: () => void;
}

export function ClinicalReviewWorkspace({ review, onIssued }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("overview");

  const approveMutation = useApproveAISummary();
  const saveMutation = useSaveConsultation();
  const prescribeMutation = useWritePrescription();
  const issueMutation = useIssueAIReport();

  const { patient_overview: po, ai_analysis: ai, medical_evidence: ev, ai_suggestions: sx } = review;

  // Doctor-editable decision state, seeded from what is already on the case.
  const today = new Date().toISOString().split("T")[0];
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState(ev.doctor_notes);
  const [tests, setTests] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [referral, setReferral] = useState(ai.recommended_specialist ?? "");
  const [rx, setRx] = useState({
    name: "", dosage: "", frequency: "", duration: "7 days",
    start_date: today, end_date: today, instructions: "",
  });

  const toLines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);
  const caseId = review.case_id;

  const preview = async (doc: EvidenceDocument) => {
    if (!doc.downloadable) {
      toast({
        variant: "destructive",
        title: "No File Stored",
        description: "This record has no retrievable document attached.",
      });
      return;
    }
    try {
      const blob = await doctorService.downloadReportPdf(doc.report_id);
      window.open(URL.createObjectURL(blob), "_blank", "noopener");
    } catch {
      toast({
        variant: "destructive",
        title: "Preview Failed",
        description: "Could not retrieve this document.",
      });
    }
  };

  const requireCase = (): boolean => {
    if (!caseId) {
      toast({
        variant: "destructive",
        title: "No Linked Case",
        description: "This report is not linked to a consultation case.",
      });
      return false;
    }
    return true;
  };

  const handleApprove = async () => {
    if (!requireCase() || !ai.ai_summary.trim()) return;
    try {
      await approveMutation.mutateAsync({ case_id: caseId!, summary: ai.ai_summary });
      toast({ title: "AI Summary Approved", description: "Recorded against the case." });
    } catch {
      toast({ variant: "destructive", title: "Approval Failed", description: "Could not record approval." });
    }
  };

  const handleSave = async (complete: boolean) => {
    if (!requireCase()) return;
    try {
      await saveMutation.mutateAsync({
        case_id: caseId!,
        clinical_notes: notes,
        diagnosis: diagnosis.trim() || null,
        complete_case: complete,
      });
      toast({
        title: complete ? "Case Completed" : "Consultation Saved",
        description: complete ? "The case is now closed." : "Your notes are on the case record.",
      });
    } catch {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save the consultation." });
    }
  };

  const handlePrescribe = async () => {
    if (!requireCase()) return;
    if (!rx.name.trim() || !rx.dosage.trim() || !diagnosis.trim()) {
      toast({
        variant: "destructive",
        title: "Prescription Incomplete",
        description: "A diagnosis, medication name and dosage are required.",
      });
      return;
    }
    try {
      await prescribeMutation.mutateAsync({
        case_id: caseId!,
        patient_id: po.patient_id,
        diagnosis: diagnosis.trim(),
        notes,
        follow_up_date: followUp.trim() || undefined,
        medications: [{
          name: rx.name.trim(),
          dosage: rx.dosage.trim(),
          frequency: rx.frequency.trim() || "As directed",
          duration: rx.duration.trim() || "7 days",
          special_instructions: rx.instructions,
          scheduled_times: [],
          start_date: rx.start_date,
          end_date: rx.end_date,
          side_effects: [],
          interactions: [],
        }],
      });
      toast({ title: "Prescription Saved", description: `${rx.name} added to the case.` });
      setRx({ ...rx, name: "", dosage: "", instructions: "" });
    } catch {
      toast({ variant: "destructive", title: "Prescription Failed", description: "Could not save the prescription." });
    }
  };

  const handleGenerateReport = async () => {
    if (!requireCase()) return;
    if (!diagnosis.trim()) {
      toast({
        variant: "destructive",
        title: "Diagnosis Required",
        description: "Confirm a diagnosis before generating the final report.",
      });
      return;
    }
    try {
      await issueMutation.mutateAsync({
        case_id: caseId!,
        title: `Clinical Report - ${diagnosis.trim().slice(0, 80)}`,
        summary: ai.ai_summary,
        diagnosis: diagnosis.trim(),
        clinical_notes: notes,
        prescription: rx.name.trim()
          ? `${rx.name.trim()} ${rx.dosage.trim()} ${rx.frequency.trim()}`.trim()
          : "",
        follow_up_instructions: followUp,
        recommendations: referral.trim() ? [`Refer to ${referral.trim()}`] : [],
        recommended_tests: toLines(tests),
        ai_generated: ai.has_ai_intake,
        ai_confidence_score: ai.confidence?.score ?? null,
      });
      toast({ title: "Clinical Report Generated", description: `Issued to ${po.patient_name}.` });
      onIssued?.();
    } catch {
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate the report." });
    }
  };

  const busy =
    approveMutation.isPending || saveMutation.isPending ||
    prescribeMutation.isPending || issueMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4">
        {review.case_status && <CaseStatusBadge status={review.case_status} />}
        {ai.urgency_level && <UrgencyBadge level={ai.urgency_level} />}
        {ai.confidence ? (
          <StatusBadge variant={ai.confidence.level === "High" ? "success" : ai.confidence.level === "Medium" ? "warning" : "error"} dot>
            AI Confidence {ai.confidence.percentage}% · {ai.confidence.level}
          </StatusBadge>
        ) : (
          <StatusBadge variant="neutral">AI Confidence not recorded</StatusBadge>
        )}
        {ai.emergency_indicators.length > 0 && (
          <StatusBadge variant="error" dot>
            {ai.emergency_indicators.length} Emergency Indicator(s)
          </StatusBadge>
        )}
      </div>

      {/* Tab strip — same button tokens used elsewhere in the portal */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                : "flex items-center gap-1.5 rounded-xl border border-border-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-container"
            }
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Section 1: Patient Overview ─────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <Block title="Identity">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Patient Name" value={po.patient_name} />
              <Field label="Patient ID" value={<span className="text-xs">{po.patient_id}</span>} />
              <Field label="Age" value={po.age ? `${po.age} years` : ""} />
              <Field label="Gender" value={po.gender} />
              <Field label="Blood Group" value={po.blood_group} />
              <Field label="Previous Visits" value={po.previous_visits} />
            </div>
          </Block>

          <Block title="Biometrics">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Height" value={po.height_cm ? `${po.height_cm} cm` : ""} />
              <Field label="Weight" value={po.weight_kg ? `${po.weight_kg} kg` : ""} />
              <Field
                label="BMI"
                value={po.bmi ? `${po.bmi} (${po.bmi_category})` : ""}
              />
            </div>
            {!po.bmi && (
              <p className="mt-3 text-xs text-muted-foreground">
                BMI is shown only when both height and weight are on file. It is never estimated.
              </p>
            )}
          </Block>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Block title="Allergies">
              <Chips items={po.allergies} tone={po.allergies.length ? "error" : "neutral"} />
            </Block>
            <Block title="Chronic Conditions">
              <Chips items={po.chronic_conditions} tone="warning" />
            </Block>
            <Block title="Current Medications">
              <Chips items={po.current_medications} tone="info" />
            </Block>
          </div>

          <Block title="Care Team & Appointment">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Assigned Doctor" value={po.assigned_doctor} />
              <Field label="Specialty" value={po.assigned_doctor_specialty} />
              <Field label="Appointment Date" value={po.appointment_date} />
              <Field label="Appointment Status" value={po.appointment_status} />
            </div>
          </Block>
        </div>
      )}

      {/* ── Section 2: AI Clinical Analysis ─────────────────────────── */}
      {tab === "analysis" && (
        <div className="space-y-4">
          {!ai.has_ai_intake && (
            <div className="rounded-xl border border-border-subtle bg-surface-container p-4 text-sm text-muted-foreground">
              No AI intake session is linked to this case. The fields below fall back to
              the case record, and anything absent is shown as not recorded.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-4">
              <Block title="Chief Complaint">
                <p className="text-sm text-foreground">{ai.chief_complaint || NOT_RECORDED}</p>
              </Block>
              <Block title="AI Summary">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {ai.ai_summary || NOT_RECORDED}
                </p>
              </Block>
            </div>
            <Block title="AI Confidence">
              {ai.confidence ? (
                <div className="flex flex-col items-center gap-2">
                  <HealthScoreRing score={ai.confidence.percentage} label="Confidence" />
                  <StatusBadge
                    variant={ai.confidence.level === "High" ? "success" : ai.confidence.level === "Medium" ? "warning" : "error"}
                  >
                    {ai.confidence.level}
                  </StatusBadge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No confidence score was recorded for this case.
                </p>
              )}
            </Block>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Block title="Extracted Symptoms">
              <Chips items={ai.extracted_symptoms} tone="info" />
            </Block>
            <Block title="Timeline of Symptoms">
              {ai.symptom_timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No structured symptom records.</p>
              ) : (
                <ul className="space-y-2">
                  {ai.symptom_timeline.map((s) => (
                    <li key={s.name} className="text-sm text-foreground">
                      <span className="font-medium">{s.name}</span>
                      {s.severity && ` · ${s.severity}`}
                      {s.duration && ` · ${s.duration}`}
                      {s.body_part && ` · ${s.body_part}`}
                    </li>
                  ))}
                </ul>
              )}
            </Block>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Severity" value={ai.severity} />
            <Field label="Onset" value={ai.onset} />
            <Field label="Duration" value={ai.duration} />
            <Field label="Language Detected" value={ai.language_detected} />
          </div>

          <Block title="Possible Causes (for clinician evaluation)">
            <Bullets items={ai.possible_causes} empty="No differential considerations were recorded." />
          </Block>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Block title="Recommended Specialist">
              <p className="text-sm text-foreground">{ai.recommended_specialist || NOT_RECORDED}</p>
              {ai.recommendation_reason && (
                <p className="mt-2 text-xs text-muted-foreground">{ai.recommendation_reason}</p>
              )}
            </Block>
            <Block title="Emergency Indicators">
              {ai.emergency_indicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">None detected during intake.</p>
              ) : (
                <Chips items={ai.emergency_indicators} tone="error" />
              )}
            </Block>
          </div>

          <Block title="Conversation Summary (patient's own words)">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {ai.conversation_summary || "No intake transcript on file."}
            </p>
          </Block>

          {/* Patient -> AI -> Doctor comparison */}
          <Block title="Report Review — Patient Input → AI Interpretation → Doctor Decision">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { head: "1. Patient Input", body: review.comparison.patient_input, src: review.comparison.patient_input_source },
                { head: "2. AI Interpretation", body: review.comparison.ai_interpretation, src: review.comparison.ai_interpretation_source },
                {
                  head: "3. Doctor Final Decision",
                  body: review.comparison.doctor_has_decided ? review.comparison.doctor_decision : "",
                  src: review.comparison.doctor_has_decided ? review.comparison.doctor_decision_source : "Pending clinician review",
                },
              ].map((col) => (
                <div key={col.head} className="rounded-xl border border-border-subtle bg-surface-container p-3">
                  <p className="mb-2 text-xs font-semibold text-foreground">{col.head}</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {col.body || <span className="text-muted-foreground">Not yet recorded</span>}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{col.src}</p>
                </div>
              ))}
            </div>
          </Block>
        </div>
      )}

      {/* ── Section 3: Medical Evidence ─────────────────────────────── */}
      {tab === "evidence" && (
        <div className="space-y-4">
          {([
            ["Uploaded Reports", ev.uploaded_reports],
            ["Lab Reports", ev.lab_reports],
            ["Images & Scans", ev.imaging_and_scans],
            ["AI Report Analysis", ev.ai_report_analysis],
            ["Historical Reports", ev.historical_reports],
          ] as const).map(([label, docs]) => (
            <Block key={label} title={label}>
              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">None on file.</p>
              ) : (
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={`${label}-${doc.report_id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} · {doc.date}
                          {doc.doctor_name ? ` · ${doc.doctor_name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.ai_generated && <StatusBadge variant="info">AI</StatusBadge>}
                        <button type="button" onClick={() => preview(doc)} className={ghostBtn}>
                          {doc.downloadable ? "Preview" : "No File"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Block>
          ))}

          <Block title="Case Attachments">
            {ev.case_attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attachments on the case.</p>
            ) : (
              <Bullets items={ev.case_attachments.map((a) => a.name || a.type)} empty="" />
            )}
          </Block>

          <Block title="Doctor Notes">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {ev.doctor_notes || "No notes recorded on this case yet."}
            </p>
          </Block>

          <Block title="Previous Prescriptions">
            {ev.previous_prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prescriptions on file.</p>
            ) : (
              <div className="space-y-3">
                {ev.previous_prescriptions.map((p) => (
                  <div key={p.prescription_id} className="rounded-xl border border-border-subtle p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{p.diagnosis}</p>
                      <StatusBadge variant={p.status === "active" ? "success" : "neutral"}>
                        {p.status}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.doctor_name}
                      {p.follow_up_date ? ` · follow-up ${p.follow_up_date}` : ""}
                    </p>
                    {p.medications.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {p.medications.map((m) => (
                          <li key={m.name} className="text-sm text-foreground">
                            · {m.name} {m.dosage} — {m.frequency}, {m.duration}
                            {m.interactions.length > 0 && (
                              <span className="text-destructive">
                                {" "}· interactions: {m.interactions.join(", ")}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Block>
        </div>
      )}

      {/* ── AI Suggestions ──────────────────────────────────────────── */}
      {tab === "suggestions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle bg-surface-container p-4">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm text-foreground">
              These are <span className="font-semibold">AI Suggestions</span> for clinician
              evaluation — not confirmed diagnoses.
            </p>
            <StatusBadge variant={sx.generated ? "info" : "neutral"}>
              {sx.generated ? "AI generated" : "Record-derived only"}
            </StatusBadge>
          </div>

          {sx.notes.length > 0 && (
            <Block title="Coverage Notes">
              <Bullets items={sx.notes} empty="" />
            </Block>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Block title="Differential Diagnoses (AI Suggestion)">
              <Bullets items={sx.differential_diagnoses} empty="None suggested." />
            </Block>
            <Block title="Red Flag Symptoms">
              <Bullets items={sx.red_flag_symptoms} empty="None flagged." />
            </Block>
            <Block title="Drug Interaction Warnings">
              <Bullets items={sx.drug_interaction_warnings} empty="No interactions identified from the record." />
            </Block>
            <Block title="Medication Alerts (AI Suggestion)">
              <Bullets items={sx.medication_alerts} empty="No alerts." />
            </Block>
            <Block title="Suggested Laboratory Tests (AI Suggestion)">
              <Bullets items={sx.suggested_lab_tests} empty="None suggested." />
            </Block>
            <Block title="Suggested Imaging (AI Suggestion)">
              <Bullets items={sx.suggested_imaging} empty="None suggested." />
            </Block>
            <Block title="Possible Contraindications (AI Suggestion)">
              <Bullets items={sx.possible_contraindications} empty="None identified." />
            </Block>
            <Block title="Relevant Medical History">
              <Bullets items={sx.relevant_medical_history} empty="No relevant history on file." />
            </Block>
          </div>

          <Block title="Clinical Guideline Summary (AI Suggestion)">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {sx.clinical_guideline_summary || "No guideline summary available."}
            </p>
          </Block>

          {review.data_gaps.length > 0 && (
            <Block title="Gaps In The Record">
              <Bullets items={review.data_gaps} empty="" />
            </Block>
          )}
        </div>
      )}

      {/* ── Patient Timeline ────────────────────────────────────────── */}
      {tab === "timeline" && (
        <div className="space-y-4">
          {/* Lifecycle stages: shows what has *not* happened yet, which a
              chronological event log by definition cannot. */}
          <Block title="Case Lifecycle">
            <div className="pt-2">
              {review.timeline.map((e: TimelineEvent, i) => (
                <TimelineItem
                  key={e.key}
                  title={e.label}
                  timestamp={
                    e.timestamp
                      ? new Date(e.timestamp).toLocaleString()
                      : "Not yet reached"
                  }
                  description={e.detail || undefined}
                  status={e.status === "completed" ? "success" : "info"}
                  isLast={i === review.timeline.length - 1}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              A stage is marked complete only when a stored record or timestamp backs it.
            </p>
          </Block>

          {/* Full audit trail: every recorded action with actor and changes. */}
          {caseId ? (
            <Block title="Audit Trail">
              <CaseTimeline caseId={caseId} />
            </Block>
          ) : (
            <Block title="Audit Trail">
              <p className="text-sm text-muted-foreground">
                This report is not linked to a consultation case, so it has no case
                history.
              </p>
            </Block>
          )}
        </div>
      )}

      {/* ── Document lifecycle: preview, versions, comparison ───────── */}
      {tab === "document" && (
        <ReportDocumentPanel
          reportId={review.report_id}
          reportTitle={review.report_title}
        />
      )}

      {/* ── Section 4: Clinical Decision ────────────────────────────── */}
      {tab === "decision" && (
        <div className="space-y-4">
          {!caseId && (
            <div className="rounded-xl border border-border-subtle bg-surface-container p-4 text-sm text-muted-foreground">
              This report is not linked to a consultation case, so clinical decisions
              cannot be recorded against it.
            </div>
          )}

          <Block title="Approve AI Summary">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {ai.ai_summary || "No AI summary to approve."}
            </p>
            <button
              type="button"
              onClick={handleApprove}
              disabled={!caseId || busy || !ai.ai_summary.trim()}
              className={`${primaryBtn} mt-3`}
            >
              {approveMutation.isPending ? "Approving..." : "Approve AI Summary"}
            </button>
          </Block>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Diagnosis</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={2}
              placeholder="Confirm or modify the working diagnosis"
              className={textareaClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Clinical Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={textareaClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Recommend Tests (one per line)
              </label>
              <textarea value={tests} onChange={(e) => setTests(e.target.value)} rows={3} className={textareaClass} />
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Recommend Follow-up</label>
                <input
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="e.g. Review in 2 weeks"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Refer to Specialist</label>
                <input
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  placeholder="e.g. Neurology"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <Block title="Add Prescription">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <input value={rx.name} onChange={(e) => setRx({ ...rx, name: e.target.value })} placeholder="Medication" className={inputClass} />
              <input value={rx.dosage} onChange={(e) => setRx({ ...rx, dosage: e.target.value })} placeholder="Dosage e.g. 500mg" className={inputClass} />
              <input value={rx.frequency} onChange={(e) => setRx({ ...rx, frequency: e.target.value })} placeholder="Frequency" className={inputClass} />
              <input value={rx.duration} onChange={(e) => setRx({ ...rx, duration: e.target.value })} placeholder="Duration" className={inputClass} />
              <input type="date" value={rx.start_date} onChange={(e) => setRx({ ...rx, start_date: e.target.value })} className={inputClass} />
              <input type="date" value={rx.end_date} onChange={(e) => setRx({ ...rx, end_date: e.target.value })} className={inputClass} />
            </div>
            <input
              value={rx.instructions}
              onChange={(e) => setRx({ ...rx, instructions: e.target.value })}
              placeholder="Special instructions"
              className={`${inputClass} mt-3`}
            />
            <button type="button" onClick={handlePrescribe} disabled={!caseId || busy} className={`${primaryBtn} mt-3`}>
              {prescribeMutation.isPending ? "Saving..." : "Add Prescription"}
            </button>
          </Block>

          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-4">
            <button type="button" onClick={() => handleSave(false)} disabled={!caseId || busy} className={primaryBtn}>
              {saveMutation.isPending ? "Saving..." : "Save Consultation"}
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={!caseId || busy}
              className={primaryBtn}
            >
              {issueMutation.isPending ? "Generating..." : "Generate Final Clinical Report"}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={!caseId || busy}
              className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-container disabled:opacity-50"
            >
              Complete Case
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClinicalReviewEmpty() {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8" />}
      title="Review Unavailable"
      description="The clinical review for this report could not be assembled."
    />
  );
}
