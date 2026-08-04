import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Video,
  CheckCircle2,
  Stethoscope,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

import { scrollToSection } from "./scrollToSection";
import MagneticButton from "./effects/MagneticButton";
import ScrollReveal from "./effects/ScrollReveal";

const HeroScene = lazy(() => import("./3d/HeroScene"));

const HEART_RATE_SERIES = [40, 55, 65, 50, 72, 85, 78, 68, 72, 80, 72];

/** Stagger variants for hero text children */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};

export default function HomeHero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-[#ecfdf5]/70 via-[#fafcfb] to-[#fafcfb]">
      {/* Mesh gradient orbs — enhanced animated versions */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[120px] -z-10 pointer-events-none mesh-gradient-orb-1" />
      <div className="absolute top-24 left-6 w-[450px] h-[450px] bg-teal-300/15 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-emerald-200/10 rounded-full blur-[80px] -z-10 pointer-events-none mesh-gradient-orb-3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Hero Left Content — stagger revealed */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-left"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] text-xs font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#166534] float-icon" />
                AI-POWERED PLATFORM
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
            >
              Smarter Healthcare. <br />
              <span className="text-gradient-animated">
                Powered by AI.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl max-w-2xl leading-relaxed text-slate-600 font-normal"
            >
              Unifying patient records, real-time diagnostics, and predictive insights into a single, clinical-grade interface.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <MagneticButton strength={0.35}>
                <button
                  onClick={() => navigate("/auth?role=patient&mode=signup")}
                  className="px-8 py-4 rounded-xl bg-[#064e3b] hover:bg-[#043927] text-white font-bold text-base btn-3d-glow flex items-center justify-center gap-2 group cursor-pointer gradient-border"
                >
                  <span>Request Demo</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </MagneticButton>

              <MagneticButton strength={0.35}>
                <button
                  onClick={() => scrollToSection("ai-assistant")}
                  className="px-8 py-4 rounded-xl bg-white/80 border border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-base card-3d-depth flex items-center justify-center gap-2 cursor-pointer glass-card-light"
                >
                  <Video className="w-5 h-5 text-[#064e3b] float-icon" />
                  <span>Watch in Action</span>
                </button>
              </MagneticButton>
            </motion.div>

            {/* Trust metrics */}
            <motion.div
              variants={itemVariants}
              className="pt-6 flex items-center gap-6 text-xs text-slate-500 font-medium"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> HIPAA Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7 AI Triage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 99.4% Precision
              </span>
            </motion.div>
          </motion.div>

          {/* Hero Right — 3D Scene + Glass Clinical Widget Overlay */}
          <ScrollReveal className="lg:col-span-5 relative" delay={0.2}>
            {/* 3D WebGL Scene fills the column */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{ minHeight: 440 }}
            >
              {/* Glow backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl filter blur-2xl transform scale-95 pointer-events-none" />

              {/* R3F Canvas — lazy loaded.
                  Hidden from assistive tech: the scene is decorative, and an
                  unlabelled <canvas> is announced as a meaningless element.
                  The global particle canvas is already wrapped this way; this
                  one was the only 3D surface still exposed. */}
              <div style={{ width: "100%", height: 440 }} aria-hidden="true">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-400/40 animate-spin" style={{ borderTopColor: "#10b981" }} />
                  </div>
                }>
                  <HeroScene />
                </Suspense>
              </div>

              {/* Glass Clinical Widget Overlay — floats over the 3D scene */}
              <div className="absolute bottom-4 left-4 right-4 glass-card-light rounded-2xl p-5 border border-white/60 space-y-4 gradient-border">
                {/* Widget Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#064e3b] shadow-sm glow-ring">
                      <Stethoscope className="w-5 h-5 float-icon" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">AI Assistant</h4>
                      <p className="text-xs text-slate-500 font-medium">Analyzing Vitals...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 text-[#064e3b] px-3 py-1.5 rounded-full font-bold text-xs border border-emerald-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Health Score 94 / 100
                  </div>
                </div>

                {/* Vitals Bar Chart */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-600 font-semibold">
                    <span>Heart Rate (BPM)</span>
                    <span className="text-[#064e3b] font-bold">72 BPM</span>
                  </div>
                  <div className="flex items-end gap-2 h-16 pt-2">
                    {HEART_RATE_SERIES.map((height, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + idx * 0.05, duration: 0.4, ease: "easeOut" }}
                        style={{ originY: 1 }}
                        className="flex-1 rounded-t"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-[#064e3b] to-[#10b981] hover:opacity-90 rounded-t transition-all cursor-pointer group relative"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow">
                            {height}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Pill Dose Alert */}
                <div className="p-3 rounded-xl bg-white/60 border border-slate-100/80 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Clock className="w-4 h-4 text-emerald-600 float-icon" />
                    <span>Insulin - Select Dose</span>
                  </div>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                    2:00 PM
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
