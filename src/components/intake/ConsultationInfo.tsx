import React from "react";
import { DollarSign, Globe, MapPin, Clock, Radio } from "lucide-react";

interface ConsultationInfoProps {
  fee: string;
  languages: string[];
  distance: string;
  nextSlot: string;
  isOnline?: boolean;
}

export const ConsultationInfo: React.FC<ConsultationInfoProps> = ({
  fee,
  languages,
  distance,
  nextSlot,
  isOnline = true,
}) => {
  const items = [
    {
      icon: DollarSign,
      label: "Fee",
      value: fee,
      highlight: true,
    },
    {
      icon: Globe,
      label: "Languages",
      value: languages.join(", "),
    },
    {
      icon: MapPin,
      label: "Distance",
      value: distance,
    },
    {
      icon: Clock,
      label: "Next Slot",
      value: nextSlot,
      highlight: true,
    },
    {
      icon: Radio,
      label: "Status",
      // The false branch used to read "Available Today", so a clinician who is
      // offline or on leave was still advertised to the patient as available.
      value: isOnline ? "Online Now" : "Unavailable",
    },
  ];

  return (
    // Two across until the card is genuinely wide, then all five. `sm:` was a
    // viewport breakpoint, so five 60px-wide tiles were being rendered inside a
    // narrow card on a large screen. There is no three- or four-column step
    // because five items only tile without a gap at two or five across — the
    // last item spans the pair in the two-column case.
    <div className="grid grid-cols-2 [@container(min-width:560px)]:grid-cols-5 gap-2">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex min-h-20 min-w-0 flex-col justify-between gap-2 rounded-2xl bg-surface-container-low p-3 [@container(min-width:420px)]:p-4 border border-border-subtle hover:border-primary/30 transition-colors last:col-span-2 [@container(min-width:560px)]:last:col-span-1"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            <p
              className={`truncate text-xs font-bold ${
                item.highlight ? "text-primary font-mono text-sm" : "text-foreground"
              }`}
            >
              {/* An em-dash, not a blank cell, when the platform holds no
                  value — the grid keeps its shape and the gap reads as
                  "not recorded" rather than as a rendering fault. */}
              {item.value?.toString().trim() || "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
};
