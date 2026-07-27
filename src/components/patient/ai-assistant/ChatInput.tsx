import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SuggestionChips } from "./input/SuggestionChips";
import { AttachmentPreview } from "./input/AttachmentPreview";
import { type AttachedFile } from "./input/UploadCard";
import { TypingInput } from "./input/TypingInput";
import { InputToolbar } from "./input/InputToolbar";
import { VoiceModal } from "./voice/VoiceModal";
import { MedicalUploadModal } from "./upload/MedicalUploadModal";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isThinking?: boolean;
  onStopGeneration?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  isThinking = false,
  onStopGeneration,
}) => {
  const { toast } = useToast();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // Suggestion Chip Click -> Populates input ONLY (does NOT auto-send)
  const handleSelectChip = (chipText: string) => {
    onChange(value ? `${value}\n${chipText}` : chipText);
    toast({
      title: "Query Loaded",
      description: "Suggestion populated in input box. Click Send when ready.",
    });
  };

  const handleDocumentAttached = (docName: string) => {
    const mockFile: AttachedFile = {
      id: `file-${Date.now()}`,
      name: docName,
      size: "1.4 MB",
      type: docName.match(/\.(jpg|jpeg|png)$/i) ? "image" : "report",
      progress: 100,
    };
    setAttachedFiles((prev) => [...prev, mockFile]);
  };

  const handleDropFiles = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      const mockFile: AttachedFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes("image") ? "image" : "pdf",
        progress: 100,
      };
      setAttachedFiles((prev) => [...prev, mockFile]);
      toast({
        title: "File Dropped & Attached",
        description: `${file.name} ready for AI assessment.`,
      });
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleTranscriptCaptured = (text: string) => {
    onChange(value ? `${value} ${text}` : text);
    toast({
      title: "Voice Audio Transcribed",
      description: "Voice speech transcribed into input box. Click Send when ready.",
    });
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="sticky bottom-0 border-t border-border-subtle bg-card/95 backdrop-blur-md p-4 shadow-card space-y-2 rounded-b-2xl">
      {/* Voice Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptCaptured={handleTranscriptCaptured}
      />

      {/* Medical Document Upload Modal */}
      <MedicalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentAttached={handleDocumentAttached}
      />

      {/* 1. Quick Action Suggestion Chips */}
      <SuggestionChips onSelectChip={handleSelectChip} />

      {/* 2. File Attachment Previews */}
      <AttachmentPreview files={attachedFiles} onRemoveFile={handleRemoveFile} />

      {/* 3. Main Glassmorphic Input Container */}
      <div className="rounded-2xl border border-border-subtle bg-surface-container-low p-2 shadow-xs transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {/* Textarea */}
        <TypingInput
          value={value}
          onChange={onChange}
          onSend={onSend}
          disabled={disabled}
          onDropFiles={handleDropFiles}
        />

        {/* Input Toolbar */}
        <InputToolbar
          value={value}
          onClear={handleClear}
          onSend={onSend}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onAttachClick={() => setIsUploadModalOpen(true)}
          disabled={disabled}
          isThinking={isThinking}
          onStopGeneration={onStopGeneration}
        />
      </div>

      {/* Keyboard Shortcuts Helper & Disclaimer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-mono">
            <strong>Enter</strong> to Send
          </span>
          <span>•</span>
          <span className="font-mono">
            <strong>Shift + Enter</strong> for line break
          </span>
        </div>

        <span className="text-[10px] text-muted-foreground/80">
          MedBridge AI Medical Triage • Not a replacement for emergency care (911)
        </span>
      </div>
    </div>
  );
};
