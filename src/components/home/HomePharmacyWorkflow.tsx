import { Pill, Stethoscope, Sparkles, Building2, Truck } from "lucide-react";

export default function HomePharmacyWorkflow() {
  return (
    <section id="rx-pharmacy" className="py-20 lg:py-24 bg-white border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#064e3b] text-xs font-bold uppercase tracking-wider">
            <Pill className="w-3.5 h-3.5" />
            INTEGRATED PHARMACY WORKFLOW
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Prescription to Pharmacy
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Seamless journey from clinical consultation to home delivery.
          </p>
        </div>

        {/* Connected Step-by-Step Timeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-emerald-200 -z-0" />

          {/* Step 1 */}
          <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 card-3d-depth group">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#064e3b] text-[#064e3b] flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
              <Stethoscope className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Consultation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctor issues digital prescription during the visit.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 card-3d-depth group">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#064e3b] text-[#064e3b] flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">AI Verification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-checks contraindications, dosage, and history.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 card-3d-depth group">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#064e3b] text-[#064e3b] flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Pharmacy Sync</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Forwarded to nearest partner pharmacy.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 card-3d-depth group">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#064e3b] text-[#064e3b] flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform duration-300">
              <Truck className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Home Delivery</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Medicine arrives at your doorstep within 60 mins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
