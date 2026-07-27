import React, { useState } from "react";
import { Doctor } from "./DoctorCard";
import { SelectedDoctorSummary } from "./SelectedDoctorSummary";
import { ArrowRight, Send, ShieldCheck, Lock, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContinuePanelProps {
  selectedDoctor: Doctor;
  onConfirmRouting: (doctor: Doctor, consultationType: "video" | "in-person") => void;
}

export const ContinuePanel: React.FC<ContinuePanelProps> = ({
  selectedDoctor,
  onConfirmRouting,
}) => {
  const { toast } = useToast();
  const [consultationType, setConsultationType] = useState<"video" | "in-person">("video");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpenConfirmation = () => {
    setShowModal(true);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(false);
      onConfirmRouting(selectedDoctor, consultationType);
      toast({
        title: "Medical Case Routed",
        description: `Your case has been securely transmitted to ${selectedDoctor.name}.`,
      });
    }, 1000);
  };

  return (
    <>
      <div className="rounded-3xl border border-primary/30 bg-card p-6 shadow-xl space-y-5 animate-fade-in">
        {/* Selected Doctor Component */}
        <SelectedDoctorSummary
          doctor={selectedDoctor}
          consultationType={consultationType}
          setConsultationType={setConsultationType}
        />

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border-subtle">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Case files are encrypted and visible <strong>ONLY</strong> to {selectedDoctor.name}.
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenConfirmation}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-3.5 font-headline text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-primary/20 bg-card p-6 md:p-8 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container-high transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Send className="h-7 w-7" />
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h3 className="font-headline text-xl md:text-2xl font-bold text-foreground">
                Confirm Medical Case Routing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your AI Medical Case will be securely sent to{" "}
                <strong className="text-foreground">{selectedDoctor.name}</strong> ({selectedDoctor.department}).
              </p>
            </div>

            {/* Recipient Doctor Specs */}
            <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle flex items-center gap-3">
              <img
                src={selectedDoctor.photoUrl}
                alt={selectedDoctor.name}
                className="h-12 w-12 rounded-xl object-cover border border-primary"
              />
              <div className="min-w-0 text-xs">
                <p className="font-bold text-foreground truncate">{selectedDoctor.name}</p>
                <p className="text-muted-foreground truncate">{selectedDoctor.hospital}</p>
                <span className="text-primary font-semibold capitalize">
                  {consultationType === "video" ? "📹 Video Consultation" : "🏥 In-Person Visit"}
                </span>
              </div>
            </div>

            {/* Privacy Promise */}
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Only {selectedDoctor.name} will receive access to your structured clinical case file in their Doctor Dashboard.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>Routing Case...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Confirm & Send to {selectedDoctor.name.split(" ")[1] || selectedDoctor.name}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto rounded-2xl border border-border-subtle bg-card px-5 py-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Change Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
