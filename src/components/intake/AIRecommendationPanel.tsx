import React from "react";
import { Sparkles } from "lucide-react";

interface AIRecommendationPanelProps {
  explanation?: string;
}

/**
 * The agent's stated reason for proposing this clinician.
 *
 * Renders nothing when there is no rationale. The default used to be a fixed
 * sentence about "acute cardiac evaluation", which was shown verbatim for
 * every doctor the agent had not explained — including for complaints that
 * were not cardiac — as though the AI had reasoned about that specific match.
 */
export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  explanation,
}) => {
  if (!explanation?.trim()) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-surface-container-low to-primary/5 p-6 border border-primary/20 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
        <Sparkles className="h-4 w-4 shrink-0" />
        Why this doctor?
      </div>
      <p className="min-h-16 text-xs md:text-sm text-foreground leading-7 italic font-medium">
        "{explanation}"
      </p>
    </div>
  );
};
