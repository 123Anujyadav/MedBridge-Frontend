import React from "react";
import { Zap, Download, Bookmark, Calendar, PlusCircle, Share2 } from "lucide-react";

export const QuickActionsCard: React.FC = () => {
  const actions = [
    { label: "Download Report", icon: Download },
    { label: "Save Conversation", icon: Bookmark },
    { label: "Book Appointment", icon: Calendar },
    { label: "Start New Conversation", icon: PlusCircle },
    { label: "Share Report", icon: Share2 },
  ];

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-xs">
          <Zap className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Quick Actions</h4>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled
              className="flex items-center gap-2.5 rounded-xl border border-border-subtle/80 bg-surface-container-low px-3 py-2 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed text-left transition-all"
            >
              <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
