import React from "react";
import { Sparkles, Activity, ShieldCheck } from "lucide-react";

export const MedicalAIAvatar: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center shrink-0">
      {/* Soft Glowing Ambient Backdrop */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-tertiary to-secondary opacity-60 blur-xs animate-pulse" />

      {/* Avatar Container */}
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-secondary to-tertiary text-primary-foreground shadow-md transition-all hover:scale-105">
        <Sparkles className="h-5 w-5 text-white animate-pulse" />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card shadow-xs">
          <ShieldCheck className="h-3 w-3 text-success font-bold" />
        </span>
      </div>
    </div>
  );
};
