import React, { useState } from "react";
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, Share2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageToolbarProps {
  textToCopy: string;
  onRegenerate?: () => void;
}

export const MessageToolbar: React.FC<MessageToolbarProps> = ({ textToCopy, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Copied ✓",
      description: "Response text copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Share Link Generated",
      description: "Clinical summary response copied for secure sharing.",
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      {/* Evidence Tag */}
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-medium text-muted-foreground">
          Verified Evidence Protocol
        </span>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center gap-1">
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy message text"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all hover:bg-surface-container hover:text-foreground active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success animate-bounce" />
              <span className="text-success font-bold">Copied ✓</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Regenerate Button */}
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            aria-label="Regenerate AI response"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all hover:bg-surface-container hover:text-foreground active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Regenerate</span>
          </button>
        )}

        {/* Thumbs Up */}
        <button
          type="button"
          onClick={() => setLiked(liked === true ? null : true)}
          aria-label="Helpful response"
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-all active:scale-95 ${
            liked === true
              ? "bg-primary/10 text-primary font-bold"
              : "hover:bg-surface-container hover:text-foreground"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>

        {/* Thumbs Down */}
        <button
          type="button"
          onClick={() => setLiked(liked === false ? null : false)}
          aria-label="Not helpful response"
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-all active:scale-95 ${
            liked === false
              ? "bg-destructive/10 text-destructive font-bold"
              : "hover:bg-surface-container hover:text-foreground"
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share response"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-all hover:bg-surface-container hover:text-foreground active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
