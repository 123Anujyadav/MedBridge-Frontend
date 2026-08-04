import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Video,
  FolderHeart,
  CheckCircle2,
} from "lucide-react";

import ScrollReveal, { StaggerReveal } from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";
import MagneticButton from "./effects/MagneticButton";

export default function HomeFeatures() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <Sparkles className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
      title: "AI Medical Assistant",
      desc: "A 24/7 clinical AI agent evaluating symptoms, suggesting preliminary diagnosis & care plans, and tracking treatment progress.",
      bullets: ["Natural language interface", "Clinical Protocol Alignment"],
    },
    {
      icon: <FileText className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
      title: "Smart Intake",
      desc: "Replace manual onboarding with automated triage and OCR-based medical history extraction.",
      bullets: [],
    },
    {
      icon: <Video className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
      title: "Telehealth 2.0",
      desc: "Seamless HD video consultations with real-time AI transcription and instant digital prescriptions.",
      bullets: [],
    },
    {
      icon: <FolderHeart className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
      title: "Universal Health Records",
      desc: "A unified patient profile that syncs seamlessly across different hospitals and specialists, ensuring continuity of care.",
      bullets: [],
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#fafcfb] relative overflow-hidden">
      {/* Background animated orb */}
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-emerald-200/15 rounded-full blur-[110px] -z-10 pointer-events-none mesh-gradient-orb-3" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-teal-200/10 rounded-full blur-[90px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Precision Engineering for Life
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Modern healthcare requires modern tools. Our suite of AI-driven features is built to eliminate paperwork and prioritize patient outcomes.
          </p>
        </ScrollReveal>

        {/* Cards Grid */}
        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          staggerDelay={0.12}
        >
          {cards.map((card) => (
            <GlassCard
              key={card.title}
              className="p-8 rounded-2xl group space-y-4"
              variant="light"
              tilt={true}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#064e3b] shadow-xs group-hover:scale-105 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
              {card.bullets.length > 0 && (
                <div className="pt-2 space-y-2 text-xs text-slate-700 font-medium">
                  {card.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </StaggerReveal>

        {/* Wide Banner */}
        <ScrollReveal delay={0.2}>
          <div className="mt-8 bg-[#064e3b] text-white rounded-2xl p-8 lg:p-10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-emerald-700/50 gradient-border-always scan-line-container inner-glow">
            {/* Ambient gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 to-teal-400/5 pointer-events-none" />
            {/* Holographic shimmer */}
            <div className="holo-shimmer absolute inset-0 pointer-events-none" />

            <div className="space-y-3 max-w-xl relative z-10">
              <h3 className="text-2xl font-bold tracking-tight">Automated Lab Insights</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Translate complex lab results into plain language for patients while highlighting critical anomalies for doctors using custom pattern recognition.
              </p>
              <div className="pt-2">
                <MagneticButton>
                  <button
                    onClick={() => navigate("/auth?role=patient&mode=login")}
                    className="px-6 py-3 rounded-xl bg-white text-[#064e3b] font-bold text-sm hover:bg-emerald-50 btn-3d-glow cursor-pointer"
                  >
                    Explore Insights Engine
                  </button>
                </MagneticButton>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-row sm:flex-col gap-6 md:gap-4 border-t md:border-t-0 md:border-l border-emerald-700/60 pt-6 md:pt-0 md:pl-10 relative z-10">
              <div>
                <div className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">Processing Time</div>
                <div className="text-3xl font-extrabold text-white">60% Faster</div>
              </div>
              <div>
                <div className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">Accuracy Rate</div>
                <div className="text-3xl font-extrabold text-white">99.4%</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
