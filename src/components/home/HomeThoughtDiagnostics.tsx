import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Activity,
  Brain,
  FileSpreadsheet,
  Scan,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ScrollReveal from "./effects/ScrollReveal";

export default function HomeThoughtDiagnostics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Handle Canvas Animation (GPU-friendly, 60fps Lightweight Canvas 2D)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle Cloud System
    const particleCount = Math.min(65, Math.floor((width * height) / 8000));
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      phase: number;
    }[] = [];

    const colors = [
      "rgba(13, 148, 136, ",  // teal-600
      "rgba(16, 185, 129, ",  // emerald-500
      "rgba(6, 182, 212, ",   // cyan-500
      "rgba(99, 102, 241, ",  // indigo-500
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Neural Network Nodes (EHR, PACS, Vitals, AI, Rx)
    const nodeCoords = [
      { xPct: 0.22, yPct: 0.28, color: "#0d9488" },
      { xPct: 0.75, yPct: 0.22, color: "#10b981" },
      { xPct: 0.50, yPct: 0.50, color: "#06b6d4" },
      { xPct: 0.25, yPct: 0.72, color: "#6366f1" },
      { xPct: 0.78, yPct: 0.75, color: "#059669" },
    ];

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Render Ambient Connection Lines between Nodes
      const currentNodes = nodeCoords.map((n) => ({
        x: n.xPct * width + Math.sin(time + n.xPct * 10) * 8,
        y: n.yPct * height + Math.cos(time + n.yPct * 10) * 8,
        color: n.color,
      }));

      // Draw connection Bezier curves between node hubs
      ctx.lineWidth = 1.2;
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const n1 = currentNodes[i];
          const n2 = currentNodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < width * 0.6) {
            const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
            grad.addColorStop(0, n1.color + "33");
            grad.addColorStop(0.5, "rgba(16, 185, 129, 0.2)");
            grad.addColorStop(1, n2.color + "33");

            ctx.strokeStyle = grad;
            ctx.beginPath();
            const cx = (n1.x + n2.x) / 2 + Math.sin(time + i + j) * 20;
            const cy = (n1.y + n2.y) / 2 + Math.cos(time + i + j) * 20;
            ctx.quadraticCurveTo(cx, cy, n2.x, n2.y);
            ctx.stroke();

            // Animated Data Pulses moving along neural lines
            const pulseProgress = (time * 0.4 + (i + j) * 0.2) % 1;
            const px =
              (1 - pulseProgress) * (1 - pulseProgress) * n1.x +
              2 * (1 - pulseProgress) * pulseProgress * cx +
              pulseProgress * pulseProgress * n2.x;
            const py =
              (1 - pulseProgress) * (1 - pulseProgress) * n1.y +
              2 * (1 - pulseProgress) * pulseProgress * cy +
              pulseProgress * pulseProgress * n2.y;

            ctx.fillStyle = n1.color;
            ctx.shadowColor = n1.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Render Floating GPU Particles with Subtle Cursor Influence
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Cursor Repulsion / Soft Magnetism
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const mouseDist = Math.hypot(dx, dy);
        if (mouseDist < 120) {
          const angle = Math.atan2(dy, dx);
          const force = (120 - mouseDist) / 120;
          p.x -= Math.cos(angle) * force * 1.5;
          p.y -= Math.sin(angle) * force * 1.5;
        }

        const currentAlpha =
          p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.phase));

        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Glowing Node Hub Spheres
      currentNodes.forEach((node) => {
        const pulse = 1 + Math.sin(time * 3) * 0.12;

        // Outer volumetric glow ring
        const radialGrad = ctx.createRadialGradient(
          node.x,
          node.y,
          2,
          node.x,
          node.y,
          28 * pulse
        );
        radialGrad.addColorStop(0, node.color + "66");
        radialGrad.addColorStop(0.5, node.color + "1a");
        radialGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 28 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <section
      id="thought-diagnostics"
      className="py-20 lg:py-28 bg-[#fafcfb] relative overflow-hidden border-t border-slate-200/70"
    >
      {/* Background Soft Radial Breathing Orbs */}
      <div className="absolute top-1/4 left-10 w-[550px] h-[550px] bg-teal-100/30 rounded-full blur-[120px] -z-10 pointer-events-none mesh-gradient-orb-1" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-emerald-100/25 rounded-full blur-[130px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-100/20 rounded-full blur-[140px] -z-10 pointer-events-none mesh-gradient-orb-3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE: Copy & Typography */}
          <div className="lg:col-span-6 space-y-6">
            {/* Eyebrow Tag */}
            <ScrollReveal yOffset={20}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50/90 border border-teal-200/80 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>CLINICAL INTELLIGENCE PLATFORM</span>
              </div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal delay={0.08} yOffset={24}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Diagnostics at the{" "}
                <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent text-gradient-animated block sm:inline">
                  speed of thought.
                </span>
              </h2>
            </ScrollReveal>

            {/* Enterprise Healthcare Paragraph */}
            <ScrollReveal delay={0.16} yOffset={24}>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed text-slate-600/90 max-w-xl">
                MedBridge unifies patient records, AI reasoning, medical imaging, live vitals, prescriptions, emergency workflows and predictive intelligence into a single clinical operating system that empowers doctors to make faster, safer and more informed decisions.
              </p>
            </ScrollReveal>

            {/* Clinical Capability Badges */}
            <ScrollReveal delay={0.24} yOffset={20}>
              <div className="pt-2 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs hover:border-teal-300 transition-colors">
                  <Brain className="w-4 h-4 text-teal-600" />
                  <span>Real-time Triage Reasoning</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs hover:border-teal-300 transition-colors">
                  <Scan className="w-4 h-4 text-emerald-600" />
                  <span>PACS Imaging Diagnostics</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs hover:border-teal-300 transition-colors">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <span>Continuous Vitals Stream</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT SIDE: Live Animated AI Neural Visualization */}
          <div className="lg:col-span-6">
            <ScrollReveal delay={0.12} yOffset={30}>
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full h-[440px] sm:h-[500px] rounded-3xl bg-white/60 border border-teal-200/60 shadow-2xl backdrop-blur-xl overflow-hidden group cursor-crosshair noise-overlay"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(240, 253, 250, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)",
                  boxShadow:
                    "0 25px 50px -12px rgba(6, 78, 59, 0.08), 0 0 0 1px rgba(13, 148, 136, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                }}
              >
                {/* 2D Canvas Neural Animation Layer */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />

                {/* Floating Telemetry & Diagnostic Signal Nodes */}

                {/* Badge 1: Top-Right (PACS Imaging AI Analysis) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-lg backdrop-blur-md flex items-center gap-3 animate-float-3d"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-300/40 flex items-center justify-center text-emerald-600">
                    <Scan className="w-4 h-4 float-icon" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">
                      PACS Imaging AI
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                      Analysis 99.8% Complete
                    </p>
                  </div>
                </motion.div>

                {/* Badge 2: Center-Left (Live Vitals Stream) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.45 }}
                  className="absolute top-1/3 left-6 p-3 rounded-2xl bg-white/90 border border-teal-200/80 shadow-lg backdrop-blur-md flex items-center gap-3 animate-float-3d"
                  style={{ animationDelay: "-2s" }}
                >
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-300/40 flex items-center justify-center text-teal-600">
                    <Activity className="w-4 h-4 float-icon" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">
                      Live Vitals Sync
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium">
                      HR: 72 BPM | SpO2: 99%
                    </p>
                  </div>
                </motion.div>

                {/* Badge 3: Bottom-Right (Predictive Risk Index) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="absolute bottom-8 right-8 p-3 rounded-2xl bg-white/90 border border-cyan-200/80 shadow-lg backdrop-blur-md flex items-center gap-3 animate-float-3d"
                  style={{ animationDelay: "-4s" }}
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-300/40 flex items-center justify-center text-cyan-600">
                    <ShieldCheck className="w-4 h-4 float-icon" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">
                      Predictive Intelligence
                    </p>
                    <p className="text-[10px] text-cyan-700 font-semibold">
                      Risk Index: Low (0.02)
                    </p>
                  </div>
                </motion.div>

                {/* Badge 4: Bottom-Left (FHIR EHR Ingestion) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.75 }}
                  className="absolute bottom-8 left-8 p-3 rounded-2xl bg-white/90 border border-indigo-200/80 shadow-lg backdrop-blur-md flex items-center gap-3 animate-float-3d"
                  style={{ animationDelay: "-3s" }}
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-300/40 flex items-center justify-center text-indigo-600">
                    <FileSpreadsheet className="w-4 h-4 float-icon" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">
                      EHR Interoperability
                    </p>
                    <p className="text-[10px] text-indigo-700 font-medium">
                      HL7 / FHIR Synced
                    </p>
                  </div>
                </motion.div>

                {/* Center Core HUD Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-2 backdrop-blur-xs glow-ring">
                    <Zap className="w-9 h-9 text-emerald-600 float-icon" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-emerald-900 bg-emerald-100/90 border border-emerald-300/60 shadow-xs">
                    MedBridge AI Core
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
