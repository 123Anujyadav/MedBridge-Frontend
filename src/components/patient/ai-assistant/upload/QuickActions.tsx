import React from "react";
import { Sparkles, FileText, HelpCircle, UserCheck, MessageSquare } from "lucide-react";

export const QuickActions: React.FC = () => {
  const actions = [
    { label: "Analyze Report", icon: Sparkles },
    { label: "Summarize Report", icon: FileText },
    { label: "Explain in Simple Language", icon: HelpCircle },
    { label: "Ask Questions", icon: MessageSquare },
    { label: "Book Doctor", icon: UserCheck },
  ];

  return (
    <div className="space-y-2 pt-2">
      <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        Quick Report Actions
      </h5>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled
              className="flex items-center gap-1.5 rounded-xl border border-border-subtle/80 bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed transition-all"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
