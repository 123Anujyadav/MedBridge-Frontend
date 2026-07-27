import React from "react";
import { ConversationCard } from "./ConversationCard";
import { type ConversationHistoryItem } from "./ConversationPreview";

interface ConversationGroupProps {
  title: string;
  items: ConversationHistoryItem[];
  onSelectConversation: (item: ConversationHistoryItem) => void;
}

export const ConversationGroup: React.FC<ConversationGroupProps> = ({
  title,
  items,
  onSelectConversation,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {title} ({items.length})
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <ConversationCard key={item.id} item={item} onSelect={onSelectConversation} />
        ))}
      </div>
    </div>
  );
};
