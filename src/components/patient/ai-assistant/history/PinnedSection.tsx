import React from "react";
import { Pin } from "lucide-react";
import { ConversationCard } from "./ConversationCard";
import { type ConversationHistoryItem } from "./ConversationPreview";

interface PinnedSectionProps {
  pinnedItems: ConversationHistoryItem[];
  onSelectConversation: (item: ConversationHistoryItem) => void;
}

export const PinnedSection: React.FC<PinnedSectionProps> = ({
  pinnedItems,
  onSelectConversation,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-tertiary">
        <Pin className="h-3.5 w-3.5 fill-current" />
        <span>Pinned Conversations</span>
      </div>

      {pinnedItems.length === 0 ? (
        <div className="rounded-xl border border-border-subtle/50 bg-surface-container-low p-3 text-xs text-muted-foreground italic text-center">
          No pinned conversations.
        </div>
      ) : (
        <div className="space-y-2">
          {pinnedItems.map((item) => (
            <ConversationCard key={item.id} item={item} onSelect={onSelectConversation} />
          ))}
        </div>
      )}
    </div>
  );
};
