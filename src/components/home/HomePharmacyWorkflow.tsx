import { Pill, Stethoscope, Sparkles, Building2, Truck } from "lucide-react";
import ScrollReveal, { StaggerReveal } from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

const steps = [
  {
    icon: <Stethoscope className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
    title: "Consultation",
    desc: "Doctor issues digital prescription during the visit.",
    step: 1,
  },
  {
    icon: <Sparkles className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
    title: "AI Verification",
    desc: "Cross-checks contraindications, dosage, and history.",
    step: 2,
  },
  {
    icon: <Building2 className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
    title: "Pharmacy Sync",
    desc: "Forwarded to nearest partner pharmacy.",
    step: 3,
  },
  {
    icon: <Truck className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300 float-icon" />,
    title: "Home Delivery",
    desc: "Medicine arrives at your doorstep within 60 mins.",
    step: 4,
  },
];

export default function HomePharmacyWorkflow() {
  return (
    <section id="rx-pharmacy" className="py-20 lg:py-24 bg-white border-y border-slate-200/60 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-100/15 rounded-full blur-[80px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#064e3b] text-xs font-bold uppercase tracking-wider gradient-border-always">
            <Pill className="w-3.5 h-3.5 float-icon" />
            INTEGRATED PHARMACY WORKFLOW
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Prescription to Pharmacy
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Seamless journey from clinical consultation to home delivery.
          </p>
        </ScrollReveal>

        {/* Connected Step-by-Step Timeline */}
        <div className="relative">
          {/* Animated connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 overflow-hidden -z-0">
            <div className="absolute inset-0 bg-emerald-200" />
            <div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
              style={{
                animation: "border-spin 3s linear infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>

          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            staggerDelay={0.15}
          >
            {steps.map((step) => (
              <GlassCard
                key={step.step}
                className="relative z-10 p-6 rounded-2xl text-center space-y-3 group"
                variant="light"
                tilt={true}
              >
                {/* Step number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#064e3b] text-white text-xs font-black flex items-center justify-center shadow-md glow-ring z-20">
                  {step.step}
                </div>

                <div className="w-16 h-16 rounded-full bg-white border-2 border-[#064e3b] text-[#064e3b] flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300 gradient-border">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </GlassCard>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
