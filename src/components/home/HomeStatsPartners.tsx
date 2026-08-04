import ScrollReveal from "./effects/ScrollReveal";

const stats = [
  { value: "6+", label: "Hospitals" },
  { value: "217+", label: "Doctors" },
  { value: "98.4%", label: "Accuracy" },
  { value: "10s", label: "AI Triaging" },
  { value: "24/7", label: "Support" },
  { value: "14M+", label: "Patients" },
];

const partners = [
  "AIIMS",
  "APOLLO",
  "FORTIS",
  "MAX HEALTHCARE",
  "MANIPAL",
  "NARAYANA HEALTH",
];

// Duplicate partners array 4 times for a seamless 60fps infinite marquee loop
const marqueePartners = [...partners, ...partners, ...partners, ...partners];

export default function HomeStatsPartners() {
  return (
    <section className="py-12 bg-white border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Stats Grid */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 text-center">
            {stats.map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/70 hover:bg-emerald-50/80 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
                  {item.value}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Enterprise Partner Logos Row - Infinite Marquee */}
        <ScrollReveal delay={0.1}>
          <div className="pt-2 relative overflow-hidden w-full group/marquee select-none">
            {/* Left and right fade gradient overlays for smooth edge fading */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="animate-infinite-marquee items-center gap-10 sm:gap-16 group-hover/marquee:[animation-play-state:paused]">
              {marqueePartners.map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="flex-shrink-0 group/item relative cursor-pointer px-2 py-1 transition-transform duration-300 hover:scale-105 sm:hover:scale-110"
                >
                  <span className="text-xs sm:text-sm font-black tracking-widest text-slate-400 uppercase group-hover/item:text-[#064e3b] transition-colors duration-300 group-hover/item:drop-shadow-[0_2px_10px_rgba(16,185,129,0.35)]">
                    {partner}
                  </span>
                  {/* Subtle animated underline */}
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#064e3b] rounded-full scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
