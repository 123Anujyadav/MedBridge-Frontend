import React, { useState } from "react";
import { MessageSquare, Clock, Pin, Star, Stethoscope, ChevronRight } from "lucide-react";
import { HistoryActions } from "./HistoryActions";
import { ConversationPreview, type ConversationHistoryItem } from "./ConversationPreview";

interface ConversationCardProps {
  item: ConversationHistoryItem;
  onSelect: (item: ConversationHistoryItem) => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({ item, onSelect }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getUrgencyStyle = (urgency: ConversationHistoryItem["urgency"]) => {
    switch (urgency) {
      case "Emergency":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "High":
        return "bg-warning/20 text-warning border-warning/30";
      case "Medium":
        return "bg-primary/10 text-primary border-primary/20";
      case "Low":
        return "bg-success/10 text-success border-success/20";
    }
  };

  return (
    <div
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      onClick={() => onSelect(item)}
      className="relative flex flex-col gap-2 rounded-2xl border border-border-subtle bg-card p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-md cursor-pointer group"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Stethoscope className="h-3.5 w-3.5" />
          </div>

          <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
            {item.title}
          </h4>

          {item.isPinned && <Pin className="h-3 w-3 text-tertiary fill-tertiary shrink-0" />}
          {item.isFavorite && <Star className="h-3 w-3 text-warning fill-warning shrink-0" />}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getUrgencyStyle(item.urgency)}`}>
            {item.urgency}
          </span>
          <HistoryActions conversationId={item.id} isPinned={item.isPinned} isFavorite={item.isFavorite} onOpen={() => onSelect(item)} />
        </div>
      </div>

      {/* Preview Snippet */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {item.preview}
      </p>

      {/* Symptom Badges */}
      {item.symptoms.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.symptoms.slice(0, 3).map((sym, idx) => (
            <span key={idx} className="rounded bg-surface-container-low px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border-subtle">
              {sym}
            </span>
          ))}
          {item.symptoms.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              +{item.symptoms.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer Info Row */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border-subtle/40">
        <div className="flex items-center gap-2">
          <span>{item.date}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {item.duration}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-2.5 w-2.5" />
            {item.messageCount} msgs
          </span>
        </div>

        <div className="flex items-center gap-1 text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>View</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>

      {/* Desktop Hover Quick Preview Popover */}
      {showPreview && (
        <div className="hidden lg:block absolute left-full top-0 ml-3 z-50 pointer-events-none">
          <ConversationPreview item={item} />
        </div>
      )}
    </div>
  );
};
