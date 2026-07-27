import React, { useState } from "react";
import { SecurityBanner } from "./SecurityBanner";
import { MedicalUploadZone } from "./MedicalUploadZone";
import { UploadProgress } from "./UploadProgress";
import { UploadCard, type MedicalDoc } from "./UploadCard";
import { AnalysisPlaceholder } from "./AnalysisPlaceholder";
import { QuickActions } from "./QuickActions";
import { X, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAttached?: (docName: string) => void;
}

export const REPORT_CATEGORIES = [
  "Blood Test",
  "Prescription",
  "Radiology",
  "Lab Report",
  "Heart Report",
  "Diabetes Report",
  "Kidney Report",
  "Liver Report",
];

export const MedicalUploadModal: React.FC<MedicalUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAttached,
}) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("Blood Test");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [documents, setDocuments] = useState<MedicalDoc[]>([
    {
      id: "doc-1",
      name: "CBC_Blood_Panel_Report.pdf",
      size: "1.4 MB",
      uploadTime: "Today, 10:45 AM",
      docType: "Blood Test",
      status: "Uploaded",
    },
  ]);

  if (!isOpen) return null;

  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          const newDoc: MedicalDoc = {
            id: `doc-${Date.now()}`,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadTime: "Just now",
            docType: selectedCategory as MedicalDoc["docType"],
            status: "Uploaded",
          };

          setDocuments((prevDocs) => [newDoc, ...prevDocs]);
          onDocumentAttached?.(file.name);
          toast({
            title: "Medical Report Uploaded",
            description: `${file.name} successfully attached for clinical triage.`,
          });
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast({
      title: "Document Removed",
      description: "Medical report removed from active session.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border-subtle bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-foreground tracking-tight">
                Upload Medical Reports & Documents
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Upload lab reports, prescriptions, or imaging files for AI triage analysis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Security Banner */}
        <SecurityBanner />

        {/* Category Chips */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Select Document Category
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
            {REPORT_CATEGORIES.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 shadow-xs active:scale-95 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border border-primary"
                      : "border border-border-subtle bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <MedicalUploadZone onFileSelected={handleFileSelected} />

        {/* Progress Bar (While Uploading) */}
        {isUploading && pendingFile && (
          <UploadProgress
            progress={uploadProgress}
            fileName={pendingFile.name}
            fileSize={`${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`}
            onCancel={() => setIsUploading(false)}
          />
        )}

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Attached Medical Reports ({documents.length})</span>
            </h4>
            <div className="space-y-2">
              {documents.map((doc) => (
                <UploadCard key={doc.id} doc={doc} onRemove={handleRemoveDoc} />
              ))}
            </div>
          </div>
        )}

        {/* AI Report Analysis Placeholder */}
        <AnalysisPlaceholder />

        {/* Quick Report Actions */}
        <QuickActions />

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border-subtle bg-surface-container px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
