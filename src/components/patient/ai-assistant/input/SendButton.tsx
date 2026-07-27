import React from "react";
import { Send, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface SendButtonProps {
  onSend: () => void;
  disabled?: boolean;
  isSending?: boolean;
  isThinking?: boolean;
  onStopGeneration?: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({
  onSend,
  disabled = false,
  isSending = false,
  isThinking = false,
  onStopGeneration,
}) => {
  if (isThinking && onStopGeneration) {
    return (
      <button
        type="button"
        onClick={onStopGeneration}
        className="flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-destructive/90 active:scale-95 shrink-0"
        title="Stop AI Generation"
      >
        <Square className="h-3.5 w-3.5 fill-current" />
        <span>Stop</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={disabled || isSending}
      className={cn(
        "flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-primary transition-all duration-200 active:scale-95 shrink-0",
        (disabled || isSending) && "opacity-40 cursor-not-allowed shadow-none"
      )}
      title="Send Message (Enter)"
    >
      {isSending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Sending...</span>
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline font-bold">Send</span>
        </>
      )}
    </button>
  );
};
