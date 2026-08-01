import React from "react";
import { Mic, Type, Sparkles, Globe2, Eraser, Check, Info } from "lucide-react";
import { VoiceRecorderCard } from "./VoiceRecorderCard";
import { SmartHints } from "./SmartHints";

interface SymptomInputCardProps {
  inputMode: "voice" | "text";
  setInputMode: (mode: "voice" | "text") => void;
  symptomText: string;
  setSymptomText: (text: string) => void;
  onGenerateCase: () => void;
  isProcessing: boolean;
  /**
   * The intake agent's outstanding follow-up question, when it has one.
   *
   * The agent is a conversation: it asks up to `MAX_FOLLOWUP_ROUNDS` clarifying
   * questions before it will produce a case, and it will not guess an answer it
   * was not given. When this is set the patient is answering that question
   * rather than opening a new description, so the card says so and the action
   * changes accordingly. Absent, the card behaves exactly as before.
   */
  pendingQuestion?: string | null;
}

const MULTILINGUAL_EXAMPLES = [
  { text: `"I have had fever for three days."`, lang: "English" },
  { text: `"My stomach hurts after eating."`, lang: "English" },
  { text: `"Mujhe kal raat se chest pain ho raha hai."`, lang: "Hinglish" },
  { text: `"मुझे सांस लेने में तकलीफ हो रही है।"`, lang: "Hindi" },
  { text: `"আমার মাথা ব্যথা করছে।"`, lang: "Bengali" },
];

export const SymptomInputCard: React.FC<SymptomInputCardProps> = ({
  inputMode,
  setInputMode,
  symptomText,
  setSymptomText,
  onGenerateCase,
  isProcessing,
  pendingQuestion = null,
}) => {
  const isAnswering = Boolean(pendingQuestion?.trim());

  const handleSelectExample = (exampleText: string) => {
    // strip quotation marks
    const cleanText = exampleText.replace(/^"|"$/g, "");
    if (symptomText.trim()) {
      setSymptomText(`${symptomText.trim()} ${cleanText}`);
    } else {
      setSymptomText(cleanText);
    }
  };

  const handleSelectHintTemplate = (template: string) => {
    if (symptomText.trim()) {
      setSymptomText(`${symptomText.trim()}\n${template}`);
    } else {
      setSymptomText(template);
    }
  };

  return (
    <div className="rounded-3xl border border-border-subtle bg-card p-6 md:p-8 shadow-card space-y-6 transition-all">
      {/* Input Mode Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h2 className="font-headline text-xl md:text-2xl font-bold text-foreground">
            Tell us what you're experiencing
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            You can type or speak in any language. Write naturally. There is no need to use medical terms.
          </p>
        </div>

        {/* Input Mode Switch Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container-high border border-border-subtle shrink-0">
          <button
            type="button"
            onClick={() => setInputMode("voice")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              inputMode === "voice"
                ? "bg-primary text-primary-foreground shadow-md scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Mic className="h-4 w-4" />
            Voice First
          </button>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              inputMode === "text"
                ? "bg-primary text-primary-foreground shadow-md scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Type className="h-4 w-4" />
            Type Text
          </button>
        </div>
      </div>

      {/* Multilingual Support Banner & Examples */}
      <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Multilingual Examples (Click to Insert)
            </span>
          </div>
          <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            50+ Languages Supported
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {MULTILINGUAL_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectExample(ex.text)}
              className="group flex items-center gap-1.5 rounded-xl border border-border-subtle bg-card px-3 py-1.5 text-xs text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-95 text-left"
            >
              <span className="font-medium text-foreground">{ex.text}</span>
              <span className="text-[10px] text-muted-foreground group-hover:text-primary">
                ({ex.lang})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The agent's outstanding question, when it is waiting on an answer. */}
      {isAnswering && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>One more thing before your case is ready</span>
          </div>
          <p className="text-sm md:text-base font-semibold leading-relaxed text-foreground">
            {pendingQuestion}
          </p>
          <p className="text-xs text-muted-foreground">
            Answer below in your own words. If you are not sure, say so — nothing
            will be assumed on your behalf.
          </p>
        </div>
      )}

      {/* Main Input Component: Voice vs Text */}
      {inputMode === "voice" ? (
        <VoiceRecorderCard
          symptomText={symptomText}
          onTranscriptUpdate={(newText) => setSymptomText(newText)}
          onClearTranscript={() => setSymptomText("")}
          isProcessing={isProcessing}
          onGenerateCase={onGenerateCase}
        />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder="Describe what you are feeling in your own words... (e.g. 'I've had severe chest pressure since yesterday evening, especially when walking fast...')"
              className="w-full resize-y rounded-2xl border border-border-subtle bg-card p-4 md:p-5 text-sm md:text-base leading-relaxed text-foreground transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/60 shadow-inner min-h-[180px]"
              rows={6}
            />
            {symptomText && (
              <button
                type="button"
                onClick={() => setSymptomText("")}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-surface-container-high text-muted-foreground hover:text-foreground hover:bg-surface-container-highest transition-colors"
                title="Clear input"
              >
                <Eraser className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-primary" />
              Write naturally — AI extracts symptoms, duration, and urgency automatically.
            </span>
            <span className="font-mono font-medium">{symptomText.length} characters</span>
          </div>
        </div>
      )}

      {/* Smart Guidance Cards */}
      <div className="pt-2">
        <SmartHints onSelectHint={handleSelectHintTemplate} />
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Next Step:</span>{" "}
          {isAnswering
            ? "Your answer goes back to the AI, which will complete your case."
            : "AI will structure your case & route it to your doctor."}
        </div>

        <button
          type="button"
          onClick={onGenerateCase}
          disabled={!symptomText.trim() || isProcessing}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 font-headline text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="h-5 w-5" />
          <span>
            {isProcessing
              ? isAnswering
                ? "Sending Answer..."
                : "Generating Case..."
              : isAnswering
                ? "Send Answer"
                : "Generate Medical Case"}
          </span>
        </button>
      </div>
    </div>
  );
};
