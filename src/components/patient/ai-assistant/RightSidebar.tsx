import React from "react";
import { RightPanel } from "./panel/RightPanel";

interface RightSidebarProps {
  conversationSummary: string | null;
  detectedSymptoms: string[];
  suggestedSpecialist: string | null;
  medicalReferences: string[];
  emergencyRisk: "normal" | "moderate" | "critical";
  aiConfidence?: number | null;
  isThinking?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsedTablet?: boolean;
  onToggleCollapseTablet?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  return <RightPanel {...props} />;
};
