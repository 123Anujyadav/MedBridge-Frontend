import React from "react";
import { Database, BookOpen, CheckCircle, ShieldCheck } from "lucide-react";

export const SystemStatusBar: React.FC = () => {
  const metrics = [
    { label: "Knowledge Base", value: "Connected", icon: Database, color: "text-success" },
    { label: "Clinical References", value: "Available", icon: BookOpen, color: "text-primary" },
    { label: "Response Quality", value: "High", icon: CheckCircle, color: "text-tertiary" },
    { label: "Privacy", value: "Protected", icon: ShieldCheck, color: "text-success" },
  ];

  return (
    <div className="hidden lg:flex items-center gap-4 rounded-xl border border-border-subtle/60 bg-surface-container-low px-3 py-1.5 text-[11px]">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${m.color}`} />
            <span className="text-muted-foreground font-medium">{m.label}:</span>
            <span className="font-bold text-foreground">{m.value}</span>
            {idx < metrics.length - 1 && <span className="text-border-subtle ml-2">•</span>}
          </div>
        );
      })}
    </div>
  );
};
