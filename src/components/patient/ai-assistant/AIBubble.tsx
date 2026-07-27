import React from "react";
import { AIAvatar } from "./AIAvatar";
import { MessageTimestamp } from "./MessageTimestamp";
import { MessageToolbar } from "./MessageToolbar";
import { StructuredAIResponse, type AIResponseData } from "./cards/StructuredAIResponse";

interface AIBubbleProps {
  text: string;
  timestamp: string;
  structuredData?: AIResponseData;
  onRegenerate?: () => void;
  onSelectFollowUp?: (questionText: string) => void;
  onNewQuestion?: () => void;
}

export const AIBubble: React.FC<AIBubbleProps> = ({
  text,
  timestamp,
  structuredData,
  onRegenerate,
  onSelectFollowUp,
  onNewQuestion,
}) => {
  return (
    <div className="flex flex-col items-start space-y-1 my-4 animate-fade-in">
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[78%] w-full">
        <AIAvatar />

        <div className="relative rounded-2xl rounded-tl-none border border-border-subtle bg-card p-5 text-sm text-foreground shadow-card font-sans leading-relaxed break-words transition-all duration-200 hover:shadow-card-md w-full">
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border-subtle/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">MedBridge AI Medical Assistant</span>
              <span className="text-[10px] rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                Clinical Triage
              </span>
            </div>
          </div>

          {/* Render Structured Cards if available, else render formatted Markdown */}
          {structuredData ? (
            <StructuredAIResponse
              data={structuredData}
              rawText={text}
              onSelectFollowUp={onSelectFollowUp || (() => {})}
              onNewQuestion={onNewQuestion}
            />
          ) : (
            <>
              <div className="space-y-2 font-sans">
                {text.split("\n").map((line, lIdx) => {
                  if (line.startsWith("# ") || line.startsWith("## ")) {
                    return (
                      <h3 key={lIdx} className="font-headline font-bold text-base text-foreground mt-3 mb-1">
                        {line.replace(/^#+\s*/, "")}
                      </h3>
                    );
                  }
                  if (
                    line.startsWith("• ") ||
                    line.startsWith("1. ") ||
                    line.startsWith("2. ") ||
                    line.startsWith("3. ")
                  ) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 my-1 font-medium text-foreground/90">
                        <span className="text-primary font-bold">{line.split(" ")[0]}</span>
                        <span>{line.substring(line.indexOf(" ") + 1)}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Action Buttons Toolbar */}
              <MessageToolbar textToCopy={text} onRegenerate={onRegenerate} />
            </>
          )}
        </div>
      </div>
      <MessageTimestamp timestamp={timestamp} align="left" />
    </div>
  );
};
