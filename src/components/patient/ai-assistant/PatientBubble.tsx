import React from "react";
import { PatientAvatar } from "./PatientAvatar";
import { MessageTimestamp } from "./MessageTimestamp";
import { useCurrentUserAvatar } from "@/hooks/useAvatar";
import { initialsFrom } from "@/lib/avatar";

interface PatientBubbleProps {
  text: string;
  timestamp: string;
}

export const PatientBubble: React.FC<PatientBubbleProps> = ({ text, timestamp }) => {
  // Reads the shared profile cache, so the chat shows the same photo as the
  // rest of the app the moment it is changed.
  const { avatarUrl, displayName } = useCurrentUserAvatar();

  return (
    <div className="flex flex-col items-end space-y-1 my-3 animate-fade-in">
      <div className="flex items-start gap-2.5 max-w-[70%] flex-row-reverse">
        <PatientAvatar
          initials={initialsFrom(displayName) || "P"}
          avatarUrl={avatarUrl}
        />
        <div className="relative rounded-2xl rounded-tr-none bg-primary px-5 py-3.5 text-sm text-primary-foreground shadow-md font-sans leading-relaxed break-words transition-all duration-200 hover:shadow-lg">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      </div>
      <MessageTimestamp timestamp={timestamp} align="right" />
    </div>
  );
};
