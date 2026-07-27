import React, { useRef, useEffect } from "react";
import { type MessageType } from "./ChatMessage";
import { PatientBubble } from "./PatientBubble";
import { AIBubble } from "./AIBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyConversation } from "./EmptyConversation";
import { DateDivider } from "./DateDivider";

interface ChatContainerProps {
  messages: MessageType[];
  isThinking: boolean;
  onSelectSuggestion: (text: string) => void;
  onRegenerateMessage?: (index: number) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isThinking,
  onSelectSuggestion,
  onRegenerateMessage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Conversation messages history"
      className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar focus:outline-none focus:ring-1 focus:ring-primary/20 rounded-t-2xl bg-card"
    >
      {messages.length === 0 ? (
        <EmptyConversation onSelectSuggestion={onSelectSuggestion} />
      ) : (
        <>
          <DateDivider label="Today" />
          {messages.map((msg, idx) =>
            msg.sender === "user" ? (
              <PatientBubble key={msg.id} text={msg.text} timestamp={msg.timestamp} />
            ) : (
              <AIBubble
                key={msg.id}
                text={msg.text}
                timestamp={msg.timestamp}
                structuredData={msg.structuredData}
                onRegenerate={onRegenerateMessage ? () => onRegenerateMessage(idx) : undefined}
                onSelectFollowUp={onSelectSuggestion}
              />
            )
          )}

          {/* Typing Indicator & Skeleton Loader */}
          {isThinking && <TypingIndicator isThinking={isThinking} />}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
