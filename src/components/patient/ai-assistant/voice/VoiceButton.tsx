import React from "react";
import { Mic } from "lucide-react";

interface VoiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <div className="relative group">
      {/* Outer Glowing Pulsing Backdrop */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary opacity-70 blur-xs group-hover:opacity-100 transition duration-300 animate-pulse" />

      {/* Main Floating Circular Action Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Start Voice Conversation"
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-primary-foreground shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Mic className="h-5 w-5 text-white" />
      </button>

      {/* Floating Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-md animate-fade-in pointer-events-none z-30">
        Start Voice Conversation
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  );
};
