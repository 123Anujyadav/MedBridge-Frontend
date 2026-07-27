import React from "react";
import { Paperclip, RotateCcw } from "lucide-react";
import { VoiceButton } from "../voice/VoiceButton";
import { CharacterCounter } from "./CharacterCounter";
import { SendButton } from "./SendButton";

interface InputToolbarProps {
  value: string;
  onClear: () => void;
  onSend: () => void;
  onOpenVoiceModal: () => void;
  onAttachClick: () => void;
  disabled?: boolean;
  isThinking?: boolean;
  onStopGeneration?: () => void;
}

export const InputToolbar: React.FC<InputToolbarProps> = ({
  value,
  onClear,
  onSend,
  onOpenVoiceModal,
  onAttachClick,
  disabled = false,
  isThinking = false,
  onStopGeneration,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/50 px-2">
      {/* Left Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Attach Report Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={onAttachClick}
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-container-low text-muted-foreground transition-all duration-200 hover:bg-surface-container hover:text-foreground active:scale-95 disabled:opacity-50"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-semibold text-background shadow-md animate-fade-in pointer-events-none z-30">
            Upload medical report
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground" />
          </div>
        </div>

        {/* Voice Button */}
        <VoiceButton onClick={onOpenVoiceModal} disabled={disabled} />
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Clear Button (Only visible when text is typed) */}
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-surface-container hover:text-destructive transition-colors"
            title="Clear text"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {/* Character Counter */}
        <CharacterCounter currentLength={value.length} maxLength={1000} />

        {/* Send Button */}
        <SendButton
          onSend={onSend}
          disabled={!value.trim() || disabled}
          isThinking={isThinking}
          onStopGeneration={onStopGeneration}
        />
      </div>
    </div>
  );
};
