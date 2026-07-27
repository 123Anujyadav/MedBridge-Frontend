import React from "react";
import { ConversationSummaryCard } from "./ConversationSummaryCard";
import { SymptomsCard } from "./SymptomsCard";
import { SpecialistCard } from "./SpecialistCard";
import { UrgencyCard, type UrgencyStatus } from "./UrgencyCard";
import { TimelineCard } from "./TimelineCard";
import { ReferenceCard } from "./ReferenceCard";
import { ConfidenceCard } from "./ConfidenceCard";
import { EmergencyCard, type EmergencyState } from "./EmergencyCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { X, PanelRightClose, Activity } from "lucide-react";

interface RightPanelProps {
  conversationSummary: string | null;
  detectedSymptoms: string[];
  suggestedSpecialist: string | null;
  medicalReferences: string[];
  emergencyRisk: "normal" | "moderate" | "critical";
  /** Model self-reported confidence (0-100), or null when the turn was unscored. */
  aiConfidence?: number | null;
  isThinking?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsedTablet?: boolean;
  onToggleCollapseTablet?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  conversationSummary,
  detectedSymptoms,
  suggestedSpecialist,
  medicalReferences,
  emergencyRisk,
  aiConfidence = null,
  isThinking = false,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsedTablet = false,
  onToggleCollapseTablet,
}) => {
  const getUrgencyStatus = (): UrgencyStatus => {
    if (emergencyRisk === "critical") return "Emergency";
    if (emergencyRisk === "moderate") return "High";
    if (detectedSymptoms.length > 0) return "Medium";
    if (conversationSummary) return "Low";
    return "Unknown";
  };

  const getEmergencyState = (): EmergencyState => {
    if (emergencyRisk === "critical") return "Red";
    if (emergencyRisk === "moderate") return "Yellow";
    return "Green";
  };

  const panelContent = (
    <div className="space-y-4">
      {/* 1. Conversation Summary */}
      <ConversationSummaryCard summary={conversationSummary} isLoading={isThinking} />

      {/* 2. Detected Symptoms */}
      <SymptomsCard symptoms={detectedSymptoms} isLoading={isThinking} />

      {/* 3. Suggested Specialist */}
      <SpecialistCard specialistName={suggestedSpecialist} isLoading={isThinking} />

      {/* 4. Urgency Level */}
      <UrgencyCard level={getUrgencyStatus()} isLoading={isThinking} />

      {/* 5. Health Timeline */}
      <TimelineCard isLoading={isThinking} />

      {/* 6. Medical References */}
      <ReferenceCard references={medicalReferences} isLoading={isThinking} />

      {/* 7. AI Confidence — the model's own score for this turn. Previously a
          hardcoded 94 shown whenever any symptom was detected, which read as a
          measured figure. Null renders as "--". */}
      <ConfidenceCard score={aiConfidence} isLoading={isThinking} />

      {/* 8. Emergency Status */}
      <EmergencyCard
        state={getEmergencyState()}
        description={
          emergencyRisk === "critical"
            ? "Critical emergency symptoms detected."
            : "No emergency detected."
        }
        isLoading={isThinking}
      />

      {/* 9. Quick Actions */}
      <QuickActionsCard />
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[340px] bg-card p-4 shadow-2xl transition-transform duration-300 lg:hidden overflow-y-auto custom-scrollbar ${
          isOpenMobile ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">AI Clinical Dashboard</h3>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-container text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {panelContent}
      </div>

      {/* Desktop / Tablet Panel */}
      <div
        className={`hidden lg:flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full pr-1 transition-all duration-300 shrink-0 ${
          isCollapsedTablet ? "w-0 opacity-0 overflow-hidden" : "w-[360px] xl:w-[370px]"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
          <div>
            <h3 className="font-headline text-headline-sm font-bold text-foreground">AI Clinical Insights</h3>
            <p className="text-xs text-muted-foreground">
              {isThinking ? "Analyzing Telemetry..." : "Live Medical Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onToggleCollapseTablet && (
              <button
                type="button"
                onClick={onToggleCollapseTablet}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-container text-muted-foreground hover:text-foreground transition-colors"
                title="Collapse Panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            )}
            <span className="flex h-2.5 w-2.5 rounded-full bg-success animate-ping" />
          </div>
        </div>

        {/* 9 Cards in exact order */}
        {panelContent}
      </div>
    </>
  );
};
