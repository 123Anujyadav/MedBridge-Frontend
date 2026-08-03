import { useNavigate } from "react-router-dom";

import { scrollToSection } from "./scrollToSection";

export default function HomeFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Brand Col */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              M
            </div>
            <span className="text-xl font-black text-white">MedBridge</span>
          </div>
          <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
            Precision AI-driven health infrastructure for the modern world. Redefining the patient experience from discovery to recovery.
          </p>
        </div>

        {/* Column 1: Platform */}
        <div className="space-y-3">
          <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h5>
          <ul className="space-y-2">
            <li><button onClick={() => scrollToSection("ai-assistant")} className="hover:text-white transition-colors">AI Assistant</button></li>
            <li><button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors">Health Score</button></li>
            <li><button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors">Telehealth</button></li>
          </ul>
        </div>

        {/* Column 2: Patients */}
        <div className="space-y-3">
          <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Patients</h5>
          <ul className="space-y-2">
            <li><button onClick={() => scrollToSection("rx-pharmacy")} className="hover:text-white transition-colors">Prescription Management</button></li>
            <li><button onClick={() => scrollToSection("rx-pharmacy")} className="hover:text-white transition-colors">Medicine Delivery</button></li>
            <li><button onClick={() => navigate("/auth?role=patient&mode=login")} className="hover:text-white transition-colors">Patient Portal</button></li>
          </ul>
        </div>

        {/* Column 3: Doctors */}
        <div className="space-y-3">
          <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Doctors</h5>
          <ul className="space-y-2">
            <li><button onClick={() => scrollToSection("ai-assistant")} className="hover:text-white transition-colors">Diagnostic Tools</button></li>
            <li><button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors">Appointment Sync</button></li>
            <li><button onClick={() => navigate("/auth?role=doctor&mode=login")} className="hover:text-white transition-colors">Doctor Portal</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
        <div>© 2026 MedBridge Inc. Precision Care. All rights reserved.</div>
        <div className="flex items-center gap-6 mt-4 sm:mt-0">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">HIPAA Compliance</span>
        </div>
      </div>
    </footer>
  );
}
