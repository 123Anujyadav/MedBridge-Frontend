import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full space-y-2 animate-pulse py-1">
      <div className="h-3.5 w-3/4 rounded bg-surface-container/70" />
      <div className="h-3 w-full rounded bg-surface-container/50" />
      <div className="h-3 w-5/6 rounded bg-surface-container/50" />
    </div>
  );
};
