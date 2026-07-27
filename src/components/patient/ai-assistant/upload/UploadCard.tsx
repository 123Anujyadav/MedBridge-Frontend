import React from "react";
import { FileText, Image as ImageIcon, CheckCircle2, Eye, Download, X, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface MedicalDoc {
  id: string;
  name: string;
  size: string;
  uploadTime: string;
  docType: "Blood Test" | "Prescription" | "Radiology" | "Lab Report" | "ECG" | "General";
  status: "Uploaded" | "Analyzing" | "Error";
}

interface UploadCardProps {
  doc: MedicalDoc;
  onRemove: (id: string) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ doc, onRemove }) => {
  const { toast } = useToast();

  const handlePreview = () => {
    toast({
      title: "Document Preview",
      description: `Opening preview modal for ${doc.name}.`,
    });
  };

  const handleDownload = () => {
    toast({
      title: "Downloading Document",
      description: `Downloading ${doc.name}...`,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-card p-3.5 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
          {doc.name.match(/\.(jpg|jpeg|png)$/i) ? (
            <ImageIcon className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-xs text-foreground truncate">{doc.name}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" />
              {doc.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span>{doc.size}</span>
            <span>•</span>
            <span>{doc.uploadTime}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 font-semibold text-primary">
              <Tag className="h-2.5 w-2.5" />
              {doc.docType}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={handlePreview}
          className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-container-low px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-container-low px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Download</span>
        </button>

        <button
          type="button"
          onClick={() => onRemove(doc.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          title="Remove Document"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
