import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, FileText, Zap, Truck, Check } from "lucide-react";
import ScrollReveal from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";
import MagneticButton from "./effects/MagneticButton";

const features = [
  {
    icon: <FileText className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Auto-Extraction",
    desc: "Parses medicine, dosage, and duration directly from your Rx",
  },
  {
    icon: <Zap className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Fast Dispatch",
    desc: "Orders sent directly to nearest verified partner pharmacy",
  },
  {
    icon: <Truck className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Track Execution",
    desc: "Real-time updates & automated delivery tracking to your doorstep",
  },
];

export default function HomeRxOrder() {
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);

  const handleOrderClick = () => {
    setIsOrdered(true);
    setTimeout(() => {
      navigate("/auth?role=patient&mode=login");
    }, 1200);
  };

  return (
    <section id="rx-order" className="py-20 lg:py-24 bg-white border-y border-slate-200/80 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Content */}
          <ScrollReveal className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#064e3b] text-xs font-bold uppercase tracking-wider gradient-border-always">
              <Pill className="w-3.5 h-3.5 float-icon" />
              PHARMACY INTEGRATION
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Order Medicines Directly <br />
              From Your Prescription
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              No manual upload required. Our AI automatically parses your Rx for verification &amp; delivery.
            </p>

            <div className="space-y-4 pt-2">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{f.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right Interactive Sample Prescription Card Widget */}
          <ScrollReveal className="lg:col-span-6" delay={0.2}>
            <GlassCard
              className="p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden border border-emerald-200/80 shadow-xl"
              variant="light"
              tilt={true}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    Rx
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Current Prescription</h4>
                    <p className="text-xs text-slate-500">Verified by AI Health Engine</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#064e3b] font-bold text-[11px]">
                  Active
                </span>
              </div>

              {/* Medicine List */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Metformin 500mg</div>
                    <div className="text-xs text-slate-500">1 capsule 2x Daily - 30 Days</div>
                  </div>
                  <span className="text-xs font-bold text-[#064e3b] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    1 Tab/Day
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Amoxicillin 250mg</div>
                    <div className="text-xs text-slate-500">1 capsule daily - 10 Days</div>
                  </div>
                  <span className="text-xs font-bold text-[#064e3b] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    10 Caps
                  </span>
                </div>
              </div>

              {/* Order Button */}
              <div className="pt-2">
                <MagneticButton strength={0.3}>
                  <button
                    onClick={handleOrderClick}
                    disabled={isOrdered}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isOrdered
                        ? "bg-emerald-600 text-white"
                        : "bg-[#064e3b] hover:bg-[#043927] text-white btn-3d-glow"
                    }`}
                  >
                    {isOrdered ? (
                      <>
                        <Check className="w-5 h-5 animate-bounce" />
                        <span>Order Processing...</span>
                      </>
                    ) : (
                      <span>Order All Medicines</span>
                    )}
                  </button>
                </MagneticButton>
              </div>
            </GlassCard>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
