import React from "react";
import { Tag, Globe, Clock, Cpu } from "lucide-react";

interface PatientContextBarProps {
  topic?: string | null;
  language?: string;
  lastUpdated?: string;
  aiVersion?: string;
}

export const PatientContextBar: React.FC<PatientContextBarProps> = ({
  topic = null,
  language = "English",
  lastUpdated = "Just now",
  aiVersion = "Medical AI v1.0",
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-card px-4 py-2 text-xs text-muted-foreground shadow-xs">
      <div className="flex flex-wrap items-center gap-4">
        {/* Health Topic */}
        <div className="flex items-center gap-1.5 font-medium">
          <Tag className="h-3.5 w-3.5 text-primary" />
          <span>Health Topic:</span>
          <span className="font-bold text-foreground">{topic || "No topic selected"}</span>
        </div>

        {/* Language */}
        <div className="flex items-center gap-1.5 font-medium">
          <Globe className="h-3.5 w-3.5 text-secondary" />
          <span>Language:</span>
          <span className="font-bold text-foreground">{language}</span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-tertiary" />
          <span>Last Updated:</span>
          <span className="font-bold text-foreground">{lastUpdated}</span>
        </div>
      </div>

      {/* AI Version */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-primary">
        <Cpu className="h-3.5 w-3.5" />
        <span>{aiVersion}</span>
      </div>
    </div>
  );
};
