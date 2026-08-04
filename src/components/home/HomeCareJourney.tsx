import {
  Activity,
  Stethoscope,
  FileSpreadsheet,
  Pill,
  HeartPulse,
  UserCheck,
  User,
  Building2,
  CheckCircle2,
} from "lucide-react";
import ScrollReveal, { StaggerReveal } from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

const journeySteps = [
  {
    icon: <Activity className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Symptom Analysis",
    desc: "Evaluates severity",
    step: 1,
  },
  {
    icon: <Stethoscope className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Clinical Diagnosis",
    desc: "Doctor verifies AI plan",
    step: 2,
  },
  {
    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Treatment Plan",
    desc: "Personalized protocol",
    step: 3,
  },
  {
    icon: <Pill className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Fulfillment",
    desc: "Pharma & Care delivery",
    step: 4,
  },
  {
    icon: <HeartPulse className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Recovery Tracking",
    desc: "EHR sync & alerts",
    step: 5,
  },
];

const personaCards = [
  {
    title: "For Patients",
    icon: <User className="w-5 h-5 text-[#064e3b]" />,
    bullets: [
      "1-Tap Instant Emergency SOS",
      "AI-driven health records history",
      "Smart Health Tracker & Doctor Booking",
      "Personalized Rx health companion",
    ],
  },
  {
    title: "For Doctors",
    icon: <UserCheck className="w-5 h-5 text-[#064e3b]" />,
    bullets: [
      "Automated AI Pre-Doctor Diagnosis",
      "Automated clinical documentation",
      "Real-time critical vitals monitoring",
      "Integrated E-Rx & Imaging search",
    ],
  },
  {
    title: "For Enterprise",
    icon: <Building2 className="w-5 h-5 text-[#064e3b]" />,
    bullets: [
      "Enterprise AI Hub Integration 2.0",
      "Precision code management (ICD-10/11)",
      "HIPAA compliant data architecture",
      "Population health analytics dashboard",
    ],
  },
];

export default function HomeCareJourney() {
  return (
    <section id="care-journey" className="py-20 lg:py-24 bg-[#fafcfb] relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-emerald-100/25 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-1" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[90px] -z-10 pointer-events-none mesh-gradient-orb-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            End-to-End Care Journey
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            From doctor search to symptom triaging, our AI orchestrates care seamlessly.
          </p>
        </ScrollReveal>

        {/* 5-Step Horizontal Timeline */}
        <ScrollReveal delay={0.1}>
          <div className="relative pt-4 pb-2">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-emerald-200 -z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {journeySteps.map((s) => (
                <div
                  key={s.step}
                  className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* 3 Persona Cards Grid */}
        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          staggerDelay={0.12}
        >
          {personaCards.map((card) => (
            <GlassCard
              key={card.title}
              className="p-8 rounded-2xl space-y-6"
              variant="light"
              tilt={true}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
              </div>

              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                {card.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
