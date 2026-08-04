import { Sparkles, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: <Sparkles className="w-4 h-4 text-emerald-600 group-hover:rotate-6 transition-transform duration-300" />, label: "AI-POWERED" },
  { icon: <AlertTriangle className="w-4 h-4 text-red-500 group-hover:rotate-6 transition-transform duration-300" />, label: "SOS IN ONE TAP" },
  { icon: <RefreshCw className="w-4 h-4 text-emerald-600 group-hover:rotate-6 transition-transform duration-300" />, label: "INSTANT RX SYNC" },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:rotate-6 transition-transform duration-300" />, label: "HIPAA CERTIFIED" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function HomeTrustBar() {
  return (
    <section className="border-y border-slate-200/80 relative overflow-hidden">
      {/* Glass background */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        className="py-5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          >
            {items.map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200/60 bg-white/40 text-slate-700 font-semibold text-xs sm:text-sm tracking-wide uppercase group cursor-pointer transition-all duration-300 hover:-translate-y-[2px] hover:bg-emerald-50/60 hover:border-emerald-300 hover:text-[#064e3b] hover:shadow-[0_4px_16px_rgba(16,185,129,0.15)]"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-colors duration-300 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="animated-underline group-hover:text-[#064e3b] transition-colors duration-300">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
