import React from "react";
import { Check } from "lucide-react";

interface RecommendationChipsProps {
  reasons: string[];
}

export const RecommendationChips: React.FC<RecommendationChipsProps> = ({ reasons }) => {
  const displayChips = reasons.slice(0, 4);

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
        AI Highlights:
      </span>
      {/* `min-h-20` reserves two rows of chips so cards with fewer reasons stay
          the same height as cards with more, and nothing reflows as they load. */}
      <div className="flex min-h-20 flex-wrap content-start gap-2">
        {displayChips.map((chip, idx) => (
          <span
            key={idx}
            className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
          >
            <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3] shrink-0" />
            {/* The tick is `shrink-0`, so without a shrinkable sibling a long
                reason overflowed the pill instead of wrapping inside it. */}
            <span className="min-w-0 break-words">{chip}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
