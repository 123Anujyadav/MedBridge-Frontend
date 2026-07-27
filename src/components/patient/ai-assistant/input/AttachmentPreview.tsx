import React from "react";
import { UploadCard, type AttachedFile } from "./UploadCard";

interface AttachmentPreviewProps {
  files: AttachedFile[];
  onRemoveFile: (id: string) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  files,
  onRemoveFile,
}) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
      {files.map((file) => (
        <UploadCard key={file.id} file={file} onRemove={onRemoveFile} />
      ))}
    </div>
  );
};
