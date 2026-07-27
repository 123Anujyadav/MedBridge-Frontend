import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, X, Check, Sparkles, AlertCircle } from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";
import { VoiceTimer } from "./VoiceTimer";
import { VoiceStatus, type VoiceState } from "./VoiceStatus";
import { VoiceTips } from "./VoiceTips";
import { VoiceShortcutList } from "./VoiceShortcutList";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptCaptured: (text: string) => void;
}

/**
 * Captures the patient's spoken symptoms with the browser's Speech Recognition
 * API — the same mechanism the intake recorder uses.
 *
 * This panel previously ran a timer animation and then emitted a fixed string
 * ("I have a fever and headache since yesterday.") no matter what was said. In
 * a clinical tool that is worse than having no voice input at all: it puts
 * words the patient never spoke into their own medical conversation, where they
 * go on to drive symptom extraction, urgency and specialist routing. Nothing is
 * emitted here now unless the speech engine actually returned it.
 */
export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onTranscriptCaptured,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>("Listening");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState("");

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closingRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Hand back whatever was actually heard, or report that nothing was. */
  const finish = useCallback(() => {
    stopTimer();
    const text = transcriptRef.current.trim();
    if (!text) {
      setVoiceState("Listening");
      setError("No speech was detected. Please try again or type instead.");
      return;
    }
    setVoiceState("Finished");
    onTranscriptCaptured(text);
    closingRef.current = setTimeout(() => onClose(), 1200);
  }, [onClose, onTranscriptCaptured, stopTimer]);

  useEffect(() => {
    if (!isOpen) return;

    setVoiceState("Listening");
    setSeconds(0);
    setError(null);
    setInterim("");
    transcriptRef.current = "";

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Please type your question instead."
      );
      return;
    }

    let recognition: any;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setVoiceState("Recording");
        stopTimer();
        timerRef.current = setInterval(
          () => setSeconds((prev) => prev + 1),
          1000
        );
      };

      recognition.onresult = (event: any) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }
        setInterim(interimText);
        if (finalText.trim()) {
          transcriptRef.current = `${transcriptRef.current} ${finalText.trim()}`.trim();
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "no-speech") return;
        stopTimer();
        setVoiceState("Listening");
        setError(
          event.error === "not-allowed" || event.error === "permission-denied"
            ? "Microphone access was denied. Enable it in your browser settings, or type instead."
            : `Voice capture failed (${event.error}). Please type your question instead.`
        );
      };

      recognition.onend = () => {
        stopTimer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setError("Voice capture could not be started. Please type your question instead.");
    }

    return () => {
      stopTimer();
      if (closingRef.current) clearTimeout(closingRef.current);
      try {
        recognition?.stop();
      } catch {
        /* recognition was never started */
      }
      recognitionRef.current = null;
    };
  }, [isOpen, stopTimer]);

  if (!isOpen) return null;

  const handleStopRecording = () => {
    setVoiceState("Processing");
    setInterim("");
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    // Let any in-flight final result arrive before reading the transcript.
    setTimeout(finish, 400);
  };

  const handleSelectShortcut = (promptText: string) => {
    onTranscriptCaptured(promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border-subtle bg-card p-6 shadow-2xl space-y-5 transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-container text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Large Central Microphone Visualizer Container */}
        <div className="flex flex-col items-center justify-center pt-2 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Glowing Pulse Rings */}
            <div
              className={`absolute -inset-4 rounded-full transition-all duration-500 ${
                voiceState === "Recording"
                  ? "bg-destructive/20 animate-ping"
                  : voiceState === "Thinking"
                  ? "bg-primary/20 animate-pulse"
                  : "bg-primary/10 animate-pulse"
              }`}
            />
            <div
              className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                voiceState === "Recording"
                  ? "bg-gradient-to-tr from-destructive to-warning text-white"
                  : "bg-gradient-to-tr from-primary via-secondary to-tertiary text-primary-foreground"
              }`}
            >
              {voiceState === "Finished" ? (
                <Check className="h-10 w-10 text-white animate-bounce" />
              ) : voiceState === "Thinking" ? (
                <Sparkles className="h-10 w-10 text-white animate-spin" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </div>
          </div>

          {/* Recording Timer Badge */}
          <VoiceTimer seconds={seconds} isRecording={voiceState === "Recording"} />

          {/* Dynamic Voice Status */}
          <VoiceStatus state={voiceState} />
        </div>

        {/* Continuous Animated Waveform Visualizer */}
        <VoiceWaveform
          isRecording={voiceState === "Recording" || voiceState === "Listening"}
          isProcessing={voiceState === "Processing" || voiceState === "Thinking"}
        />

        {/* Live transcript, so the patient can see what is actually captured */}
        {(interim || transcriptRef.current) && (
          <div className="rounded-xl border border-border-subtle bg-surface-container p-3">
            <p className="text-xs font-medium text-foreground">
              {transcriptRef.current}
              {interim && (
                <span className="text-muted-foreground"> {interim}</span>
              )}
            </p>
          </div>
        )}

        {/* Capture problems are stated plainly rather than silently substituted */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Voice Tips */}
        <VoiceTips />

        {/* Voice Shortcut Prompt Chips */}
        <VoiceShortcutList onSelectShortcut={handleSelectShortcut} />

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {voiceState === "Listening" || voiceState === "Recording" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border-subtle bg-surface-container py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStopRecording}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-destructive/90 active:scale-95"
              >
                <Square className="h-3.5 w-3.5 fill-white" />
                <span>Stop Recording</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-primary transition-all hover:opacity-90 active:scale-95"
            >
              Close Voice Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
