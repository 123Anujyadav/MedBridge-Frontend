import React, { useState } from "react";
import { Sparkles, AlertTriangle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ScrollReveal from "./effects/ScrollReveal";

const SYMPTOM_OPTIONS = [
  "Sweating / nausea",
  "Pain radiating to left arm",
  "Dizziness",
];

type ChatMessage = { sender: "user" | "ai"; text: string };

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    sender: "user",
    text: "I'm experiencing sudden chest pain and shortness of breath",
  },
  {
    sender: "ai",
    text: "Analyzing symptoms... I have noted chest pain and dyspnea. Are you also experiencing any of the following?",
  },
];

export default function HomeAIAssistant() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [userCustomInput, setUserCustomInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCustomInput.trim() && selectedSymptoms.length === 0) return;

    const addedText =
      userCustomInput.trim() || `Selected symptoms: ${selectedSymptoms.join(", ")}`;
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: addedText },
      {
        sender: "ai",
        text: "Triage Alert: High urgency flag registered. Updating clinical summary and connecting nearest emergency service provider.",
      },
    ]);
    setUserCustomInput("");
  };

  return (
    <section id="ai-assistant" className="py-20 lg:py-24 bg-white border-t border-slate-200/70 relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-100/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Diagnosis Interface
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Empowering doctors with real-time AI-assisted decision support system.
          </p>
        </ScrollReveal>

        {/* Interactive Chat UI Card */}
        <ScrollReveal className="max-w-4xl mx-auto relative" delay={0.1}>
          {/* Radial AI Glow backdrop */}
          <div className="absolute -inset-3 bg-emerald-500/10 rounded-3xl blur-2xl pointer-events-none" />

          <div
            className="relative rounded-2xl overflow-hidden border border-emerald-700/60 text-white shadow-2xl scan-line-container gradient-border-always"
            style={{
              background: "linear-gradient(135deg, #043927 0%, #064e3b 50%, #065f46 100%)",
              boxShadow: "0 25px 60px -12px rgba(6,78,59,0.4), 0 0 0 1px rgba(16,185,129,0.15), inset 0 1px 0 rgba(16,185,129,0.1)",
            }}
          >
            {/* Holographic shimmer */}
            <div className="holo-shimmer absolute inset-0 pointer-events-none z-0" />

            {/* Header bar */}
            <div className="bg-[#043927]/80 px-6 py-4 flex items-center justify-between border-b border-emerald-800 backdrop-blur-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 glow-ring">
                  <Sparkles className="w-4 h-4 float-icon" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">MedBridge AI Assistant</h4>
                  <p className="text-[11px] text-emerald-300 font-medium">Clinical Mode - Online</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700 backdrop-blur-sm">
                v3.6 Diagnostic Engine
              </span>
            </div>

            {/* Chat Body */}
            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto relative z-10">
              <AnimatePresence>
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-lg p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-[#043927]/80 text-white border border-emerald-700 backdrop-blur-sm"
                          : "text-slate-900 glass-card-light"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Interactive Symptom Choice Pills */}
              <div className="pl-2 space-y-2">
                <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Select symptomatic indicators:</p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                            : "bg-emerald-900/60 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Red Urgency Warning Banner */}
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 float-icon" />
                <span>
                  <strong>AI Urgency Alert:</strong> High risk of cardiovascular event. Recommend immediate triage protocol.
                </span>
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendAiMessage} className="p-4 bg-[#043927]/80 border-t border-emerald-800 flex gap-3 relative z-10 backdrop-blur-sm">
              <input
                type="text"
                placeholder="Type your response..."
                aria-label="Type your response to the AI assistant"
                value={userCustomInput}
                onChange={(e) => setUserCustomInput(e.target.value)}
                className="flex-1 bg-[#064e3b]/80 text-white placeholder-emerald-300/60 text-sm px-4 py-2.5 rounded-xl border border-emerald-700 focus:outline-none focus:border-emerald-400 backdrop-blur-sm transition-colors"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer btn-3d-glow"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
