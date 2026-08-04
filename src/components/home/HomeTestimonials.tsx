import { Quote } from "lucide-react";
import ScrollReveal from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

const testimonials = [
  {
    initials: "RS",
    name: "Rahul Sharma",
    role: "Patient User",
    quote:
      "The AI Assistant correctly identified my early symptom trends before my doctor visit. The automated reminders and instant SOS feature give our family complete peace of mind.",
    ringColor: "rgba(16,185,129,0.4)",
  },
  {
    initials: "AI",
    name: "Dr. Ananya Iyer",
    role: "Chief Cardiologist, Apex Hospital",
    quote:
      "MedBridge AI saves me 45 minutes per day through automated pre-consultation summaries and diagnostic decision support. It transforms clinical efficiency.",
    ringColor: "rgba(16,185,129,0.4)",
  },
  {
    initials: "VM",
    name: "Vikram Malhotra",
    role: "CEO, Max Healthcare",
    quote:
      "Integrating MedBridge reduced our emergency hospital intake triaging time by 60%. The digital health passport and EHR sync are game changers for scale.",
    ringColor: "rgba(13,148,136,0.4)",
  },
  {
    initials: "PV",
    name: "Priya Verma",
    role: "Director, HealthCare AI",
    quote:
      "MedBridge is building the gold-standard operating system for modern, scalable AI healthcare. The seamless integration across patients, doctors, and pharmacies is unmatched.",
    ringColor: "rgba(16,185,129,0.4)",
  },
  {
    initials: "AM",
    name: "Dr. Arvind Menon",
    role: "Medical Superintendent, Fortis Healthcare",
    quote:
      "The real-time vitals sync and Automated Lab Insights engine allow our clinical staff to detect critical patient deterioration hours before traditional rounds.",
    ringColor: "rgba(13,148,136,0.4)",
  },
  {
    initials: "NK",
    name: "Neha Kapoor",
    role: "Healthcare CIO, Apollo Hospitals",
    quote:
      "MedBridge HIPAA-compliant data architecture and 256-bit encryption seamlessly integrated with our enterprise EHR systems in under two weeks.",
    ringColor: "rgba(16,185,129,0.4)",
  },
];

// Duplicate list for continuous 60fps infinite marquee loop
const marqueeTestimonials = [...testimonials, ...testimonials, ...testimonials];

export default function HomeTestimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      {/* Background ambient mesh orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/15 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-100/10 rounded-full blur-[80px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header with Fade Up */}
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Voices from the Ecosystem
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Trusted by top healthcare providers, hospital administrators, and patients.
          </p>
        </ScrollReveal>

        {/* Enterprise Infinite Scrolling Testimonial Marquee Carousel */}
        <ScrollReveal delay={0.1}>
          <div className="relative overflow-hidden w-full group/marquee select-none py-4">
            {/* Soft Edge Fade Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

            <div className="animate-testimonial-marquee gap-6 group-hover/marquee:[animation-play-state:paused] items-stretch">
              {marqueeTestimonials.map((t, idx) => (
                <div
                  key={`${t.name}-${idx}`}
                  className="w-[300px] sm:w-[360px] flex-shrink-0 group/card transition-all duration-300"
                >
                  <GlassCard
                    className="p-6 rounded-2xl h-full flex flex-col justify-between space-y-4 border border-slate-200/80 group-hover/card:border-emerald-300 group-hover/card:bg-emerald-50/30 group-hover/card:-translate-y-1.5 group-hover/card:scale-[1.03] group-hover/card:shadow-xl group-hover/card:shadow-emerald-900/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    variant="light"
                    tilt={false}
                  >
                    {/* Subtle gradient border highlight on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/0 via-emerald-400/10 to-teal-400/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="space-y-4 relative z-10">
                      {/* User Avatar + Info */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-11 h-11 rounded-full font-bold flex items-center justify-center text-sm shadow-xs transition-transform duration-300 group-hover/card:scale-110"
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
                          <h4 className="font-bold text-slate-900 text-sm group-hover/card:text-[#064e3b] transition-colors duration-300">
                            {t.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">{t.role}</p>
                        </div>
                      </div>

                      {/* Quote Text */}
                      <div className="relative pt-1">
                        <Quote className="w-4 h-4 text-emerald-400 opacity-40 group-hover/card:opacity-100 transition-opacity duration-300 mb-1" />
                        <p className="text-xs text-slate-600 group-hover/card:text-slate-800 leading-relaxed italic transition-colors duration-300">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
