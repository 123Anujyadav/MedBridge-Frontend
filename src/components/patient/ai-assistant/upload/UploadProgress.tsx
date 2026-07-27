import React from "react";
import { Loader2, RotateCcw, X } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  fileName: string;
  fileSize: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  fileSize,
  onCancel,
  onRetry,
}) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card space-y-3 animate-fade-in">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <span className="font-bold text-foreground truncate">{fileName}</span>
        </div>
        <span className="font-mono font-bold text-primary">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{fileSize} • Est. 0.5s remaining</span>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1 font-semibold text-destructive hover:underline"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
