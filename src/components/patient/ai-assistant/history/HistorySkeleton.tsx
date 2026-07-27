import React from "react";

export const HistorySkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse p-1">
      <div className="h-9 w-full rounded-xl bg-surface-container/70" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-surface-container/60" />
        <div className="h-6 w-20 rounded-full bg-surface-container/60" />
        <div className="h-6 w-16 rounded-full bg-surface-container/60" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-20 w-full rounded-2xl bg-surface-container-low border border-border-subtle/50" />
        <div className="h-20 w-full rounded-2xl bg-surface-container-low border border-border-subtle/50" />
        <div className="h-20 w-full rounded-2xl bg-surface-container-low border border-border-subtle/50" />
      </div>
    </div>
  );
};
