import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Video,
  FolderHeart,
  CheckCircle2,
} from "lucide-react";

export default function HomeFeatures() {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#fafcfb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Precision Engineering for Life
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Modern healthcare requires modern tools. Our suite of AI-driven features is built to eliminate paperwork and prioritize patient outcomes.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: AI Medical Assistant */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#064e3b]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI Medical Assistant</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A 24/7 clinical AI agent evaluating symptoms, suggesting preliminary diagnosis &amp; care plans, and tracking treatment progress.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Natural language interface</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Clinical Protocol Alignment</span>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Intake */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#064e3b]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Intake</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Replace manual onboarding with automated triage and OCR-based medical history extraction.
            </p>
          </div>

          {/* Card 3: Telehealth 2.0 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#064e3b]">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Telehealth 2.0</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Seamless HD video consultations with real-time AI transcription and instant digital prescriptions.
            </p>
          </div>

          {/* Card 4: Universal Health Records */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#064e3b]">
              <FolderHeart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Universal Health Records</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A unified patient profile that syncs seamlessly across different hospitals and specialists, ensuring continuity of care.
            </p>
          </div>
        </div>

        {/* Wide Banner: Automated Lab Insights */}
        <div className="mt-8 bg-[#064e3b] text-white rounded-2xl p-8 lg:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl font-bold tracking-tight">Automated Lab Insights</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Translate complex lab results into plain language for patients while highlighting critical anomalies for doctors using custom pattern recognition.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate("/auth?role=patient&mode=login")}
                className="px-6 py-3 rounded-xl bg-white text-[#064e3b] font-bold text-sm hover:bg-emerald-50 transition-all shadow-md cursor-pointer"
              >
                Explore Insights Engine
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-row sm:flex-col gap-6 md:gap-4 border-t md:border-t-0 md:border-l border-emerald-700/60 pt-6 md:pt-0 md:pl-10">
            <div>
              <div className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">Processing Time</div>
              <div className="text-3xl font-extrabold text-white">60% Faster</div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">Accuracy Rate</div>
              <div className="text-3xl font-extrabold text-white">99.4%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
