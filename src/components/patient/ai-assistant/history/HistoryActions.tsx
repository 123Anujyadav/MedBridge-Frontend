import React, { useState } from "react";
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Copy,
  Pin,
  Star,
  Share2,
  Download,
  Trash2,
  Archive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistoryActionsProps {
  conversationId: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  onOpen?: () => void;
}

export const HistoryActions: React.FC<HistoryActionsProps> = ({
  conversationId,
  isPinned = false,
  isFavorite = false,
  onOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const triggerAction = (actionName: string) => {
    setIsOpen(false);
    if (actionName === "Open" && onOpen) {
      onOpen();
      return;
    }
    toast({
      title: `${actionName} Action`,
      description: `${actionName} triggered for consultation #${conversationId.slice(-4)}.`,
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all"
        title="More Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 w-44 rounded-xl border border-border-subtle bg-card p-1 shadow-xl text-xs space-y-0.5 animate-fade-in">
            <button
              type="button"
              onClick={() => triggerAction("Open")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              <span>Open Conversation</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Pin")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <Pin className="h-3.5 w-3.5 text-tertiary" />
              <span>{isPinned ? "Unpin" : "Pin to Top"}</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Favorite")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <Star className="h-3.5 w-3.5 text-warning fill-warning/20" />
              <span>{isFavorite ? "Unstar" : "Add Favorite"}</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Rename")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Rename</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Duplicate")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Duplicate</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Share")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <Share2 className="h-3.5 w-3.5 text-secondary" />
              <span>Share Link</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Download PDF")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-foreground hover:bg-surface-container"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Download PDF</span>
            </button>
            <div className="my-1 border-t border-border-subtle/50" />
            <button
              type="button"
              onClick={() => triggerAction("Archive")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-muted-foreground hover:bg-surface-container"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction("Delete")}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
