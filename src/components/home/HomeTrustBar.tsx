import { Sparkles, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

export default function HomeTrustBar() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2.5 text-slate-700 font-semibold text-xs sm:text-sm tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI-POWERED</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-700 font-semibold text-xs sm:text-sm tracking-wide uppercase">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>SOS IN ONE TAP</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-700 font-semibold text-xs sm:text-sm tracking-wide uppercase">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>INSTANT RX SYNC</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-slate-700 font-semibold text-xs sm:text-sm tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>HIPAA CERTIFIED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
