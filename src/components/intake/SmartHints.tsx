import React from "react";
import { Lightbulb, Activity, Clock, Zap, Target, Pill, PlusCircle } from "lucide-react";

interface SmartHintItem {
  id: string;
  category: string;
  icon: React.ElementType;
  title: string;
  example: string;
  template: string;
  color: string;
}

const HINTS: SmartHintItem[] = [
  {
    id: "symptoms",
    category: "Symptoms",
    icon: Activity,
    title: "Primary Symptoms",
    example: "e.g. sharp headache, mild fever, nausea",
    template: "I am feeling [symptom name]...",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "duration",
    category: "Duration",
    icon: Clock,
    title: "Onset & Duration",
    example: "e.g. started 3 days ago, worst in morning",
    template: "This started [time period] ago and happens [frequency]...",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "pain",
    category: "Pain",
    icon: Zap,
    title: "Pain Level & Feel",
    example: "e.g. 6/10 dull ache, throbbing sensation",
    template: "The pain feels like [throbbing/sharp/dull] and is about [1-10] out of 10...",
    color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
  {
    id: "triggers",
    category: "Triggers",
    icon: Target,
    title: "Triggers & Factors",
    example: "e.g. worse after eating, relieved by rest",
    template: "It gets worse when [trigger] and feels better when [relief]...",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "tried",
    category: "Anything tried",
    icon: Pill,
    title: "Medications Tried",
    example: "e.g. took Paracetamol 500mg, used ice pack",
    template: "I have already tried taking [medicine name/rest]...",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
];

interface SmartHintsProps {
  onSelectHint?: (templateText: string) => void;
}

export const SmartHints: React.FC<SmartHintsProps> = ({ onSelectHint }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Smart Clinical Hints
            </h3>
            <p className="text-xs text-muted-foreground">
              Helpful details to include in your natural description (Tap to insert prompt)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-surface-container-high px-2.5 py-1 rounded-full border border-border-subtle">
          Optional Guidance
        </span>
      </div>

      {/* Hint Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {HINTS.map((hint) => {
          const Icon = hint.icon;
          return (
            <button
              key={hint.id}
              type="button"
              onClick={() => onSelectHint?.(hint.template)}
              className="group relative flex flex-col justify-between rounded-xl border border-border-subtle bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-surface-container-low hover:shadow-md active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${hint.color}`}>
                    <Icon className="h-3 w-3" />
                    {hint.category}
                  </span>
                  <PlusCircle className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {hint.title}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 italic">
                  {hint.example}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-border-subtle/50 flex items-center justify-between text-[10px] text-primary font-medium">
                <span>Tap to add template</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
