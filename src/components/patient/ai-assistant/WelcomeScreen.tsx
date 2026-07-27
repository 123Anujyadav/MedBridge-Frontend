import React from "react";
import { Sparkles, CheckCircle2, Bot, ShieldCheck } from "lucide-react";
import { SuggestionChip } from "./SuggestionChip";

interface WelcomeScreenProps {
  onSelectSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  { icon: "🩺", label: "I have fever", query: "I have a mild fever since yesterday." },
  { icon: "🤧", label: "I have cough", query: "I have a dry cough and throat irritation." },
  { icon: "🤒", label: "Headache for 3 days", query: "I've had a persistent headache for 3 days." },
  { icon: "💊", label: "Explain my medicine", query: "Can you explain how to take my prescribed medications?" },
  { icon: "🩸", label: "Explain blood report", query: "How do I interpret my complete blood count (CBC) report?" },
  { icon: "🥗", label: "Diet for diabetes", query: "What is a recommended glycemic diet plan for type 2 diabetes?" },
  { icon: "🏃", label: "Exercise plan", query: "Suggest a safe weekly cardiovascular exercise plan." },
  { icon: "❤️", label: "High blood pressure", query: "What lifestyle changes help manage high blood pressure?" },
  { icon: "🫀", label: "Heart disease", query: "What are early symptoms of cardiovascular stress?" },
  { icon: "🧠", label: "Mental health", query: "What are effective daily strategies for anxiety management?" },
];

const CAPABILITIES = [
  "Symptom Analysis",
  "Medicine Information",
  "Diet Recommendation",
  "Exercise Guidance",
  "Medical Report Analysis",
  "Doctor Recommendation",
  "Emergency Guidance",
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center my-auto max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-primary transition-transform duration-300 hover:scale-105">
            <Sparkles className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <Bot className="h-3.5 w-3.5" />
            <span>AI Clinical Assistant V2.4</span>
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
          </div>
          <h2 className="font-headline text-headline-lg font-bold tracking-tight text-foreground sm:text-headline-xl">
            Hello 👋 <br />
            <span className="text-primary">I'm MedBridge AI Medical Assistant</span>
          </h2>
          <p className="text-body-md text-muted-foreground max-w-xl mx-auto leading-relaxed">
            I can help you understand symptoms, explain medicines, analyze reports, recommend healthy lifestyle changes, and guide you to the right doctor.
          </p>
        </div>
      </div>

      {/* Suggestion Chips Section */}
      <div className="w-full space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Click a topic to populate your query
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {SUGGESTIONS.map((s, idx) => (
            <SuggestionChip
              key={idx}
              icon={s.icon}
              label={s.label}
              onClick={() => onSelectSuggestion(s.query)}
            />
          ))}
        </div>
      </div>

      {/* Capabilities Cards Grid */}
      <div className="w-full pt-4 border-t border-border-subtle/50">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          AI Clinical Assistant Capabilities
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {CAPABILITIES.map((cap, cIdx) => (
            <div
              key={cIdx}
              className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs font-semibold text-foreground/80 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{cap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
