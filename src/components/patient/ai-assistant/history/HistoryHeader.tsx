import React from "react";
import { History, X } from "lucide-react";

interface HistoryHeaderProps {
  onClose: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-base text-foreground tracking-tight">
            AI Conversation History
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Review your previous AI health consultations.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all active:scale-95"
        aria-label="Close history drawer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
