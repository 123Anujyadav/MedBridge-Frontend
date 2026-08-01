import React, { useState } from "react";
import { Doctor } from "./DoctorCard";
import { ArrowRight, Send, ShieldCheck, Lock, Clock, Calendar, CheckCircle2, X } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface SelectedDoctorFooterProps {
  selectedDoctor: Doctor;
  onConfirmRouting: (doctor: Doctor, consultationType: "video" | "in-person") => void;
  /** True while the case is actually being routed by the caller. */
  isRouting?: boolean;
}

/**
 * Confirmation for routing the case to the chosen clinician.
 *
 * The confirm button used to run a 1000 ms `setTimeout`, close the modal and
 * announce "Medical Case Routed — securely transmitted" on its own authority.
 * No request had been made at that point, and none was made afterwards either:
 * the toast was the only evidence the patient ever got, and it was true of
 * nothing. Routing is now the caller's to perform and to report on; this
 * component only reflects its progress.
 */
export const SelectedDoctorFooter: React.FC<SelectedDoctorFooterProps> = ({
  selectedDoctor,
  onConfirmRouting,
  isRouting = false,
}) => {
  const [consultationType, setConsultationType] = useState<"video" | "in-person">("video");
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleOpenConfirmation = () => {
    setShowModal(true);
  };

  const handleFinalSubmit = () => {
    // The modal stays open for the duration. On success the caller advances
    // the page and this whole panel unmounts; on failure it lowers `isRouting`
    // and the patient can retry from here.
    onConfirmRouting(selectedDoctor, consultationType);
  };

  return (
    <>
      <div className="sticky bottom-4 z-30 rounded-3xl border border-primary/30 bg-card/95 p-5 md:p-6 shadow-2xl backdrop-blur-xl transition-all animate-fade-in space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Selected Doctor Summary */}
          <div className="flex items-center gap-3.5 min-w-0">
            <UserAvatar
              avatarUrl={selectedDoctor.photoUrl}
              name={selectedDoctor.name}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-surface-container-high text-sm font-bold text-muted-foreground shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Selected Doctor
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Ready for Routing
                </span>
              </div>
              <h4 className="font-headline font-bold text-base text-foreground truncate">
                {selectedDoctor.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {selectedDoctor.department} • {selectedDoctor.hospital}
              </p>
            </div>
          </div>

          {/* Consultation Metrics */}
          <div className="grid grid-cols-3 gap-3 text-xs w-full lg:w-auto bg-surface-container-low p-3 rounded-2xl border border-border-subtle">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" /> Est. Wait Time
              </span>
              {/* The platform measures no queue time. This read "< 15 mins"
                  for every doctor, which is a service promise nothing backs. */}
              <p className="font-semibold text-foreground mt-0.5">—</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Fee</span>
              <p className="font-mono font-bold text-primary text-sm mt-0.5">{selectedDoctor.consultationFee}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" /> Availability
              </span>
              <p className="font-semibold text-foreground mt-0.5">{selectedDoctor.nextSlot}</p>
            </div>
          </div>

          {/* Continue CTA */}
          <button
            type="button"
            onClick={handleOpenConfirmation}
            className="w-full lg:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 font-headline text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border-subtle/50">
          <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>
            Medical Case will be securely sent <strong>ONLY</strong> to {selectedDoctor.name}.
          </span>
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

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Send className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-headline text-xl md:text-2xl font-bold text-foreground">
                Confirm Medical Case Routing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your AI Medical Case will be securely sent to{" "}
                <strong className="text-foreground">{selectedDoctor.name}</strong> ({selectedDoctor.department}).
              </p>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle flex items-center gap-3">
              <UserAvatar
                avatarUrl={selectedDoctor.photoUrl}
                name={selectedDoctor.name}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary bg-surface-container-high text-xs font-bold text-muted-foreground"
              />
              <div className="min-w-0 text-xs">
                <p className="font-bold text-foreground truncate">{selectedDoctor.name}</p>
                <p className="text-muted-foreground truncate">{selectedDoctor.hospital}</p>
                <span className="text-primary font-semibold">{selectedDoctor.nextSlot}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Only {selectedDoctor.name} will receive access to your structured clinical case file.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isRouting}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isRouting ? (
                  <>Routing Case...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Confirm &amp; Send Case
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isRouting}
                className="w-full sm:w-auto rounded-2xl border border-border-subtle bg-card px-5 py-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 cursor-pointer"
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
