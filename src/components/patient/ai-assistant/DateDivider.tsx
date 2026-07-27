import React from "react";

interface DateDividerProps {
  label: string;
}

export const DateDivider: React.FC<DateDividerProps> = ({ label }) => {
  return (
    <div className="flex items-center gap-4 my-6 my-auto">
      <div className="h-px flex-1 bg-border-subtle/60" />
      <span className="rounded-full border border-border-subtle bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shadow-sm">
        {label}
      </span>
      <div className="h-px flex-1 bg-border-subtle/60" />
    </div>
  );
};
