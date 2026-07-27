import React from "react";

export const CAPABILITIES = [
  { label: "Medical AI", icon: "🧠", tooltip: "Custom Clinical Neural Model" },
  { label: "Medical Knowledge", icon: "📚", tooltip: "WHO & CDC Evidence Dataset" },
  { label: "RAG Enabled", icon: "🔍", tooltip: "Retrieval-Augmented Generation" },
  { label: "Live Guidelines", icon: "🌐", tooltip: "Real-time Medical Protocols" },
  { label: "Secure", icon: "🛡", tooltip: "HIPAA & Encrypted Privacy" },
  { label: "Fast Response", icon: "⚡", tooltip: "Low-latency Processing" },
];

export const CapabilityBadges: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar no-scrollbar max-w-full">
      {CAPABILITIES.map((cap, idx) => (
        <div key={idx} className="relative group shrink-0">
          <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 shadow-xs cursor-default">
            <span>{cap.icon}</span>
            <span>{cap.label}</span>
          </div>

          {/* Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex items-center justify-center whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-semibold text-background shadow-md pointer-events-none z-30 animate-fade-in">
            {cap.tooltip}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
};
