import React from "react";
import { Users, Award, Clock } from "lucide-react";

interface TrustMetricsProps {
  patientsTreated?: string;
  successRate?: string;
  avgConsultationTime?: string;
}

export const TrustMetrics: React.FC<TrustMetricsProps> = ({
  patientsTreated = "12,500+",
  successRate = "98%",
  avgConsultationTime = "20 min",
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card/80 p-6 border border-border-subtle backdrop-blur-sm shadow-sm">
      <div className="flex flex-col items-center justify-between gap-2 border-r border-border-subtle/80 px-2 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          <Users className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Patients</span>
        </div>
        <p className="font-headline font-bold text-base md:text-lg text-foreground leading-none">
          {patientsTreated}
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-r border-border-subtle/80 px-2 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Success</span>
        </div>
        <p className="font-headline font-bold text-base md:text-lg text-emerald-600 dark:text-emerald-400 leading-none">
          {successRate}
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 px-2 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Avg Time</span>
        </div>
        <p className="font-headline font-bold text-base md:text-lg text-foreground leading-none">
          {avgConsultationTime}
        </p>
      </div>
    </div>
  );
};
