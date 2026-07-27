import React, { useRef, useEffect } from "react";

interface TypingInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
  onDropFiles?: (files: FileList) => void;
}

export const TypingInput: React.FC<TypingInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  onDropFiles,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto expand textarea height up to 6 lines (~140px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDropFiles) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      rows={1}
      placeholder="Describe your symptoms or ask a health-related question..."
      disabled={disabled}
      maxLength={1000}
      className="w-full resize-none bg-transparent py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none custom-scrollbar min-h-[44px] max-h-[140px] leading-relaxed"
    />
  );
};
