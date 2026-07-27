import React from "react";
import { History, PlusCircle } from "lucide-react";

interface EmptyHistoryProps {
  onStartNew: () => void;
}

export const EmptyHistory: React.FC<EmptyHistoryProps> = ({ onStartNew }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
        <History className="h-7 w-7" />
      </div>
      <div>
        <h4 className="font-bold text-base text-foreground">No previous conversations</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Your AI medical consultations and triage history will appear here.
        </p>
      </div>

      <button
        type="button"
        onClick={onStartNew}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-primary transition-all hover:opacity-90 active:scale-95"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Start New Conversation</span>
      </button>
    </div>
  );
};
