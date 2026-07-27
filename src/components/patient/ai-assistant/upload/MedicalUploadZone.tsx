import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Image as ImageIcon, ShieldAlert } from "lucide-react";

interface MedicalUploadZoneProps {
  onFileSelected: (file: File) => void;
}

export const MedicalUploadZone: React.FC<MedicalUploadZoneProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/10 shadow-lg scale-[1.01]"
          : "border-border-subtle bg-surface-container-low hover:border-primary/50 hover:bg-surface-container"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs mb-3 animate-pulse">
        <UploadCloud className="h-7 w-7" />
      </div>

      <h4 className="font-headline font-bold text-sm text-foreground">
        Drag & Drop Medical Reports Here
      </h4>
      <p className="text-xs text-muted-foreground mt-1">
        or <span className="font-bold text-primary underline">Browse Files</span> from your device
      </p>

      {/* Supported Formats Info */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="rounded bg-card px-2 py-0.5 border border-border-subtle font-medium">
          PDF, JPG, PNG
        </span>
        <span>•</span>
        <span>Maximum Size: <strong>25 MB</strong></span>
      </div>

      {/* Medical Document Badges */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1 opacity-75">
        {[
          "Blood Report",
          "Prescription",
          "X-Ray",
          "MRI",
          "CT Scan",
          "Ultrasound",
          "ECG",
        ].map((type, idx) => (
          <span
            key={idx}
            className="rounded-full bg-card px-2 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border-subtle/60"
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
};
