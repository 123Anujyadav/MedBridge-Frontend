import React from "react";
import { Plus, Sparkles, ShieldCheck, Stethoscope, Activity, FileText } from "lucide-react";
import { SuggestionChip } from "./SuggestionChip";

interface EmptyConversationProps {
  onSelectSuggestion: (text: string) => void;
}

const CHIPS = [
  { icon: "🩺", label: "I have fever", query: "I have a mild fever since yesterday." },
  { icon: "🤒", label: "I have headache", query: "I've had a persistent headache for 2 days." },
  { icon: "🩸", label: "Explain my blood report", query: "Can you explain how to interpret my CBC blood report?" },
  { icon: "🏃", label: "Exercise plan", query: "Suggest a safe weekly cardiovascular exercise plan." },
  { icon: "🥗", label: "Diet for diabetes", query: "What is a recommended glycemic diet plan for type 2 diabetes?" },
  { icon: "💊", label: "Medicine side effects", query: "What are common side effects of prescription inhalers?" },
];

export const EmptyConversation: React.FC<EmptyConversationProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center my-auto max-w-3xl mx-auto animate-fade-in space-y-8">
      {/* Large AI Illustration */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-primary/10 animate-pulse blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary via-primary/90 to-tertiary text-primary-foreground shadow-primary transition-transform duration-300 hover:scale-105">
          <div className="relative flex items-center justify-center">
            <Plus className="h-10 w-10 stroke-[3]" />
            <Sparkles className="h-5 w-5 absolute -top-2 -right-2 text-white animate-bounce" />
          </div>
        </div>
      </div>

      {/* Heading & Description */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>MedBridge Clinical Telemetry AI</span>
        </div>
        <h2 className="font-headline text-headline-lg font-bold tracking-tight text-foreground sm:text-headline-xl">
          Start a Health Conversation
        </h2>
        <p className="text-body-md text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Describe your symptoms, ask about medicines, diet, reports or exercise.
        </p>
      </div>

      {/* Suggestion Chips */}
      <div className="w-full space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Click a topic to fill the textbox
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {CHIPS.map((chip, idx) => (
            <SuggestionChip
              key={idx}
              icon={chip.icon}
              label={chip.label}
              onClick={() => onSelectSuggestion(chip.query)}
            />
          ))}
        </div>
      </div>

      {/* Feature Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-4 border-t border-border-subtle/50 text-left">
        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card p-3 shadow-sm">
          <Stethoscope className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Symptom Evaluation</p>
            <p className="text-[11px] text-muted-foreground">Evidence-based triage</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card p-3 shadow-sm">
          <Activity className="h-5 w-5 text-secondary shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Lifestyle & Diet</p>
            <p className="text-[11px] text-muted-foreground">Personalized guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card p-3 shadow-sm">
          <FileText className="h-5 w-5 text-tertiary shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Lab & Medicine</p>
            <p className="text-[11px] text-muted-foreground">Report explanations</p>
          </div>
        </div>
      </div>
    </div>
  );
};
