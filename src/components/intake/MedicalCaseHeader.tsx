import React from "react";
import { ShieldCheck, Sparkles, Stethoscope, Globe, Clock, CheckCircle2 } from "lucide-react";

interface MedicalCaseHeaderProps {
  currentLanguage?: string;
}

export const MedicalCaseHeader: React.FC<MedicalCaseHeaderProps> = ({ currentLanguage = "Auto-Detect" }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-accent/20 to-primary/5 p-6 md:p-8 border border-primary/15 shadow-sm transition-all">
      {/* Background Subtle Mesh / Glow */}
      <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-accent/30 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Stethoscope className="h-3.5 w-3.5" />
              Official Clinical Intake
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              HIPAA Compliant & Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Multilingual AI Engine
            </span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <span>AI Medical Case Intake</span>
              <span className="inline-flex items-center justify-center p-1.5 rounded-xl bg-primary text-primary-foreground text-xs shadow-md">
                <Sparkles className="h-4 w-4" />
              </span>
            </h1>
            <p className="mt-2 text-base md:text-lg text-muted-foreground font-body leading-relaxed">
              Describe your health concern in your own words. Our AI will organize it into a professional medical case for your doctor.
            </p>
          </div>
        </div>

        {/* Live System Specs Card */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2 rounded-2xl bg-card/80 backdrop-blur-md p-4 border border-border-subtle shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Avg. Review Prep: <strong className="text-foreground font-semibold">&lt; 2 mins</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Doctor Pipeline: <strong className="text-foreground font-semibold">Active Ready</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Language Input: <strong className="text-foreground font-semibold">{currentLanguage}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
