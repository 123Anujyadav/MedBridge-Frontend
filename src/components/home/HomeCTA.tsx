import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { scrollToSection } from "./scrollToSection";
import ScrollReveal from "./effects/ScrollReveal";
import MagneticButton from "./effects/MagneticButton";

export default function HomeCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-[#fafcfb] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div
            className="relative text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 overflow-hidden border border-emerald-700/50 scan-line-container"
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #064e3b 100%)",
              backgroundSize: "300% 300%",
              animation: "gradient-shift 8s ease infinite",
              boxShadow: "0 40px 80px -20px rgba(6,78,59,0.5), 0 0 0 1px rgba(16,185,129,0.15), inset 0 1px 0 rgba(16,185,129,0.2)",
            }}
          >
            {/* Ambient gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 via-transparent to-teal-400/10 rounded-3xl pointer-events-none" />

            {/* Holographic shimmer */}
            <div className="holo-shimmer absolute inset-0 pointer-events-none" />

            {/* Top reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

            {/* Floating ambient orbs */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 300, height: 300, background: "rgba(16,185,129,0.08)", blur: "60px", top: "-50px", left: "-50px" }}
              animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 200, height: 200, background: "rgba(13,148,136,0.08)", top: "auto", bottom: "-30px", right: "-30px" }}
              animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight relative z-10">
              Ready to bridge the gap in care?
            </h2>
            <p className="text-emerald-100 max-w-2xl mx-auto text-base sm:text-lg relative z-10">
              Join thousands of healthcare providers and patients already using MedBridge for smarter, faster care.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <MagneticButton strength={0.4}>
                <button
                  onClick={() => navigate("/auth?role=patient&mode=signup")}
                  className="px-8 py-4 rounded-xl bg-white text-[#064e3b] font-bold text-base hover:bg-emerald-50 btn-3d-glow cursor-pointer transition-all"
                >
                  Create Free Account
                </button>
              </MagneticButton>
              <MagneticButton strength={0.4}>
                <button
                  onClick={() => scrollToSection("features")}
                  className="px-8 py-4 rounded-xl border border-emerald-400/60 text-white font-bold text-base hover:bg-emerald-800/60 transition-all cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  Contact Sales
                </button>
              </MagneticButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
