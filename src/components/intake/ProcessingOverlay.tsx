import React, { useEffect, useState } from "react";
import { Brain, CheckCircle2, Loader2, Sparkles, Stethoscope, FileText, Cpu } from "lucide-react";

interface ProcessingStep {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 1, label: "AI Processing", sublabel: "Parsing natural language input...", icon: Cpu },
  { id: 2, label: "Generating Clinical Summary", sublabel: "Structuring chief complaint & history...", icon: Sparkles },
  { id: 3, label: "Extracting Symptoms", sublabel: "Identifying primary & secondary symptoms...", icon: Stethoscope },
  { id: 4, label: "Identifying Duration", sublabel: "Mapping timeline, onset & severity...", icon: Brain },
  { id: 5, label: "Preparing Doctor Report", sublabel: "Building clinical case overview for physician...", icon: FileText },
  { id: 6, label: "Medical Case Ready", sublabel: "Case initialized successfully", icon: CheckCircle2 },
];

interface ProcessingOverlayProps {
  onComplete: () => void;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ onComplete }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-lg p-4 animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-primary/20 bg-card p-6 md:p-8 shadow-2xl shadow-primary/10 overflow-hidden space-y-6">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse">
            <Brain className="h-8 w-8" />
          </div>
          <h2 className="font-headline text-2xl font-bold text-foreground">
            Building Your Medical Case
          </h2>
          <p className="text-sm text-muted-foreground">
            Our Clinical AI is organizing your description into a structured doctor-ready case report.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary via-accent to-emerald-500 h-full transition-all duration-500 ease-out"
            style={{
              width: `${((activeStepIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Stepper list */}
        <div className="space-y-3">
          {PROCESSING_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? "border-primary/40 bg-primary/5 shadow-sm ring-2 ring-primary/10"
                    : isCompleted
                    ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                    : "border-border-subtle/50 bg-card opacity-40"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-surface-container-high text-muted-foreground"
                    }`}
                  >
                    {isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        isCurrent
                          ? "text-primary font-bold"
                          : isCompleted
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.sublabel}</p>
                  </div>
                </div>

                {isCompleted && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full animate-pulse">
                    In Progress...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
