import ScrollReveal from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

export default function HomeComparison() {
  return (
    <section id="why-us" className="py-20 lg:py-24 bg-[#fafcfb] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/20 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose MedBridge?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <GlassCard
            className="rounded-2xl overflow-hidden"
            variant="light"
            tilt={false}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-xs font-bold uppercase tracking-wider text-slate-600"
                    style={{
                      background: "rgba(248,250,252,0.8)",
                      backdropFilter: "blur(8px)",
                      borderColor: "rgba(226,232,240,0.8)",
                    }}
                  >
                    <th className="py-4 px-6">Feature</th>
                    <th className="py-4 px-6">Traditional Healthcare</th>
                    <th
                      className="py-4 px-6 text-[#064e3b]"
                      style={{
                        background: "rgba(236,253,245,0.6)",
                        borderLeft: "2px solid rgba(16,185,129,0.3)",
                      }}
                    >
                      MedBridge AI
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {[
                    ["Data Access", "Fragmented / Paper-Based", "Unified & Instant"],
                    ["Diagnostics", "Manual & Slow Only", "AI-Augmented (99.4% Accuracy)"],
                    ["Emergency Response", "Call-Centric / Delayed", "One-Tap SOS & Automated"],
                    ["Follow-ups", "Self-managed", "Automated Smart Tracking"],
                  ].map(([feat, trad, mb], i) => (
                    <tr
                      key={i}
                      className="transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(226,232,240,0.6)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "rgba(236,253,245,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">{feat}</td>
                      <td className="py-4 px-6 text-slate-500">{trad}</td>
                      <td
                        className="py-4 px-6 font-bold text-[#064e3b]"
                        style={{
                          background: "rgba(236,253,245,0.4)",
                          borderLeft: "2px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        {mb}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
