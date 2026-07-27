import React, { useState } from "react";
import { DoctorCard, Doctor } from "./DoctorCard";
import { DoctorDrawer } from "./DoctorDrawer";
import { ComparisonModal } from "./ComparisonModal";
import { SelectedDoctorFooter } from "./SelectedDoctorFooter";
import { Sparkles, SlidersHorizontal, Stethoscope, ArrowRight, ArrowLeft } from "lucide-react";

export const MOCK_RECOMMENDED_DOCTORS: Doctor[] = [
  {
    id: "doc-101",
    name: "Dr. Rajesh Sharma, MD",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    qualification: "MD, DM (Cardiology), FACC",
    specialization: "Cardiologist",
    experience: "18 Years Experience",
    hospital: "Max Super Speciality Hospital",
    department: "Department of Cardiology",
    languages: ["English", "Hindi", "Punjabi"],
    consultationFee: "₹800",
    rating: 4.9,
    reviewCount: 2341,
    reviewSnippet: "Dr. Sharma was extremely thorough and diagnosed my chest issue immediately.",
    isOnline: true,
    todayAvailable: true,
    nextSlot: "Today, 4:30 PM",
    distance: "1.8 km away",
    consultationTypes: ["video", "in-person", "emergency"],
    matchScore: 98,
    recommendationReasons: [
      "Chest Pain Expert",
      "Hypertension Specialist",
      "High Patient Satisfaction",
      "Available Today",
    ],
    patientsTreated: "14,200+",
    successRate: "99%",
    avgConsultationTime: "25 min",
    aiExplanation: "Based on your symptoms, Dr. Sharma has the highest clinical expertise in acute chest pain, hypertension and emergency cardiac triage.",
  },
  {
    id: "doc-102",
    name: "Dr. Ananya Roy, DM",
    photoUrl: "https://images.unsplash.com/photo-1594824813571-24a69c100dd3?w=400&auto=format&fit=crop&q=80",
    qualification: "MD, DM (Internal Medicine)",
    specialization: "Internal Medicine Specialist",
    experience: "14 Years Experience",
    hospital: "Apollo Healthcare City",
    department: "Department of Medicine",
    languages: ["English", "Hindi", "Bengali"],
    consultationFee: "₹750",
    rating: 4.85,
    reviewCount: 1890,
    reviewSnippet: "Very calm and observant physician. Solved my chronic fatigue timeline.",
    isOnline: true,
    todayAvailable: true,
    nextSlot: "Today, 5:15 PM",
    distance: "3.2 km away",
    consultationTypes: ["video", "in-person"],
    matchScore: 95,
    recommendationReasons: [
      "Acute Symptom Triage",
      "Hypertension Management",
      "Top Rated Physician",
      "Available Today",
    ],
    patientsTreated: "11,800+",
    successRate: "97%",
    avgConsultationTime: "20 min",
    aiExplanation: "Dr. Roy specializes in differential diagnosis for multi-symptom presentations and systemic health evaluations.",
  },
  {
    id: "doc-103",
    name: "Dr. Vikramaditya Sen, FESC",
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    qualification: "MS, DNB (Cardiothoracic Surgery)",
    specialization: "Cardiothoracic Surgeon",
    experience: "22 Years Experience",
    hospital: "Fortis Escorts Heart Institute",
    department: "Cardiovascular Surgery",
    languages: ["English", "Hindi"],
    consultationFee: "₹1,200",
    rating: 4.95,
    reviewCount: 3120,
    reviewSnippet: "Senior cardiologist with incredible clinical clarity and surgical expertise.",
    isOnline: false,
    todayAvailable: true,
    nextSlot: "Tomorrow, 10:00 AM",
    distance: "5.1 km away",
    consultationTypes: ["video", "in-person", "emergency"],
    matchScore: 89,
    recommendationReasons: [
      "20+ Yrs Cardiac Tenure",
      "Valve & Angina Expert",
      "Senior Department Chair",
      "High Referral Rate",
    ],
    patientsTreated: "18,500+",
    successRate: "99.2%",
    avgConsultationTime: "30 min",
    aiExplanation: "Dr. Sen provides advanced cardiothoracic consultation for complex cardiovascular presentations.",
  },
];

interface RecommendedDoctorsSectionProps {
  hasGeneratedCase?: boolean;
  isLoading?: boolean;
  onConfirmDoctorRouting?: (doctor: Doctor, type: "video" | "in-person") => void;
}

export const RecommendedDoctorsSection: React.FC<RecommendedDoctorsSectionProps> = ({
  hasGeneratedCase = true,
  isLoading = false,
  onConfirmDoctorRouting,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [drawerDoctor, setDrawerDoctor] = useState<Doctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [mobileIndex, setMobileIndex] = useState<number>(0);

  const selectedDoctor = MOCK_RECOMMENDED_DOCTORS.find((d) => d.id === selectedDoctorId) || null;

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
  };

  const handleViewProfile = (doctor: Doctor) => {
    setDrawerDoctor(doctor);
    setIsDrawerOpen(true);
  };

  return (
    <div className="rounded-3xl border border-border-subtle bg-card p-8 shadow-card space-y-10">
      {/* Title & Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-b border-border-subtle pb-10">
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

          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Recommended Specialists
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl border border-border-subtle p-8 bg-card space-y-8 animate-pulse">
              <div className="flex items-center justify-between gap-6">
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

      {/* State 3: Active Recommended Doctors Display */}
      {!isLoading && hasGeneratedCase && (
        <div className="space-y-8">
          {/* Desktop Grid (3 columns) & Tablet (2 columns) - items-stretch for identical height */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {MOCK_RECOMMENDED_DOCTORS.map((doc) => (
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
              doctor={MOCK_RECOMMENDED_DOCTORS[mobileIndex]}
              isSelected={selectedDoctorId === MOCK_RECOMMENDED_DOCTORS[mobileIndex].id}
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
                {mobileIndex + 1} of {MOCK_RECOMMENDED_DOCTORS.length}
              </span>

              <button
                type="button"
                onClick={() => setMobileIndex((prev) => Math.min(MOCK_RECOMMENDED_DOCTORS.length - 1, prev + 1))}
                disabled={mobileIndex === MOCK_RECOMMENDED_DOCTORS.length - 1}
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
        doctors={MOCK_RECOMMENDED_DOCTORS}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectDoctor={(doc) => handleSelectDoctor(doc)}
        selectedDoctorId={selectedDoctorId}
      />
    </div>
  );
};

export const RecommendedDoctors = RecommendedDoctorsSection;
