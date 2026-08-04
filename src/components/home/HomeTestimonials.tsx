import ScrollReveal, { StaggerReveal } from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

const testimonials = [
  {
    initials: "DA",
    name: "Dr. Ananya Iyer",
    role: "Chief Cardiologist, Apex Hospital",
    quote:
      "MedBridge AI has significantly reduced the time we spend on preliminary triage and records retrieval, allowing us to focus on patient outcomes.",
    color: "bg-emerald-200 text-[#064e3b]",
    ringColor: "rgba(16,185,129,0.4)",
  },
  {
    initials: "RS",
    name: "Rahul Sharma",
    role: "Patient User",
    quote:
      "The automated reminders and instant SOS feature saved my father's life during an emergency. Essential tool for every family.",
    color: "bg-teal-200 text-teal-900",
    ringColor: "rgba(13,148,136,0.4)",
  },
];

export default function HomeTestimonials() {
  return (
    <section className="py-20 lg:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/15 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-100/10 rounded-full blur-[80px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Professionals &amp; Patients
          </h2>
        </ScrollReveal>

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          staggerDelay={0.15}
        >
          {testimonials.map((t) => (
            <GlassCard
              key={t.name}
              className="p-8 rounded-2xl space-y-4"
              variant="light"
              tilt={true}
            >
              <div className="flex items-center gap-4">
                {/* Avatar with animated ring */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full font-bold flex items-center justify-center text-lg shadow-xs"
                    style={{
                      background: t.color.includes("emerald")
                        ? "linear-gradient(135deg, #a7f3d0, #6ee7b7)"
                        : "linear-gradient(135deg, #99f6e4, #5eead4)",
                      color: t.color.includes("emerald") ? "#064e3b" : "#134e4a",
                      boxShadow: `0 0 0 2px ${t.ringColor}, 0 0 20px ${t.ringColor}`,
                      animation: "glow-ring 2.5s ease-out infinite",
                    }}
                  >
                    {t.initials}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="relative">
                <div
                  className="absolute -top-2 -left-1 text-5xl font-black text-emerald-200 leading-none pointer-events-none float-icon-slow"
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic pl-4">
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
