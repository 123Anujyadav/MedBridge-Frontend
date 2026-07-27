import React from "react";
import { Doctor } from "./DoctorCard";
import { X, Check, Star, Sparkles, Building2, Globe, Clock, ShieldCheck, Stethoscope } from "lucide-react";

interface ComparisonModalProps {
  doctors: Doctor[];
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId?: string | null;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  doctors,
  isOpen,
  onClose,
  onSelectDoctor,
  selectedDoctorId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl border border-primary/20 bg-card p-6 md:p-8 shadow-2xl overflow-hidden space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Side-by-Side Specialist Matrix
              </span>
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold text-foreground mt-1">
              Compare Recommended Specialists
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container-high transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto overflow-y-auto flex-1 space-y-6 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[700px]">
            {doctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <div
                  key={doc.id}
                  className={`flex flex-col justify-between rounded-3xl border p-5 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-4 ring-primary/20"
                      : "border-border-subtle bg-surface-container-low/50"
                  }`}
                >
                  <div className="space-y-4 text-xs">
                    {/* Doctor Top */}
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.photoUrl}
                        alt={doc.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-primary shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {doc.matchScore}% AI Match
                        </span>
                        <h4 className="font-headline font-bold text-sm text-foreground mt-1">
                          {doc.name}
                        </h4>
                        <p className="text-muted-foreground">{doc.department}</p>
                      </div>
                    </div>

                    {/* Metric Row 1: Hospital & Experience */}
                    <div className="rounded-xl bg-card p-3 border border-border-subtle space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Hospital & Tenure
                      </span>
                      <p className="font-semibold text-foreground">{doc.hospital}</p>
                      <p className="text-muted-foreground">{doc.experience}</p>
                    </div>

                    {/* Metric Row 2: Fee & Rating */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-xl bg-card p-2 border border-border-subtle">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Fee</span>
                        <p className="font-bold text-primary font-mono text-sm">{doc.consultationFee}</p>
                      </div>
                      <div className="rounded-xl bg-card p-2 border border-border-subtle">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Rating</span>
                        <p className="font-bold text-amber-500 text-sm">{doc.rating} ★</p>
                      </div>
                    </div>

                    {/* Metric Row 3: Next Slot */}
                    <div className="rounded-xl bg-card p-3 border border-border-subtle space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" /> Next Availability
                      </span>
                      <p className="font-semibold text-foreground">{doc.nextSlot}</p>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Match Reasons:
                      </span>
                      {doc.recommendationReasons.map((r, i) => (
                        <p key={i} className="text-[11px] text-foreground flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                          {r}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Select CTA */}
                  <div className="pt-4 mt-4 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDoctor(doc);
                        onClose();
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      {isSelected ? "Selected ✓" : "Select Doctor"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
