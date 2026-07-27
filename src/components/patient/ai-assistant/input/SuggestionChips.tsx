import React from "react";

interface SuggestionChipsProps {
  onSelectChip: (chipText: string) => void;
}

export const INPUT_SUGGESTION_CHIPS = [
  { label: "Symptom Check", icon: "🩺", text: "I have fever and headache for two days." },
  { label: "Medicine Info", icon: "💊", text: "Can I take Paracetamol for body ache?" },
  { label: "Diet Plan", icon: "🥗", text: "Suggest a healthy glycemic diet plan." },
  { label: "Exercise Plan", icon: "🏃", text: "Recommend a daily exercise routine for cardiovascular health." },
  { label: "Analyze Report", icon: "🧪", text: "Explain my CBC blood report results." },
  { label: "Find Doctor", icon: "👨‍⚕", text: "Which specialist should I consult for severe back pain?" },
  { label: "Heart Health", icon: "❤️", text: "How to manage high blood pressure naturally?" },
  { label: "Mental Health", icon: "🧠", text: "Tips for managing anxiety and daily stress." },
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelectChip }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar no-scrollbar scroll-smooth">
      {INPUT_SUGGESTION_CHIPS.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectChip(chip.text)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-subtle bg-surface-container-low px-3 py-1 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95 shadow-xs"
        >
          <span>{chip.icon}</span>
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
};
