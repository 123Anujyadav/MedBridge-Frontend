import React from "react";
import { DoctorAvatar } from "./DoctorAvatar";
import { MatchScoreRing } from "./MatchScoreRing";
import { DoctorHeader } from "./DoctorHeader";
import { ConsultationInfo } from "./ConsultationInfo";
import { RecommendationChips } from "./RecommendationChips";
import { TrustMetrics } from "./TrustMetrics";
import { AIRecommendationPanel } from "./AIRecommendationPanel";
import { Check, Video, Building2, Zap, Eye, ChevronRight } from "lucide-react";

export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  qualification: string;
  experience: string;
  hospital: string;
  specialization: string;
  department: string;
  languages: string[];
  consultationFee: string;
  rating: number;
  reviewCount: number;
  reviewSnippet?: string;
  isOnline: boolean;
  todayAvailable: boolean;
  nextSlot: string;
  distance: string;
  consultationTypes: ("video" | "in-person" | "emergency")[];
  matchScore: number;
  recommendationReasons: string[];
  patientsTreated?: string;
  successRate?: string;
  avgConsultationTime?: string;
  aiExplanation?: string;
}

/** Shared geometry for the three consultation-format tiles. */
const FORMAT_TILE =
  "flex min-w-0 h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold border " +
  "[@container(min-width:400px)]:h-12 [@container(min-width:400px)]:flex-row [@container(min-width:400px)]:gap-2 " +
  "[@container(min-width:400px)]:px-3 [@container(min-width:400px)]:text-xs";

const FORMAT_ICON = "h-4 w-4 shrink-0";

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doctor: Doctor) => void;
  onViewProfile?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isSelected,
  onSelect,
  onViewProfile,
}) => {
  return (
    <div
      onClick={() => onSelect(doctor)}
      /*
       * `[container-type:inline-size]` makes this card the reference for the
       * `@container` queries used throughout its subtree. Every internal
       * breakpoint below reads the *card's* width; viewport breakpoints are
       * wrong here, because the card is three-across inside an 8-of-12 column
       * and a wide viewport does not imply a wide card.
       *
       * Card-width breakpoints, used consistently by every child:
       *   340px — avatar and match ring sit side by side
       *   380px — stat labels go icon-beside-text
       *   420px — roomier padding inside the card's own panels
       *   560px — consultation facts open out to five across
       *
       * The card's own padding is deliberately a flat `p-6`, not a query: an
       * element is not matched by its own container, so a query here would be
       * answered by the *section's* width and would widen the padding of a
       * 260px card just because the section around it was roomy.
       */
      className={`group relative flex flex-col justify-between h-full [container-type:inline-size] rounded-3xl border p-6 transition-all duration-300 transform cursor-pointer backdrop-blur-sm ${
        isSelected
          ? "border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-2xl ring-4 ring-primary/20 scale-[1.01]"
          : "border-border-subtle bg-card hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-container-low/60 hover:shadow-xl"
      }`}
    >
      {/* Top Main Section Content */}
      <div className="space-y-6">
        {/* Top Avatar & Match Ring Row — stacked and centred until the card is
            wide enough to seat both without crowding. */}
        <div className="flex flex-col items-center gap-4 [@container(min-width:340px)]:flex-row [@container(min-width:340px)]:items-center [@container(min-width:340px)]:justify-between">
          <DoctorAvatar
            photoUrl={doctor.photoUrl}
            name={doctor.name}
            isOnline={doctor.isOnline}
            size="lg"
          />

          <MatchScoreRing score={doctor.matchScore} label="Best Match" />
        </div>

        {/* Doctor Main Header Info */}
        <DoctorHeader
          name={doctor.name}
          qualification={doctor.qualification}
          specialization={doctor.specialization || "Cardiologist"}
          hospital={doctor.hospital}
          experience={doctor.experience}
          rating={doctor.rating}
          reviewCount={doctor.reviewCount}
        />

        {/* Consultation Info Grid */}
        <ConsultationInfo
          fee={doctor.consultationFee}
          languages={doctor.languages}
          distance={doctor.distance}
          nextSlot={doctor.nextSlot}
          isOnline={doctor.isOnline}
        />

        {/* Why AI Recommended Chips */}
        <RecommendationChips reasons={doctor.recommendationReasons} />

        {/* Consultation Options Icon Buttons */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Consultation Formats:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* One geometry for all three tiles — same height, icon size, label
                size and weight — so only colour distinguishes them. "Emergency"
                is the longest label and set the old truncation point, hence the
                icon-over-label stack until the card can seat them in a row. */}
            <div className={`${FORMAT_TILE} bg-surface-container-high text-foreground border-border-subtle`}>
              <Video className={`${FORMAT_ICON} text-primary`} />
              <span className="truncate">Video</span>
            </div>
            <div className={`${FORMAT_TILE} bg-surface-container-high text-foreground border-border-subtle`}>
              <Building2 className={`${FORMAT_ICON} text-primary`} />
              <span className="truncate">Hospital</span>
            </div>
            <div className={`${FORMAT_TILE} bg-red-500/10 text-red-600 border-red-500/20`}>
              <Zap className={FORMAT_ICON} />
              <span className="truncate">Emergency</span>
            </div>
          </div>
        </div>

        {/* Patient Trust Metrics */}
        {/*
          No fallback figures. `intake-mapping` sets all three to `undefined`
          because the platform records none of them, so these `||` defaults did
          not cover an occasional gap — they fired for every doctor, every time,
          presenting an invented "98% success rate" to a patient choosing care.
          `TrustMetrics` already renders "—" for a value it does not have.
        */}
        <TrustMetrics
          patientsTreated={doctor.patientsTreated}
          successRate={doctor.successRate}
          avgConsultationTime={doctor.avgConsultationTime}
        />

        {/* AI Explanation Panel */}
        <AIRecommendationPanel explanation={doctor.aiExplanation} />
      </div>

      {/* Action Buttons Section - Fixed Bottom Alignment Across Cards */}
      <div className="mt-8 pt-6 border-t border-border-subtle space-y-3 shrink-0">
        {/* Primary CTA: Select This Doctor (56px high) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(doctor);
          }}
          className={`w-full h-14 flex items-center justify-center gap-2 rounded-2xl px-6 font-headline text-base font-bold transition-all duration-300 shadow-md cursor-pointer ${
            isSelected
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary animate-pulse-soft"
              : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
          }`}
        >
          {isSelected ? (
            <>
              <Check className="h-5 w-5 stroke-[3] animate-bounce" />
              Selected ✓
            </>
          ) : (
            <>Select This Doctor</>
          )}
        </button>

        {/* Secondary Action: View Full Profile (40px high) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.(doctor);
          }}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>View Full Profile</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
