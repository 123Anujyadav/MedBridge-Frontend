import React from "react";
import { Info } from "lucide-react";

export const VoiceTips: React.FC = () => {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-2.5 text-xs text-primary border border-primary/20 shadow-xs">
      <Info className="h-4 w-4 shrink-0 text-primary" />
      <span className="font-medium">
        <strong>Tip:</strong> Describe your symptoms clearly or ask about medications. You can speak naturally.
      </span>
    </div>
  );
};
