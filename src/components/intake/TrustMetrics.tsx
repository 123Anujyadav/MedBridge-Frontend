import React from "react";
import { Users, Award, Clock } from "lucide-react";

interface TrustMetricsProps {
  patientsTreated?: string;
  successRate?: string;
  avgConsultationTime?: string;
}

/**
 * Volume, outcome and duration for one clinician.
 *
 * The defaults are deliberately "—" and not figures. They used to be
 * "12,500+", "98%" and "20 min", which meant that any doctor the platform held
 * no statistics for was presented to a patient choosing care as having a
 * measured 98% success rate. The platform records none of these three values
 * for any clinician, so the honest rendering is an empty slot.
 */
const NOT_RECORDED = "—";

/** Shared geometry, so the three stats stay identical at every card width. */
const STAT_CELL =
  "flex min-w-0 flex-col items-center justify-between gap-2 px-1 [@container(min-width:420px)]:px-2 text-center";

const STAT_LABEL =
  "flex min-w-0 flex-col [@container(min-width:380px)]:flex-row items-center justify-center gap-1 " +
  "[@container(min-width:380px)]:gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider";

const STAT_VALUE =
  "font-headline font-bold text-base [@container(min-width:420px)]:text-lg leading-none truncate max-w-full";

export const TrustMetrics: React.FC<TrustMetricsProps> = ({
  patientsTreated = NOT_RECORDED,
  successRate = NOT_RECORDED,
  avgConsultationTime = NOT_RECORDED,
}) => {
  return (
    // Three equal 1fr columns. The crowding came from `p-6` plus `px-2` per
    // cell plus an inline icon+label: at a 264px card that left ~56px of text
    // width per stat. Padding now grows with the card, and the label stacks
    // under its icon until there is room to sit beside it.
    <div className="grid grid-cols-3 gap-1 [@container(min-width:420px)]:gap-2 rounded-2xl bg-card/80 p-4 [@container(min-width:420px)]:p-6 border border-border-subtle backdrop-blur-sm shadow-sm">
      <div className={`${STAT_CELL} border-r border-border-subtle/80`}>
        <div className={STAT_LABEL}>
          <Users className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Patients</span>
        </div>
        <p className={`${STAT_VALUE} text-foreground`}>{patientsTreated}</p>
      </div>

      <div className={`${STAT_CELL} border-r border-border-subtle/80`}>
        <div className={STAT_LABEL}>
          <Award className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Success</span>
        </div>
        <p className={`${STAT_VALUE} text-emerald-600 dark:text-emerald-400`}>
          {successRate}
        </p>
      </div>

      <div className={STAT_CELL}>
        <div className={STAT_LABEL}>
          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Avg Time</span>
        </div>
        <p className={`${STAT_VALUE} text-foreground`}>{avgConsultationTime}</p>
      </div>
    </div>
  );
};
