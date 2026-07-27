import React from "react";

export const SkeletonMessage: React.FC = () => {
  return (
    <div className="w-full space-y-3 animate-pulse pt-2">
      {/* Title Skeleton */}
      <div className="h-4 w-1/3 rounded-md bg-surface-container/80" />

      {/* Paragraph Skeleton Lines */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-surface-container/60" />
        <div className="h-3.5 w-11/12 rounded bg-surface-container/60" />
        <div className="h-3.5 w-4/5 rounded bg-surface-container/60" />
      </div>

      {/* Card Skeleton Placeholder */}
      <div className="rounded-xl border border-border-subtle/50 bg-surface-container-low p-3 space-y-2">
        <div className="h-3 w-1/2 rounded bg-surface-container/70" />
        <div className="h-3 w-3/4 rounded bg-surface-container/50" />
      </div>

      {/* Suggestion / Tag Skeleton */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-5 w-20 rounded-full bg-surface-container/70" />
        <div className="h-5 w-24 rounded-full bg-surface-container/70" />
      </div>
    </div>
  );
};
