import React from "react";
import { MessageCircle, ArrowRight } from "lucide-react";

interface FollowUpCardProps {
  questions: string[];
  onSelectQuestion: (questionText: string) => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({ questions, onSelectQuestion }) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">Suggested Follow-up Questions</h4>
          <p className="text-[10px] text-muted-foreground">Click a question to populate your message input</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuestion(q)}
            className="group flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-container-low px-3.5 py-2 text-xs font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 text-left"
          >
            <span>"{q}"</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};
