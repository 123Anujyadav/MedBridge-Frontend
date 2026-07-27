import React from "react";
import { AIAvatar } from "./AIAvatar";
import { ProgressAnimation } from "./ProgressAnimation";
import { ThinkingStage } from "./ThinkingStage";
import { SkeletonMessage } from "./SkeletonMessage";
import { ShieldCheck, Activity, Lock, Cpu } from "lucide-react";

export const ThinkingCard: React.FC = () => {
  return (
    <div className="flex items-start gap-3 my-4 animate-fade-in max-w-[85%] sm:max-w-[75%]">
      {/* AI Avatar with Glowing Pulse */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-pulse blur-md" />
        <AIAvatar />
      </div>

      {/* Main Thinking Card Box */}
      <div className="relative rounded-2xl rounded-tl-none border border-border-subtle bg-card p-5 shadow-card space-y-4 w-full transition-all duration-300">
        {/* Header & Status Badges */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Analyzing your health question</span>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>

            {/* Visual Status Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                <Cpu className="h-3 w-3" />
                Medical AI
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                <ShieldCheck className="h-3 w-3" />
                Evidence Based
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                <Lock className="h-3 w-3" />
                Secure Analysis
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary animate-pulse">
                Live Processing
              </span>
            </div>
          </div>

          {/* Continuous Progress Bar (No percentage) */}
          <ProgressAnimation />
        </div>

        {/* Dynamic Thinking Stage & Timeline */}
        <ThinkingStage />

        {/* Shimmer Skeleton Placeholder Message */}
        <SkeletonMessage />
      </div>
    </div>
  );
};
