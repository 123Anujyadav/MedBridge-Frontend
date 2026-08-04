import { useNavigate } from "react-router-dom";
import { AlertTriangle, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";

import ScrollReveal from "./effects/ScrollReveal";
import MagneticButton from "./effects/MagneticButton";

export default function HomeEmergency() {
  const navigate = useNavigate();

  return (
    <section id="emergency" className="py-20 lg:py-24 bg-[#fafcfb] relative overflow-hidden">
      {/* Background red ambient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-50/30 via-transparent to-red-50/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(254,226,226,0.9) 0%, rgba(252,231,236,0.6) 50%, rgba(254,226,226,0.9) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(252,165,165,0.5)",
              boxShadow: "0 8px 40px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* Animated red ambient orb inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/15 rounded-full blur-[60px] pointer-events-none mesh-gradient-orb-2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-300/10 rounded-full blur-[50px] pointer-events-none mesh-gradient-orb-1" />

            {/* Top reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-200/60 to-transparent" />

            {/* SOS Content */}
            <div className="lg:col-span-8 space-y-5 text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 float-icon" />
                CRITICAL CARE
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                SOS in One Tap.
              </h2>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                In an emergency, every second counts. MedBridge instantly broadcasts your location, medical profile, and blood type to first responders and hospitals.
              </p>
              <div className="pt-2">
                <MagneticButton strength={0.4}>
                  <button
                    onClick={() => navigate("/auth?role=patient&mode=login")}
                    className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-xl shadow-red-600/35 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
                    style={{
                      boxShadow: "0 10px 30px -5px rgba(239,68,68,0.45), 0 0 0 1px rgba(239,68,68,0.2)",
                    }}
                  >
                    <PhoneCall className="w-5 h-5 animate-bounce" />
                    <span>Activate SOS Mode</span>
                  </button>
                </MagneticButton>
              </div>
            </div>

            {/* Glowing SOS Pulse Graphic — enhanced */}
            <div className="lg:col-span-4 flex items-center justify-center relative py-6">
              {/* Outer rings */}
              <motion.div
                className="absolute rounded-full border-2 border-red-300/30"
                style={{ width: 240, height: 240 }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute rounded-full border-2 border-red-400/25"
                style={{ width: 200, height: 200 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
              />
              <motion.div
                className="absolute rounded-full border border-red-500/20"
                style={{ width: 160, height: 160 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
              />

              {/* Core SOS button */}
              <div
                className="w-36 h-36 rounded-full text-white flex items-center justify-center relative z-10 cursor-pointer glow-ring-red"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #ef4444, #b91c1c)",
                  boxShadow: "0 0 60px rgba(239,68,68,0.5), 0 0 120px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                <AlertTriangle className="w-16 h-16" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
