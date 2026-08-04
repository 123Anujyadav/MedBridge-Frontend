import { Sparkles, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: <Sparkles className="w-4 h-4 text-emerald-600 float-icon" />, label: "AI-POWERED" },
  { icon: <AlertTriangle className="w-4 h-4 text-red-500 float-icon" />, label: "SOS IN ONE TAP" },
  { icon: <RefreshCw className="w-4 h-4 text-emerald-600 float-icon" />, label: "INSTANT RX SYNC" },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-600 float-icon" />, label: "HIPAA CERTIFIED" },
];

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-2.5 text-slate-700 font-semibold text-xs sm:text-sm tracking-wide uppercase group cursor-default"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                  {item.icon}
                </div>
                <span className="animated-underline">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
