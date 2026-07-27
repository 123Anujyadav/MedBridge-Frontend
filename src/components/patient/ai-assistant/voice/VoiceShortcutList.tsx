import React from "react";

interface VoiceShortcutListProps {
  onSelectShortcut: (text: string) => void;
}

export const VOICE_SHORTCUTS = [
  { label: "I have fever", icon: "🩺" },
  { label: "Explain this medicine", icon: "💊" },
  { label: "Analyze my report", icon: "🧪" },
  { label: "Suggest a diet", icon: "🥗" },
  { label: "Exercise plan", icon: "🏃" },
];

export const VoiceShortcutList: React.FC<VoiceShortcutListProps> = ({ onSelectShortcut }) => {
  return (
    <div className="w-full space-y-2 pt-2">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
        Quick Voice Prompts
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {VOICE_SHORTCUTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectShortcut(item.label)}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-container-low px-3 py-1 text-xs font-semibold text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95 shadow-xs"
          >
            <span>{item.icon}</span>
            <span>"{item.label}"</span>
          </button>
        ))}
      </div>
    </div>
  );
};
