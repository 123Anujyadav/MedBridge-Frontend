import React from "react";
import { Siren, PhoneCall, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmergencyCardProps {
  heading?: string;
  description?: string;
  nearestHospital?: string;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  heading = "Immediate Medical Attention Recommended",
  description = "If you or someone around you is experiencing severe chest pain, extreme shortness of breath, sudden numbness, or loss of consciousness, call emergency services immediately.",
  nearestHospital = "St. Jude Memorial Hospital — Emergency Room (1.2 miles away)",
}) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4 shadow-lg animate-pulse">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-white shadow-md">
          <Siren className="h-5 w-5 animate-bounce" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-destructive">{heading}</h4>
          <p className="text-[10px] font-semibold text-destructive/80 uppercase tracking-wider">
            Critical Triage Warning
          </p>
        </div>
      </div>

      <p className="text-xs text-foreground/90 leading-relaxed mb-3.5 pl-1 font-medium">
        {description}
      </p>

      {/* Nearest Hospital Info */}
      <div className="flex items-center gap-2 rounded-xl bg-card p-2.5 text-xs text-muted-foreground border border-destructive/20 mb-3.5">
        <MapPin className="h-4 w-4 text-destructive shrink-0" />
        <span className="font-medium truncate">{nearestHospital}</span>
      </div>

      {/* Emergency Call Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate("/patient/emergency")}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-destructive/90 active:scale-95"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Call 911 / Emergency Support</span>
        </button>
      </div>
    </div>
  );
};
