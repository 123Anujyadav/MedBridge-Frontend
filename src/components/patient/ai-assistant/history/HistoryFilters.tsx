import React from "react";

export const FILTER_OPTIONS = [
  "All",
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "Symptoms",
  "Medicines",
  "Reports",
  "Diet",
  "Exercise",
  "Heart Health",
  "Diabetes",
  "Mental Health",
  "Favorites",
  "Pinned",
];

interface HistoryFiltersProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
      {FILTER_OPTIONS.map((filter, idx) => {
        const isSelected = selectedFilter === filter;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectFilter(filter)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 shadow-xs active:scale-95 ${
              isSelected
                ? "bg-primary text-primary-foreground border border-primary"
                : "border border-border-subtle bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
};
