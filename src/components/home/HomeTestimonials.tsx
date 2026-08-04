import ScrollReveal, { StaggerReveal } from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

const testimonials = [
  {
    initials: "RS",
    name: "Rahul Sharma",
    role: "Patient User",
    quote:
      "The AI Assistant correctly identified my early symptom trends before my doctor visit. The automated reminders and instant SOS feature give our family complete peace of mind.",
    color: "bg-[#dcfce7] text-[#166534]",
    ringColor: "rgba(16,185,129,0.4)",
  },
  {
    initials: "AI",
    name: "Dr. Ananya Iyer",
    role: "Chief Cardiologist, Apex Hospital",
    quote:
      "MedBridge AI saves me 45 minutes per day through automated pre-consultation summaries and diagnostic decision support. It transforms clinical efficiency.",
    color: "bg-emerald-200 text-[#064e3b]",
    ringColor: "rgba(16,185,129,0.4)",
  },
  {
    initials: "VM",
    name: "Vikram Malhotra",
    role: "CEO, Max Healthcare",
    quote:
      "Integrating MedBridge reduced our emergency hospital intake triaging time by 60%. The digital health passport and EHR sync are game changers for scale.",
    color: "bg-teal-200 text-teal-900",
    ringColor: "rgba(13,148,136,0.4)",
  },
  {
    initials: "PV",
    name: "Priya Verma",
    role: "Director, HealthCare AI",
    quote:
      "MedBridge is building the gold-standard operating system for modern, scalable AI healthcare. The seamless integration across patients, doctors, and pharmacies is unmatched.",
    color: "bg-emerald-100 text-emerald-950",
    ringColor: "rgba(16,185,129,0.4)",
  },
];

export default function HomeTestimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/15 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-100/10 rounded-full blur-[80px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Voices from the Ecosystem
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Trusted by top healthcare providers, hospital administrators, and patients.
          </p>
        </ScrollReveal>

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          staggerDelay={0.1}
        >
          {testimonials.map((t) => (
            <GlassCard
              key={t.name}
              className="p-6 rounded-2xl space-y-4 flex flex-col justify-between"
              variant="light"
              tilt={true}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-full font-bold flex items-center justify-center text-sm shadow-xs"
                      style={{
                        background: "linear-gradient(135deg, #a7f3d0, #6ee7b7)",
                        color: "#064e3b",
                        boxShadow: `0 0 0 2px ${t.ringColor}, 0 0 16px ${t.ringColor}`,
                        animation: "glow-ring 2.5s ease-out infinite",
                      }}
                    >
                      {t.initials}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{t.role}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            </GlassCard>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
