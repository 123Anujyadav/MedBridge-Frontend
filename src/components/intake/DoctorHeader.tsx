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
    <div className="space-y-5">
      {/* Specialization Badge */}
      <div>
        <span className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary border border-primary/20">
          <Stethoscope className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{specialization}</span>
        </span>
      </div>

      {/* Doctor Name & Qualifications */}
      <div className="min-h-16 space-y-2">
        <h3 className="font-headline text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
          {name}
        </h3>
        <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
          {qualification}
        </p>
      </div>

      {/* Hospital & Experience */}
      <p className="flex min-h-10 items-center gap-2 text-xs font-medium text-muted-foreground">
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <span className="truncate">{hospital}</span>
        <span className="shrink-0">•</span>
        <span className="font-bold text-foreground shrink-0">{experience}</span>
      </p>

      {/* Rating & Verified Doctor Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex min-h-8 max-w-full flex-wrap items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1">
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

        <span className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          Verified Doctor
        </span>
      </div>
    </div>
  );
};
