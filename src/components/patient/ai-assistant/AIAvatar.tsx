import React from "react";
import { Plus, Sparkles } from "lucide-react";

interface AIAvatarProps {
  className?: string;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ className = "" }) => {
  return (
    <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center ${className}`}>
      {/* Gradient Circle Container */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-primary/90 to-tertiary text-primary-foreground shadow-md">
        <div className="relative flex items-center justify-center">
          <Plus className="h-4 w-4 stroke-[3]" />
          <Sparkles className="h-2.5 w-2.5 absolute -top-1 -right-1 text-white animate-pulse" />
        </div>
      </div>
      {/* Online Status Indicator Dot */}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
    </div>
  );
};
