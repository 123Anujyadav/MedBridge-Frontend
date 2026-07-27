import React from "react";
import { ThinkingCard } from "./ThinkingCard";

interface TypingIndicatorProps {
  isThinking: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isThinking }) => {
  if (!isThinking) return null;
  return <ThinkingCard />;
};
