import React from "react";
import { Doctor } from "./DoctorCard";
import {
  X,
  Star,
  ShieldCheck,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  Video,
  Calendar,
  MessageSquare,
  Sparkles,
  Stethoscope,
} from "lucide-react";

interface DoctorDrawerProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  isSelected?: boolean;
}

export const DoctorDrawer: React.FC<DoctorDrawerProps> = ({
  doctor,
  isOpen,
  onClose,
  onSelectDoctor,
  isSelected = false,
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0 overflow-hidden" onClick={onClose}>
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div
            className="pointer-events-auto w-screen max-w-2xl bg-card border-l border-border-subtle shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-card/90 backdrop-blur-md p-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Stethoscope className="h-3.5 w-3.5" /> Full Physician Dossier
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container-high transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Drawer Body */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Doctor Top Overview Card */}
              <div className="flex flex-col sm:flex-row items-start gap-6 rounded-3xl bg-gradient-to-r from-primary/10 via-surface-container-low to-primary/5 p-6 border border-primary/20">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  className="h-28 w-28 md:h-32 md:w-32 rounded-2xl object-cover border-4 border-card shadow-lg shrink-0"
                />

                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-headline text-2xl font-bold text-foreground">
                      {doctor.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-primary">{doctor.qualification}</p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.department} • <strong className="text-foreground">{doctor.hospital}</strong>
                  </p>

                  <div className="flex items-center gap-4 text-xs pt-1">
                    <span className="font-bold text-foreground">{doctor.experience}</span>
                    <span>•</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                      {doctor.rating} ({doctor.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-base text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Biography
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {doctor.name} is a renowned specialist with over {doctor.experience} in diagnosing and treating complex conditions. Having led clinical teams at {doctor.hospital}, they have specialized expertise in acute symptom evaluation and patient care management.
                </p>
              </div>

              {/* Education & Qualifications */}
              <div className="space-y-3">
                <h4 className="font-headline font-bold text-base text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Education & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-surface-container-low p-3.5 border border-border-subtle">
                    <p className="font-bold text-foreground">Doctor of Medicine (MD)</p>
                    <p className="text-muted-foreground">All India Institute of Medical Sciences (AIIMS)</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-3.5 border border-border-subtle">
                    <p className="font-bold text-foreground">Fellowship in Clinical Cardiology</p>
                    <p className="text-muted-foreground">American College of Cardiology (FACC)</p>
                  </div>
                </div>
              </div>

              {/* Awards & Publications */}
              <div className="space-y-3">
                <h4 className="font-headline font-bold text-base text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Awards & Research Publications
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                  <li>National Healthcare Excellence Award in Clinical Precision</li>
                  <li>Published 14+ Peer-Reviewed Papers on Symptom Triage & Cardiology</li>
                  <li>Chief Clinical Advisor for Digital Telemedicine Guidelines</li>
                </ul>
              </div>

              {/* Patient Reviews Preview */}
              <div className="space-y-3">
                <h4 className="font-headline font-bold text-base text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Patient Reviews ({doctor.reviewCount})
                </h4>
                <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Verified Patient</span>
                    <span className="text-amber-500 font-bold">5.0 ★★★★★</span>
                  </div>
                  <p className="text-muted-foreground italic">
                    "{doctor.reviewSnippet || 'Extremely attentive and explained everything clearly.'}"
                  </p>
                </div>
              </div>

              {/* Location & Map */}
              <div className="space-y-3">
                <h4 className="font-headline font-bold text-base text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Hospital Location
                </h4>
                <div className="rounded-2xl bg-surface-container-low p-4 border border-border-subtle flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{doctor.hospital}</p>
                    <p className="text-muted-foreground">{doctor.distance} • OPD Building, 3rd Floor</p>
                  </div>
                  <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Directions
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Action Bar */}
            <div className="sticky bottom-0 z-20 border-t border-border-subtle bg-card/90 backdrop-blur-md p-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  onSelectDoctor(doctor);
                  onClose();
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-headline text-base font-bold transition-all shadow-lg cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-95"
                }`}
              >
                {isSelected ? "Doctor Selected ✓" : `Select ${doctor.name}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
