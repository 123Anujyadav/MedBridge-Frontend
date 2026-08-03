import React, { useState } from "react";
import { Sparkles, AlertTriangle, Send } from "lucide-react";

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
    <section id="ai-assistant" className="py-20 lg:py-24 bg-white border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Diagnosis Interface
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Empowering doctors with real-time AI-assisted decision support system.
          </p>
        </div>

        {/* Interactive Chat UI Card */}
        <div className="max-w-4xl mx-auto bg-[#064e3b] rounded-2xl shadow-2xl overflow-hidden border border-emerald-800 text-white">
          {/* Header bar */}
          <div className="bg-[#043927] px-6 py-4 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">MedBridge AI Assistant</h4>
                <p className="text-[11px] text-emerald-300 font-medium">Clinical Mode - Online</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700">
              v3.6 Diagnostic Engine
            </span>
          </div>

          {/* Chat Body */}
          <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#043927] text-white border border-emerald-700"
                      : "bg-white text-slate-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

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
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>
                <strong>AI Urgency Alert:</strong> High risk of cardiovascular event. Recommend immediate triage protocol.
              </span>
            </div>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendAiMessage} className="p-4 bg-[#043927] border-t border-emerald-800 flex gap-3">
            <input
              type="text"
              placeholder="Type your response..."
              value={userCustomInput}
              onChange={(e) => setUserCustomInput(e.target.value)}
              className="flex-1 bg-[#064e3b] text-white placeholder-emerald-300/60 text-sm px-4 py-2.5 rounded-xl border border-emerald-700 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
