import React from "react";
import {
  CheckCircle2,
  Send,
  Edit3,
  MessageSquare,
  Download,
  Calendar,
  Clock,
  Building2,
  FileText,
  Activity,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ClinicalCaseData } from "./AICasePreview";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SuccessScreenProps {
  caseId: string;
  createdDate: string;
  estimatedReviewTime: string;
  assignedDepartment: string;
  caseSummary: ClinicalCaseData;
  onEditCase: () => void;
  onSendToDoctor: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  caseId = "CAS-2026-8942",
  createdDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  estimatedReviewTime = "< 15 mins (Priority)",
  assignedDepartment = "Cardiology / General Internal Medicine",
  caseSummary,
  onEditCase,
  onSendToDoctor,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDownload = () => {
    toast({
      title: "Downloading Medical Case Summary",
      description: `Case ${caseId} report generated as PDF/text.`,
    });
  };

  const handleStartConsultation = () => {
    navigate("/patient/ai-assistant");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5" /> Clinical Intake Verified
                </span>
              </div>
              <h1 className="mt-2 font-headline text-2xl md:text-3xl font-bold tracking-tight">
                Medical Case Generated Successfully
              </h1>
              <p className="mt-1 text-sm md:text-base text-emerald-100 max-w-xl">
                Your health concern has been structured into a standardized clinical case file. Ready for physician review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Case Quick Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Case ID */}
        <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Case Identifier
          </span>
          <p className="font-mono text-lg font-bold text-foreground">{caseId}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Unique Track ID
          </p>
        </div>

        {/* Date & Time */}
        <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Generated Date
          </span>
          <p className="font-semibold text-sm text-foreground">{createdDate}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Intake Timestamp</p>
        </div>

        {/* Estimated Review Time */}
        <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
            <Clock className="h-3.5 w-3.5 text-amber-500" /> Est. Review Time
          </span>
          <p className="font-semibold text-sm text-amber-600 dark:text-amber-400">
            {estimatedReviewTime}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Doctor Queue Status</p>
        </div>

        {/* Assigned Department */}
        <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
            <Building2 className="h-3.5 w-3.5 text-primary" /> Department
          </span>
          <p className="font-semibold text-xs text-primary truncate">
            {caseSummary?.suggestedDepartment || assignedDepartment}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Specialty Routing</p>
        </div>
      </div>

      {/* Generated Clinical Case Document Card */}
      <div className="rounded-3xl border border-border-subtle bg-card p-6 md:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-foreground">
                Generated Clinical Case Record
              </h3>
              <p className="text-xs text-muted-foreground">Preview of document sent to physician dashboard</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Structured Case Complete
          </span>
        </div>

        {/* Chief Complaint & Doctor Brief */}
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chief Complaint
            </span>
            <p className="font-semibold text-foreground text-base">"{caseSummary.chiefComplaint}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Primary Symptoms & Severity
              </span>
              <div className="flex flex-wrap gap-1.5">
                {caseSummary.symptoms.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg bg-card px-2.5 py-1 text-xs font-medium text-foreground border border-border-subtle"
                  >
                    <Activity className="h-3 w-3 text-primary" /> {s}
                  </span>
                ))}
              </div>
              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Duration: <strong className="text-foreground">{caseSummary.duration}</strong></span>
                <span>Severity: <strong className="text-foreground">{caseSummary.severity}</strong></span>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Executive Doctor Brief
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {caseSummary.doctorSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps Action Buttons */}
        <div className="pt-6 border-t border-border-subtle space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Choose Next Action:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Action 1: Send to Doctor (Primary CTA) */}
            <button
              type="button"
              onClick={onSendToDoctor}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-xs md:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send to Doctor</span>
            </button>

            {/* Action 2: Edit Case */}
            <button
              type="button"
              onClick={onEditCase}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-card px-5 py-3.5 text-xs md:text-sm font-semibold text-foreground transition-all hover:bg-surface-container-low active:scale-95 cursor-pointer"
            >
              <Edit3 className="h-4 w-4 text-muted-foreground" />
              <span>Edit Case</span>
            </button>

            {/* Action 3: Start AI Consultation */}
            <button
              type="button"
              onClick={handleStartConsultation}
              className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-3.5 text-xs md:text-sm font-semibold text-primary transition-all hover:bg-primary/10 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start AI Consultation</span>
            </button>

            {/* Action 4: Download Summary */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-card px-5 py-3.5 text-xs md:text-sm font-semibold text-foreground transition-all hover:bg-surface-container-low active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Download Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
