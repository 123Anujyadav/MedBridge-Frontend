import React from "react";
import { FileText, Stethoscope, UserCheck, Sparkles } from "lucide-react";

export interface ConversationHistoryItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  time: string;
  duration: string;
  messageCount: number;
  symptoms: string[];
  specialist?: string;
  urgency: "Low" | "Medium" | "High" | "Emergency";
  status: "Completed" | "In Progress" | "Archived";
  isPinned?: boolean;
  isFavorite?: boolean;
}

interface ConversationPreviewProps {
  item: ConversationHistoryItem;
}

export const ConversationPreview: React.FC<ConversationPreviewProps> = ({ item }) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xl text-xs space-y-3 max-w-sm border-primary/30 animate-fade-in">
      <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-bold text-foreground truncate">{item.title}</span>
      </div>

      <div className="space-y-2">
        {/* Summary */}
        <div className="space-y-1">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3 text-primary" />
            Summary
          </span>
          <p className="text-[11px] text-foreground leading-relaxed pl-4">{item.preview}</p>
        </div>

        {/* Symptoms */}
        {item.symptoms.length > 0 && (
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Stethoscope className="h-3 w-3 text-tertiary" />
              Symptoms Detected
            </span>
            <div className="flex flex-wrap gap-1 pl-4">
              {item.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Specialist */}
        {item.specialist && (
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-success" />
              Recommended Specialist
            </span>
            <p className="text-[11px] font-bold text-foreground pl-4">{item.specialist}</p>
          </div>
        )}
      </div>
    </div>
  );
};
