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
      className={`group relative flex flex-col justify-between h-full rounded-3xl border p-8 transition-all duration-300 transform cursor-pointer backdrop-blur-sm ${
        isSelected
          ? "border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-2xl ring-4 ring-primary/20 scale-[1.01]"
          : "border-border-subtle bg-card hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-container-low/60 hover:shadow-xl"
      }`}
    >
      {/* Top Main Section Content */}
      <div className="space-y-8">
        {/* Top Avatar & Match Ring Row */}
        <div className="flex items-center justify-between gap-6">
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
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Consultation Formats:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-3 text-xs font-semibold text-foreground border border-border-subtle">
              <Video className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">Video</span>
            </div>
            <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-3 text-xs font-semibold text-foreground border border-border-subtle">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">Hospital</span>
            </div>
            <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-3 text-xs font-bold text-red-600 border border-red-500/20">
              <Zap className="h-4 w-4 shrink-0" />
              <span className="truncate">Emergency</span>
            </div>
          </div>
        </div>

        {/* Patient Trust Metrics */}
        <TrustMetrics
          patientsTreated={doctor.patientsTreated || "12,500+"}
          successRate={doctor.successRate || "98%"}
          avgConsultationTime={doctor.avgConsultationTime || "20 min"}
        />

        {/* AI Explanation Panel */}
        <AIRecommendationPanel explanation={doctor.aiExplanation} />
      </div>

      {/* Action Buttons Section - Fixed Bottom Alignment Across Cards */}
      <div className="mt-10 pt-8 border-t border-border-subtle space-y-4 shrink-0">
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
