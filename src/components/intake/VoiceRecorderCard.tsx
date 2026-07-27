import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, AlertCircle, RefreshCw, Sparkles, AudioWaveform, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderCardProps {
  symptomText: string;
  onTranscriptUpdate: (newText: string) => void;
  onClearTranscript: () => void;
  isProcessing?: boolean;
  onGenerateCase?: () => void;
}

export const VoiceRecorderCard: React.FC<VoiceRecorderCardProps> = ({
  symptomText,
  onTranscriptUpdate,
  onClearTranscript,
  isProcessing = false,
  onGenerateCase,
}) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = () => {
    setMicError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      toast({
        variant: "destructive",
        title: "Voice Input Unavailable",
        description: "Browser Speech Recognition is not supported. Please type your symptoms below.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
        toast({
          title: "Microphone Active",
          description: "Speak naturally in your preferred language...",
        });
      };

      recognition.onresult = (event: any) => {
        let finalTrans = "";
        let interimTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interimTrans);

        if (finalTrans.trim()) {
          onTranscriptUpdate(
            symptomText ? `${symptomText.trim()} ${finalTrans.trim()}` : finalTrans.trim()
          );
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setMicError("Microphone access denied. Please grant permission in browser settings.");
          toast({
            variant: "destructive",
            title: "Microphone Permission Required",
            description: "Please enable microphone permission in your browser to speak.",
          });
        } else if (event.error !== "no-speech") {
          setMicError(`Voice error: ${event.error}`);
        }
        stopRecording();
      };

      recognition.onend = () => {
        stopRecording();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Mic initialization error:", err);
      setMicError("Failed to access microphone.");
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
      toast({
        title: "Recording Saved",
        description: "Your voice transcript has been added to the case.",
      });
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-card via-surface-container-low/40 to-card p-6 md:p-8 shadow-sm">
      {/* Background Pulse Aura */}
      {isListening && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="flex flex-col items-center justify-center text-center space-y-5">
        {/* Error Alert */}
        {micError && (
          <div className="w-full flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              onClick={() => setMicError(null)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Large Prominent Voice Microphone Button */}
        <div className="relative my-2">
          {/* Animated Wave Rings when listening */}
          {isListening && (
            <>
              <span className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping opacity-75" />
              <span className="absolute -inset-8 rounded-full bg-red-500/10 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={toggleRecording}
            className={`relative z-10 flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isListening
                ? "bg-red-600 text-white ring-8 ring-red-500/20 animate-pulse"
                : "bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-primary hover:shadow-xl ring-4 ring-primary/20"
            }`}
          >
            {isListening ? (
              <MicOff className="h-12 w-12 md:h-14 md:w-14" />
            ) : (
              <Mic className="h-12 w-12 md:h-14 md:w-14" />
            )}
          </button>
        </div>

        {/* Recording Status & Timer */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isListening ? "bg-red-500 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span className="font-headline text-lg font-bold text-foreground">
              {isListening ? "Listening to Your Voice..." : "Tap Microphone to Speak"}
            </span>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
            {isListening
              ? `Recording in progress (${formatTimer(recordingSeconds)}). Speak naturally in any language.`
              : "Voice-first intake. Speak as if talking directly to your doctor."}
          </p>
        </div>

        {/* Audio Waveform Graphic Mock */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 h-8 px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <AudioWaveform className="h-5 w-5 text-red-500 animate-pulse" />
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-red-500 h-2 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 bg-red-500 h-4 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 bg-red-500 h-3 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="w-1 bg-red-500 h-5 animate-bounce" style={{ animationDelay: "100ms" }} />
              <span className="w-1 bg-red-500 h-2 animate-bounce" style={{ animationDelay: "200ms" }} />
            </div>
            <span className="text-xs font-mono text-red-600 font-bold ml-2">
              {formatTimer(recordingSeconds)}
            </span>
          </div>
        )}

        {/* Live Transcript Box */}
        <div className="w-full text-left space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              Live Voice Transcript
            </label>
            {symptomText.trim() && (
              <button
                type="button"
                onClick={onClearTranscript}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium"
              >
                <RefreshCw className="h-3 w-3" /> Clear Transcript
              </button>
            )}
          </div>

          <div className="min-h-[90px] w-full rounded-2xl border border-border-subtle bg-card/80 p-4 text-sm text-foreground shadow-inner">
            {symptomText.trim() || interimTranscript ? (
              <p className="whitespace-pre-wrap leading-relaxed font-body">
                {symptomText}
                {interimTranscript && (
                  <span className="text-primary italic font-medium ml-1">
                    {interimTranscript}...
                  </span>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground italic text-xs md:text-sm">
                Your spoken words will automatically convert into medical transcript here...
              </p>
            )}
          </div>
        </div>

        {/* Quick Action Button for Voice Mode */}
        {symptomText.trim() && (
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={onGenerateCase}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isProcessing ? "Processing Medical Case..." : "Generate Medical Case"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
