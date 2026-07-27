import React from "react";

interface MessageTimestampProps {
  timestamp: string;
  align?: "left" | "right";
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({ timestamp, align = "left" }) => {
  return (
    <span
      className={`text-[11px] font-medium text-muted-foreground mt-1 px-1 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {timestamp}
    </span>
  );
};
