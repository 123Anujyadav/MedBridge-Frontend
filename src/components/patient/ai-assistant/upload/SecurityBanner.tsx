import React from "react";
import { Lock, ShieldCheck } from "lucide-react";

export const SecurityBanner: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary shadow-xs">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 shrink-0 text-primary" />
        <span>Your uploaded medical reports are handled securely & encrypted.</span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-success">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>HIPAA Compliant</span>
      </div>
    </div>
  );
};
