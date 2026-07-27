import React, { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

interface NotificationBannerProps {
  message?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message = "AI Medical Triage System Active • HIPAA Compliant & Encrypted Analysis",
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary shadow-xs animate-fade-in mb-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex h-5 w-5 items-center justify-center rounded-md text-primary/70 hover:bg-primary/10 hover:text-primary transition-all"
        title="Dismiss notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
