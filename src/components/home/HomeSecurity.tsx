import { ShieldCheck, Lock, FileCheck } from "lucide-react";
import ScrollReveal from "./effects/ScrollReveal";

const securityFeatures = [
  {
    icon: <Lock className="w-5 h-5 text-emerald-300 float-icon" />,
    title: "256-Bit End-to-End Encryption",
    desc: "Your health data is encrypted both at rest and in transit. Only you and authorized doctors hold access keys.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-300 float-icon" />,
    title: "RBAC & Audit Logs",
    desc: "Role-Based Access Control ensures strict user authorization with immutable tamper-proof system audit logs.",
  },
  {
    icon: <FileCheck className="w-5 h-5 text-emerald-300 float-icon" />,
    title: "Compliance Certified",
    desc: "HIPAA, GDPR, ABDM, and ISO 27001 compliant cloud infrastructure designed for global enterprise healthcare.",
  },
];

export default function HomeSecurity() {
  return (
    <section id="security" className="py-20 lg:py-24 bg-[#043927] text-white relative overflow-hidden">
      {/* Mesh gradient orbs */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mesh-gradient-orb-1" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none mesh-gradient-orb-2" />

      {/* Holographic shimmer */}
      <div className="holo-shimmer absolute inset-0 pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <ScrollReveal className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 float-icon" />
              ENTERPRISE-GRADE SECURITY
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Bank-Grade Security for Sensitive Health Data.
            </h2>

            <div className="space-y-6">
              {securityFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{f.title}</h4>
                    <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 leading-relaxed max-w-xl">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right Glowing 3D Shield Emblem */}
          <ScrollReveal className="lg:col-span-5 flex items-center justify-center" delay={0.2}>
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer pulsing glowing rings */}
              <div
                className="absolute inset-0 rounded-full border-2 border-emerald-400/20"
                style={{ animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
              />
              <div
                className="absolute inset-4 rounded-full border border-emerald-400/30"
                style={{ animation: "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
              />
              <div className="absolute inset-10 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Central Shield Container */}
              <div
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#10b981] p-1 flex items-center justify-center shadow-2xl relative z-10 card-3d-depth"
                style={{
                  boxShadow: "0 25px 50px -12px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                <div className="w-full h-full rounded-[22px] bg-[#043927] flex items-center justify-center flex-col gap-3 relative overflow-hidden">
                  <ShieldCheck className="w-20 h-20 text-emerald-400 float-icon" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                    256-Bit Encrypted
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
