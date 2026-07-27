import React from "react";

interface CharacterCounterProps {
  currentLength: number;
  maxLength?: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  currentLength,
  maxLength = 1000,
}) => {
  const isNearLimit = currentLength > maxLength * 0.85;

  return (
    <span
      className={`text-[10px] font-mono font-medium transition-colors ${
        isNearLimit ? "text-warning font-bold" : "text-muted-foreground"
      }`}
    >
      {currentLength}/{maxLength}
    </span>
  );
};
