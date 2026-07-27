import React from "react";

interface SuggestionChipProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({ icon, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 rounded-xl border border-border-subtle bg-card px-3.5 py-2.5 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-card-md active:scale-95 text-left"
    >
      <span className="text-sm transition-transform duration-200 group-hover:scale-110 shrink-0">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
};
