import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, RotateCcw, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type AIResponseData } from "./cards/StructuredAIResponse";

export interface MessageType {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  symptomsDetected?: string[];
  specialistSuggested?: string;
  references?: string[];
  structuredData?: AIResponseData;
}

interface ChatMessageProps {
  message: MessageType;
  index: number;
  onRegenerate?: (index: number) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, index, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Response text copied successfully.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const isAI = message.sender === "ai";

  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 animate-fade-in group",
        isAI ? "items-start" : "items-end"
      )}
    >
      {/* Header Info Tag */}
      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        {isAI ? (
          <>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Bot className="h-3 w-3" />
            </div>
            <span className="font-semibold text-primary">MedBridge AI Assistant</span>
            <span className="text-[10px] rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
              Verified Triage
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">You</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container text-muted-foreground">
              <User className="h-3 w-3" />
            </div>
          </>
        )}
        <span>•</span>
        <span className="text-[11px]">{message.timestamp}</span>
      </div>

      {/* Bubble Box */}
      <div
        className={cn(
          "relative rounded-2xl px-5 py-4 text-sm leading-relaxed max-w-[88%] sm:max-w-[80%] transition-all duration-200",
          isAI
            ? "bg-card border border-border-subtle text-foreground rounded-tl-none shadow-card hover:shadow-card-md"
            : "bg-primary text-primary-foreground rounded-tr-none shadow-md"
        )}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap font-sans">
          {message.text.split("\n").map((line, lIdx) => {
            if (line.startsWith("• ") || line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
              return (
                <p key={lIdx} className="my-1.5 font-semibold">
                  {line}
                </p>
              );
            }
            return <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>{line}</p>;
          })}
        </div>

        {/* AI Action Toolbar */}
        {isAI && (
          <div className="mt-4 pt-3 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Evidence-Based Protocol
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium hover:bg-surface-container hover:text-foreground transition-colors active:scale-95"
                title="Copy Response"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-success font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate(index)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium hover:bg-surface-container hover:text-foreground transition-colors active:scale-95"
                  title="Regenerate Answer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
