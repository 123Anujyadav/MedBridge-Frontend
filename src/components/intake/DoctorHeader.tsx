import React from "react";
import { Star, ShieldCheck, Stethoscope, Building2 } from "lucide-react";

interface DoctorHeaderProps {
  name: string;
  qualification: string;
  specialization: string;
  hospital: string;
  experience: string;
  rating: number;
  reviewCount: number;
}

/**
 * One pill geometry for every badge in the card.
 *
 * These previously drifted — px-4 here, font-bold there — which is what made
 * the row read as misaligned even though each badge was fine on its own. Only
 * colour varies now; height, padding, gap and text weight do not.
 */
const BADGE =
  "inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold";

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  name,
  qualification,
  specialization,
  hospital,
  experience,
  rating,
  reviewCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Specialization Badge */}
      <div>
        <span className={`${BADGE} bg-primary/10 text-primary border-primary/20`}>
          <Stethoscope className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{specialization}</span>
        </span>
      </div>

      {/* Doctor Name & Qualifications. `min-h-16` reserves two lines, so a name
          that wraps does not push the sections below it down. */}
      <div className="min-h-16 space-y-1.5">
        <h3 className="font-headline text-xl [@container(min-width:480px)]:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug break-words hyphens-none">
          {name}
        </h3>
        <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
          {qualification}
        </p>
      </div>

      {/* Hospital & Experience */}
      <p className="flex min-h-10 min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <span className="truncate">{hospital}</span>
        <span className="shrink-0">•</span>
        <span className="font-bold text-foreground shrink-0">{experience}</span>
      </p>

      {/* Rating & Verified Doctor Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={`${BADGE} border-amber-500/20 bg-amber-500/10 flex-wrap`}>
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 shrink-0 ${
                  i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-foreground">{rating.toFixed(1)}</span>
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
            ({reviewCount.toLocaleString()} Reviews)
          </span>
        </div>

        <span className={`${BADGE} border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          Verified Doctor
        </span>
      </div>
    </div>
  );
};
