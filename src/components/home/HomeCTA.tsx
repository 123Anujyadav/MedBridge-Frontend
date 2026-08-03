import { useNavigate } from "react-router-dom";

import { scrollToSection } from "./scrollToSection";

export default function HomeCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-[#fafcfb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#064e3b] text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to bridge the gap in care?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto text-base sm:text-lg">
            Join thousands of healthcare providers and patients already using MedBridge for smarter, faster care.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/auth?role=patient&mode=signup")}
              className="px-8 py-4 rounded-xl bg-white text-[#064e3b] font-bold text-base hover:bg-emerald-50 shadow-lg transition-all cursor-pointer"
            >
              Create Free Account
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="px-8 py-4 rounded-xl border border-emerald-400 text-white font-bold text-base hover:bg-emerald-800/60 transition-all cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
