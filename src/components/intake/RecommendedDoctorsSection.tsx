import React, { useState } from "react";
import { DoctorCard, Doctor } from "./DoctorCard";
import { DoctorDrawer } from "./DoctorDrawer";
import { ComparisonModal } from "./ComparisonModal";
import { SelectedDoctorFooter } from "./SelectedDoctorFooter";
import { Sparkles, SlidersHorizontal, Stethoscope, ArrowRight, ArrowLeft } from "lucide-react";

interface RecommendedDoctorsSectionProps {
  hasGeneratedCase?: boolean;
  isLoading?: boolean;
  /**
   * The clinicians the intake agent ranked for this case, already mapped onto
   * the card view model. These are rows from the `doctors` table; selecting one
   * is what the case is routed to.
   *
   * This component previously rendered three module-level constants — invented
   * names, hospitals, fees, review counts and match scores that matched no
   * record anywhere — regardless of the patient's symptoms, and the id of the
   * chosen "doctor" (`doc-101`) could never be routed to.
   */
  doctors?: Doctor[];
  onConfirmDoctorRouting?: (doctor: Doctor, type: "video" | "in-person") => void;
  /** True while the case is being routed, to hold the confirm control. */
  isRouting?: boolean;
}

/**
 * Column tracks for the recommendation grid.
 *
 * Fixed column counts (`lg:grid-cols-3`) were the cause of the cramped card:
 * they key off the *viewport*, but this section sits inside an 8-of-12 column,
 * so at 1280px three columns left each card roughly 160px wide — narrower than
 * the avatar and match ring it has to seat side by side. `auto-fit` with a
 * floor lets the row take as many cards as genuinely fit and stretch them to
 * fill, which is also why there is no leftover gutter on the right.
 */
const DOCTOR_GRID =
  "grid grid-cols-[repeat(auto-fit,minmax(256px,1fr))] gap-6 items-stretch";

