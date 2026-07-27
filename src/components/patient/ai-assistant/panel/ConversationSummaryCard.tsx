import React from "react";
import { ClipboardList, Info } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

interface ConversationSummaryCardProps {
  summary: string | null;
  isLoading?: boolean;
}

export const ConversationSummaryCard: React.FC<ConversationSummaryCardProps> = ({
  summary,
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-xs">
          <ClipboardList className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Conversation Summary</h4>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : summary ? (
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          {summary}
        </p>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 text-xs text-muted-foreground italic border border-border-subtle/50">
          <Info className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span>No conversation summary available.</span>
        </div>
      )}
    </div>
  );
};
