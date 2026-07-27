import React from "react";

export const ProgressAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-1.5 overflow-hidden rounded-full bg-surface-container-low border border-border-subtle/50">
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-primary/20 via-primary to-tertiary animate-pulse rounded-full" />
      <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
};