export const RecommendedDoctorsSection: React.FC<RecommendedDoctorsSectionProps> = ({
  hasGeneratedCase = true,
  isLoading = false,
  doctors = [],
  onConfirmDoctorRouting,
  isRouting = false,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [drawerDoctor, setDrawerDoctor] = useState<Doctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [mobileIndex, setMobileIndex] = useState<number>(0);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || null;

  // A new set of recommendations invalidates any previous selection, and the
  // carousel index must not point past the end of a shorter list.
  React.useEffect(() => {
    setSelectedDoctorId(null);
    setMobileIndex(0);
  }, [doctors]);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
  };

  const handleViewProfile = (doctor: Doctor) => {
    setDrawerDoctor(doctor);
    setIsDrawerOpen(true);
  };

  return (
    // `container-type` here for the same reason as on the card: this section is
    // itself only ~380px wide at 1024px, so `sm:`/`md:` were putting its header
    // into a row that could not hold the title and the compare button.
    <div className="[container-type:inline-size] rounded-3xl border border-border-subtle bg-card p-5 sm:p-6 lg:p-8 shadow-card space-y-8">
      {/* Title & Header Bar */}
      <div className="flex flex-col [@container(min-width:560px)]:flex-row items-start [@container(min-width:560px)]:items-center justify-between gap-6 border-b border-border-subtle pb-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 items-center gap-2 rounded-full bg-primary/10 px-4 text-xs font-bold text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              AI Specialist Matching
            </span>
            <span className="inline-flex h-8 items-center rounded-full bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
              Top 3 Matched Physicians
            </span>
          </div>

          <h2 className="font-headline text-2xl [@container(min-width:560px)]:text-3xl font-bold tracking-tight text-foreground">
            Recommended Specialists
          </h2>
          <p className="text-xs [@container(min-width:560px)]:text-sm text-muted-foreground leading-relaxed">
            Based on your symptoms, AI recommends the following specialists for your consultation.
          </p>
        </div>

        {/* Comparison Action Button */}
        <button
          type="button"
          onClick={() => setIsComparisonOpen(true)}
          className="flex h-12 items-center gap-2 rounded-2xl border border-border-subtle bg-surface-container-low px-6 text-xs font-bold text-foreground hover:bg-card hover:border-primary/40 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
          <span>Compare Doctors</span>
        </button>
      </div>

      {/* State 1: Skeleton Loading */}
      {isLoading && (
        // Same track definition as the loaded grid below, so the skeleton and
        // the real cards occupy identical columns and swapping one for the
        // other shifts nothing.
        <div className={DOCTOR_GRID}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl border border-border-subtle p-6 bg-card space-y-6 animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="h-28 w-28 rounded-full bg-surface-container-high shrink-0" />
                <div className="h-14 w-14 rounded-full bg-surface-container-high shrink-0" />
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-surface-container-high rounded w-3/4" />
                <div className="h-4 bg-surface-container-high rounded w-1/2" />
              </div>
              <div className="h-20 bg-surface-container-high rounded-2xl" />
              <div className="h-14 bg-surface-container-high rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* State 2: Empty State (Case not generated yet) */}
      {!isLoading && !hasGeneratedCase && (
        <div className="flex flex-col items-center justify-center text-center p-10 md:p-14 rounded-3xl bg-surface-container-low/60 border border-dashed border-border-subtle space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h3 className="font-headline font-bold text-lg text-foreground">
            Doctor recommendations will appear after your medical case is generated.
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed">
            Describe your symptoms above and click <strong>Generate Medical Case</strong>. AI will evaluate your clinical summary and present the top matched specialists.
          </p>
        </div>
      )}

      {/* State 3a: Case generated but no clinician matched */}
      {!isLoading && hasGeneratedCase && doctors.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 md:p-14 rounded-3xl bg-surface-container-low/60 border border-dashed border-border-subtle space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h3 className="font-headline font-bold text-lg text-foreground">
            No specialist is currently available for this case.
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed">
            Your case has been analysed, but no clinician in the matched
            speciality is accepting cases right now. Please try again shortly,
            or book an appointment directly. If this is urgent, contact
            emergency services.
          </p>
        </div>
      )}

      {/* State 3b: Active Recommended Doctors Display */}
      {!isLoading && hasGeneratedCase && doctors.length > 0 && (
        <div className="space-y-8">
          {/* Desktop / tablet grid — see DOCTOR_GRID. items-stretch keeps every
              card the same height regardless of content length. */}
          <div className={`hidden md:grid ${DOCTOR_GRID}`}>
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                isSelected={selectedDoctorId === doc.id}
                onSelect={handleSelectDoctor}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Mobile Swipeable / Carousel View */}
          <div className="block md:hidden space-y-6">
            <DoctorCard
              doctor={doctors[Math.min(mobileIndex, doctors.length - 1)]}
              isSelected={
                selectedDoctorId ===
                doctors[Math.min(mobileIndex, doctors.length - 1)].id
              }
              onSelect={handleSelectDoctor}
              onViewProfile={handleViewProfile}
            />

            {/* Carousel Controls */}
            <div className="flex items-center justify-between pt-4 px-2">
              <button
                type="button"
                onClick={() => setMobileIndex((prev) => Math.max(0, prev - 1))}
                disabled={mobileIndex === 0}
                className="flex h-10 items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>

              <span className="text-xs font-mono font-bold text-primary">
                {Math.min(mobileIndex, doctors.length - 1) + 1} of {doctors.length}
              </span>

              <button
                type="button"
                onClick={() => setMobileIndex((prev) => Math.min(doctors.length - 1, prev + 1))}
                disabled={mobileIndex >= doctors.length - 1}
                className="flex h-10 items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sticky Bottom Panel rendered after Doctor Selection */}
          {selectedDoctor && (
            <SelectedDoctorFooter
              selectedDoctor={selectedDoctor}
              isRouting={isRouting}
              onConfirmRouting={(doc, type) => {
                onConfirmDoctorRouting?.(doc, type);
              }}
            />
          )}
        </div>
      )}

      {/* Doctor Profile Drawer */}
      <DoctorDrawer
        doctor={drawerDoctor}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectDoctor={(doc) => handleSelectDoctor(doc)}
        isSelected={selectedDoctorId === drawerDoctor?.id}
      />

      {/* Side-by-side Comparison Modal */}
      <ComparisonModal
        doctors={doctors}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectDoctor={(doc) => handleSelectDoctor(doc)}
        selectedDoctorId={selectedDoctorId}
      />
    </div>
  );
};

export const RecommendedDoctors = RecommendedDoctorsSection;
