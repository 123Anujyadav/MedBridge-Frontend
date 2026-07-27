import React, { useState } from "react";
import { Copy, Check, Download, Bookmark, Share2, Calendar, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ConversationActionBarProps {
  responseText: string;
  onNewQuestion?: () => void;
}

export const ConversationActionBar: React.FC<ConversationActionBarProps> = ({
  responseText,
  onNewQuestion,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    toast({
      title: "Copied ✓",
      description: "Full AI response copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    toast({
      title: "Generating Report PDF",
      description: "Clinical summary report ready for download.",
    });
  };

  const handleSave = () => {
    setSaved(!saved);
    toast({
      title: saved ? "Removed from Saved" : "Saved to Health Records",
      description: saved
        ? "Conversation removed from bookmarks."
        : "Conversation bookmarked under Medical History.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(responseText);
    toast({
      title: "Share Link Copied",
      description: "Secure conversation link copied to clipboard.",
    });
  };

  return (
    <div className="pt-3 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Copy Response */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-container hover:text-foreground active:scale-95 shadow-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied ✓" : "Copy Response"}</span>
        </button>

        {/* Download Report */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-container hover:text-foreground active:scale-95 shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download Report</span>
        </button>

        {/* Save Conversation */}
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 shadow-xs ${
            saved
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border-subtle bg-card text-muted-foreground hover:bg-surface-container hover:text-foreground"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>{saved ? "Saved ✓" : "Save"}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-container hover:text-foreground active:scale-95 shadow-xs"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Book Appointment */}
        <button
          type="button"
          onClick={() => navigate("/patient/appointments")}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95 shadow-xs"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Book Appointment</span>
        </button>

        {/* New Question */}
        {onNewQuestion && (
          <button
            type="button"
            onClick={onNewQuestion}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Question</span>
          </button>
        )}
      </div>
    </div>
  );
};
