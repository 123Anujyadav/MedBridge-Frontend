import { useNavigate } from "react-router-dom";
import { AlertTriangle, PhoneCall } from "lucide-react";

export default function HomeEmergency() {
  const navigate = useNavigate();

  return (
    <section id="emergency" className="py-20 lg:py-24 bg-[#fafcfb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-50/90 via-pink-50/60 to-red-50/90 rounded-3xl p-8 sm:p-12 border border-red-200/80 card-3d-depth grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* SOS Content */}
          <div className="lg:col-span-8 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              CRITICAL CARE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              SOS in One Tap.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              In an emergency, every second counts. MedBridge instantly broadcasts your location, medical profile, and blood type to first responders and hospitals.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate("/auth?role=patient&mode=login")}
                className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-xl shadow-red-600/35 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>Activate SOS Mode</span>
              </button>
            </div>
          </div>

          {/* Glowing SOS Pulse Graphic */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-6">
            <div className="w-36 h-36 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 animate-pulse relative z-10 cursor-pointer">
              <AlertTriangle className="w-16 h-16" />
            </div>
            <div className="absolute w-48 h-48 rounded-full border-4 border-red-400/40 animate-ping pointer-events-none" />
            <div className="absolute w-60 h-60 rounded-full border-2 border-red-300/20 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
