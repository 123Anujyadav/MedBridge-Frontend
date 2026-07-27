import React from "react";
import { Clock, MapPin, Video, Building2, Zap } from "lucide-react";

interface DoctorAvailabilityProps {
  isOnline: boolean;
  todayAvailable: boolean;
  nextSlot: string; // e.g. "Today, 4:30 PM"
  distance?: string; // e.g. "2.4 km away"
  consultationTypes?: ("video" | "in-person" | "emergency")[];
}

export const DoctorAvailability: React.FC<DoctorAvailabilityProps> = ({
  isOnline = true,
  todayAvailable = true,
  nextSlot = "Today, 4:30 PM",
  distance = "2.4 km away",
  consultationTypes = ["video", "in-person"],
}) => {
  return (
    <div className="space-y-2 text-xs">
      {/* Availability Status & Distance Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/60 pb-2">
        <div className="flex items-center gap-2">
          {/* Online / Offline status dot badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isOnline
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-surface-container-high text-muted-foreground border border-border-subtle"
          }`}>
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            {isOnline ? "Online Now" : "Offline"}
          </span>

          {todayAvailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold border border-blue-500/20">
              <Zap className="h-3 w-3" /> Available Today
            </span>
          )}
        </div>

        {distance && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {distance}
          </span>
        )}
      </div>

      {/* Next Available Slot & Consultation Options */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Next Slot: <strong className="text-foreground font-semibold">{nextSlot}</strong></span>
        </div>

        {/* Consultation Options Badges */}
        <div className="flex items-center gap-1">
          {consultationTypes.includes("video") && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-foreground border border-border-subtle" title="Video Consultation Available">
              <Video className="h-3 w-3 text-primary" /> Video
            </span>
          )}
          {consultationTypes.includes("in-person") && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-foreground border border-border-subtle" title="In-person Visit Available">
              <Building2 className="h-3 w-3 text-primary" /> In-person
            </span>
          )}
          {consultationTypes.includes("emergency") && (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-500/20" title="Emergency Available">
              <Zap className="h-3 w-3" /> Emergency
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
