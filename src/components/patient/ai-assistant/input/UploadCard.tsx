import React from "react";
import { FileText, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image" | "report" | "prescription";
  progress?: number;
}

interface UploadCardProps {
  file: AttachedFile;
  onRemove: (id: string) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ file, onRemove }) => {
  const getFileIcon = (type: AttachedFile["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4 text-tertiary" />;
      case "prescription":
      case "report":
      case "pdf":
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-container-low p-2.5 shadow-xs transition-all hover:border-primary/30 min-w-[200px] max-w-[260px]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card shadow-xs">
        {getFileIcon(file.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="font-semibold text-xs text-foreground truncate">{file.name}</p>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-container hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>{file.size}</span>
          <span className="flex items-center gap-1 font-semibold text-success">
            <CheckCircle2 className="h-3 w-3" />
            Uploaded
          </span>
        </div>

        {/* Upload Progress Bar Placeholder */}
        {file.progress !== undefined && file.progress < 100 && (
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
