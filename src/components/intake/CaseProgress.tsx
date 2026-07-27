import React from "react";
import { MessageSquareText, Cpu, FileCheck2, Send, Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { id: 1, label: "Describe Symptoms", sublabel: "Voice or Text input", icon: MessageSquareText },
  { id: 2, label: "AI Medical Analysis", sublabel: "Clinical Extraction", icon: Cpu },
  { id: 3, label: "Case Review", sublabel: "Patient Verification", icon: FileCheck2 },
  { id: 4, label: "Sent to Doctor", sublabel: "Clinical Routing", icon: Send },
];

interface CaseProgressProps {
  currentStep?: number; // 1, 2, 3, 4
}

export const CaseProgress: React.FC<CaseProgressProps> = ({ currentStep = 1 }) => {
  return (
    <div className="w-full rounded-2xl bg-card border border-border-subtle p-4 md:p-5 shadow-sm">
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} className="relative flex items-center gap-3.5">
              {/* Connector line for desktop */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden md:block absolute top-1/2 left-[calc(100%-12px)] w-[calc(100%-24px)] h-0.5 -translate-y-1/2 z-0 transition-colors duration-500 ${
                    isCompleted ? "bg-primary" : "bg-border-subtle"
                  }`}
                />
              )}

              {/* Step Circle Badge */}
              <div
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-primary ring-4 ring-primary/20 scale-105"
                    : isCompleted
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-surface-container-high text-muted-foreground border border-border-subtle"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  <Icon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                )}

                {/* Number Badge */}
                <span
                  className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border ${
                    isCurrent
                      ? "bg-foreground text-background border-primary"
                      : isCompleted
                      ? "bg-emerald-700 text-white border-emerald-500"
                      : "bg-muted text-muted-foreground border-border-subtle"
                  }`}
                >
                  {step.id}
                </span>
              </div>

              {/* Step Labels */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold truncate transition-colors ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground font-normal"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
