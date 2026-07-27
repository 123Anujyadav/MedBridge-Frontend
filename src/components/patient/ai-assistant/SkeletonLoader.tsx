import React from "react";

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full space-y-2.5 animate-pulse">
      <div className="h-4 w-3/4 rounded-md bg-surface-container/70" />
      <div className="h-4 w-full rounded-md bg-surface-container/60" />
      <div className="h-4 w-5/6 rounded-md bg-surface-container/60" />
      <div className="h-4 w-1/2 rounded-md bg-surface-container/50" />
    </div>
  );
};
