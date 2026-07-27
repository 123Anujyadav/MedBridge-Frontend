import React from "react";
import { Brain, AlertTriangle, ShieldCheck, Stethoscope, Clock, Activity, CheckCircle2, HelpCircle, FileText, Sparkles } from "lucide-react";

export interface ClinicalCaseData {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: string; // e.g. "Moderate (6/10)", "High (8/10)"
  urgency: "low" | "medium" | "high" | "emergency";
  suggestedDepartment: string;
  possibleRedFlags: string[];
  missingInformation: string[];
  doctorSummary: string;
  confidence: number;
}

interface AICasePreviewProps {
  symptomText: string;
  aiResult: ClinicalCaseData | null;
  isProcessing: boolean;
}

export const AICasePreview: React.FC<AICasePreviewProps> = ({
  symptomText,
  aiResult,
  isProcessing,
}) => {
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
      case "emergency":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="sticky top-6 rounded-3xl border border-border-subtle bg-card p-6 shadow-card space-y-6 transition-all">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-foreground flex items-center gap-2">
              AI Case Summary
            </h3>
            <p className="text-[11px] text-muted-foreground">Live Clinical Structuring Engine</p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          <Sparkles className="h-3 w-3" />
          Live Preview
        </span>
      </div>

      {/* State 1: Processing */}
      {isProcessing && (
        <div className="space-y-4 py-6">
          <div className="flex items-center justify-center gap-3 text-primary font-semibold text-sm">
            <Brain className="h-5 w-5 animate-bounce" />
            <span>Structuring Clinical Case...</span>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-surface-container-high rounded-lg animate-pulse w-3/4" />
            <div className="h-4 bg-surface-container-high rounded-lg animate-pulse w-full" />
            <div className="h-4 bg-surface-container-high rounded-lg animate-pulse w-5/6" />
            <div className="h-20 bg-surface-container-high rounded-xl animate-pulse" />
          </div>
        </div>
      )}

      {/* State 2: Generated Result */}
      {!isProcessing && aiResult ? (
        <div className="space-y-5 text-sm">
          {/* Top Urgency & Department Badge */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface-container-low p-3 border border-border-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Urgency Rating
              </span>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border capitalize ${getUrgencyBadge(aiResult.urgency)}`}>
                  <Activity className="h-3 w-3" />
                  {aiResult.urgency} Level
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low p-3 border border-border-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Suggested Department
              </span>
              <p className="mt-1 font-bold text-xs text-primary truncate flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                {aiResult.suggestedDepartment}
              </p>
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Chief Complaint
            </span>
            <div className="rounded-xl bg-primary/5 p-3 text-xs font-medium text-foreground border border-primary/10">
              "{aiResult.chiefComplaint}"
            </div>
          </div>

          {/* Symptoms List */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Extracted Symptoms ({aiResult.symptoms.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {aiResult.symptoms.map((sym, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-container-high px-2.5 py-1 text-xs font-medium text-foreground border border-border-subtle"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Duration & Severity */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-surface-container-low p-2.5 border border-border-subtle">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Duration
              </span>
              <p className="font-semibold text-foreground mt-0.5">{aiResult.duration}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-2.5 border border-border-subtle">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> Severity
              </span>
              <p className="font-semibold text-foreground mt-0.5">{aiResult.severity}</p>
            </div>
          </div>

          {/* Possible Red Flags */}
          {aiResult.possibleRedFlags.length > 0 && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Possible Red Flags ({aiResult.possibleRedFlags.length})
              </span>
              <ul className="text-xs text-foreground space-y-0.5 list-disc pl-4">
                {aiResult.possibleRedFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Information */}
          {aiResult.missingInformation.length > 0 && (
            <div className="rounded-xl bg-surface-container-low p-3 border border-border-subtle space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                Missing Information
              </span>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                {aiResult.missingInformation.map((info, i) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Doctor Summary */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
              <FileText className="h-3.5 w-3.5 text-primary" /> Doctor Executive Summary
            </span>
            <p className="text-xs text-foreground bg-surface-container-low p-3 rounded-xl border border-border-subtle leading-relaxed italic">
              {aiResult.doctorSummary}
            </p>
          </div>
        </div>
      ) : null}

      {/* State 3: Waiting for description (Skeleton Placeholders) */}
      {!isProcessing && !aiResult && (
        <div className="space-y-5 text-center py-4">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container-low/60 border border-dashed border-border-subtle">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Brain className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm text-foreground">Waiting for your description...</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              As you speak or type, the AI will parse clinical entities and preview the medical case structure here.
            </p>
          </div>

          {/* Skeleton Structure Preview */}
          <div className="space-y-3 text-left opacity-60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Clinical Case Target Schema:
            </p>
            <div className="space-y-2">
              <div className="h-8 rounded-xl bg-surface-container-high/70 border border-border-subtle flex items-center px-3 text-xs text-muted-foreground">
                Chief Complaint Placeholder
              </div>
              <div className="h-8 rounded-xl bg-surface-container-high/70 border border-border-subtle flex items-center px-3 text-xs text-muted-foreground">
                Extracted Symptoms Tag Matrix
              </div>
              <div className="h-8 rounded-xl bg-surface-container-high/70 border border-border-subtle flex items-center px-3 text-xs text-muted-foreground">
                Severity & Urgency Classification
              </div>
              <div className="h-16 rounded-xl bg-surface-container-high/70 border border-border-subtle flex items-center px-3 text-xs text-muted-foreground">
                Doctor Case Brief Placeholder
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Trust Tag */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Clinical Verification Active
        </span>
        <span className="font-mono">v2.4 Case Spec</span>
      </div>
    </div>
  );
};
