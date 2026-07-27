import React from "react";

interface VoiceTimerProps {
  seconds: number;
  isRecording?: boolean;
}

export const VoiceTimer: React.FC<VoiceTimerProps> = ({ seconds, isRecording = true }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2 rounded-full bg-surface-container px-3.5 py-1 text-xs font-mono font-bold text-foreground border border-border-subtle shadow-xs">
      {isRecording && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
        </span>
      )}
      <span>{formatted}</span>
    </div>
  );
};
