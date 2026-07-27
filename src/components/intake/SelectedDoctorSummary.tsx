import React from "react";
import { Doctor } from "./DoctorCard";
import { Clock, Building2, Video, CheckCircle2, ShieldCheck, Stethoscope } from "lucide-react";

interface SelectedDoctorSummaryProps {
  doctor: Doctor;
  consultationType: "video" | "in-person";
  setConsultationType: (type: "video" | "in-person") => void;
}

export const SelectedDoctorSummary: React.FC<SelectedDoctorSummaryProps> = ({
  doctor,
  consultationType,
  setConsultationType,
}) => {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-surface-container-low to-primary/5 p-4 md:p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Doctor Summary Info */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="h-14 w-14 rounded-2xl object-cover border-2 border-primary shadow-sm"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                Selected Specialist
              </span>
            </div>
            <h4 className="font-headline font-bold text-sm md:text-base text-foreground truncate">
              {doctor.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {doctor.department} • <span className="font-semibold text-foreground">{doctor.hospital}</span>
            </p>
          </div>
        </div>

        {/* Consultation Mode Selector */}
        <div className="w-full sm:w-auto space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Consultation Type:
          </label>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border-subtle">
            <button
              type="button"
              onClick={() => setConsultationType("video")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                consultationType === "video"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="h-3.5 w-3.5" /> Video Call
            </button>
            <button
              type="button"
              onClick={() => setConsultationType("in-person")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                consultationType === "in-person"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> In-Person
            </button>
          </div>
        </div>
      </div>

      {/* Meta Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-primary/15 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Est. Wait Time: <strong className="text-foreground">&lt; 15 mins</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Stethoscope className="h-3.5 w-3.5 text-primary" />
          <span>Fee: <strong className="text-foreground font-mono">{doctor.consultationFee}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Case Routing: <strong className="text-foreground">Exclusive Doctor Inbox</strong></span>
        </div>
      </div>
    </div>
  );
};
