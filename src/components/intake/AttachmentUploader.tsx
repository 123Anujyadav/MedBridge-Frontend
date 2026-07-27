import React, { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, TestTube, FileCheck, ShieldAlert, X, Check, Paperclip, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  category: string;
  uploadDate: string;
  file?: File;
}

const DOCUMENT_CATEGORIES = [
  { label: "Blood Reports", icon: TestTube, color: "text-red-500 bg-red-500/10" },
  { label: "Prescriptions", icon: FileText, color: "text-blue-500 bg-blue-500/10" },
  { label: "Medical Images", icon: ImageIcon, color: "text-purple-500 bg-purple-500/10" },
  { label: "Lab Reports", icon: FileCheck, color: "text-emerald-500 bg-emerald-500/10" },
  { label: "Insurance Documents", icon: ShieldAlert, color: "text-amber-500 bg-amber-500/10" },
];

interface AttachmentUploaderProps {
  attachments: AttachmentItem[];
  onAddAttachment: (file: File, category: string) => void;
  onRemoveAttachment: (id: string) => void;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("Medical Images");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      onAddAttachment(file, selectedCategory);
      toast({
        title: "Attachment Added",
        description: `${file.name} categorised under ${selectedCategory}.`,
      });
    });
  };

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
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="rounded-3xl border border-border-subtle bg-card p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline text-lg font-bold text-foreground flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            Medical Attachments & Reports
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Attach blood reports, lab work, prescriptions, images or insurance files for doctor context.
          </p>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {attachments.length} Attached
        </span>
      </div>

      {/* Document Category Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Select Document Type for Upload:
        </label>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border-subtle bg-card text-muted-foreground hover:bg-surface-container-low"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary-foreground" : ""}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border-subtle bg-surface-container-low/50 hover:border-primary/40 hover:bg-surface-container-low"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.dicom,.doc,.docx"
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Upload className="h-7 w-7" />
        </div>

        <p className="mt-3 font-semibold text-sm text-foreground">
          Drag & Drop medical files here or <span className="text-primary underline">Browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supported: Blood Reports, Prescriptions, Medical X-Rays, Lab Reports, Insurance (PDF, PNG, JPG up to 25MB)
        </p>
      </div>

      {/* Uploaded Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Uploaded Files ({attachments.length}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-container-lowest p-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{att.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="text-primary font-medium">{att.category}</span>
                      <span>•</span>
                      <span>{att.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(att.id);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-lg"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
