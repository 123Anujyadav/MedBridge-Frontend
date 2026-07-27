import React from "react";

interface VoiceWaveformProps {
  isRecording?: boolean;
  isProcessing?: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isRecording = true,
  isProcessing = false, }) => {
  const bars = [40, 70, 30, 90, 50, 80, 45, 100, 60, 85, 35, 75, 50, 95, 40];

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 px-4">
      {bars.map((height, idx) => (
        <span
          key={idx}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            isProcessing
              ? "bg-tertiary animate-pulse"
              : isRecording
              ? "bg-destructive animate-bounce"
              : "bg-primary animate-pulse"
          }`}
          style={{
            height: isRecording || isProcessing ? `${Math.max(15, height * 0.6)}%` : "20%",
            animationDelay: `${idx * 0.08}s`,
            animationDuration: isRecording ? "0.6s" : "1.2s",
          }}
        />
      ))}
    </div>
  );
};
