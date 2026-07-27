import React from "react";
import { Mic, Brain, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export type VoiceState = "Idle" | "Listening" | "Recording" | "Processing" | "Thinking" | "Finished";

interface VoiceStatusProps {
  state: VoiceState;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ state }) => {
  const getStatusContent = () => {
    switch (state) {
      case "Listening":
        return {
          icon: <Mic className="h-5 w-5 text-primary animate-pulse" />,
          title: "Listening...",
          subtitle: "Speak naturally into your microphone.",
        };
      case "Recording":
        return {
          icon: <Mic className="h-5 w-5 text-destructive animate-pulse" />,
          title: "Recording...",
          subtitle: "Capturing your medical intake clearly.",
        };
      case "Processing":
        return {
          icon: <Brain className="h-5 w-5 text-tertiary animate-spin" />,
          title: "Converting speech...",
          subtitle: "Please wait while we process your voice.",
        };
      case "Thinking":
        return {
          icon: <Sparkles className="h-5 w-5 text-primary animate-bounce" />,
          title: "Analyzing your voice...",
          subtitle: "Preparing clinical triage response...",
        };
      case "Finished":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-success font-bold" />,
          title: "Voice captured successfully",
          subtitle: "Transcribed query populated in input box.",
        };
      case "Idle":
      default:
        return {
          icon: <Mic className="h-5 w-5 text-muted-foreground" />,
          title: "Tap to Speak",
          subtitle: "Press microphone to begin voice conversation.",
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="flex flex-col items-center text-center space-y-1 my-2">
      <div className="flex items-center gap-2">
        {content.icon}
        <h4 className="font-bold text-base text-foreground tracking-tight">{content.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground font-medium">{content.subtitle}</p>
    </div>
  );
};
