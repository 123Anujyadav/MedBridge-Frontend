import React from "react";
import { Star, MessageSquare } from "lucide-react";

interface DoctorReviewProps {
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 148
  previewSnippet?: string; // e.g. "Extremely attentive doctor. Solved my chest discomfort quickly."
}

export const DoctorReview: React.FC<DoctorReviewProps> = ({
  rating,
  reviewCount,
  previewSnippet = "Highly rated for patient communication & diagnostic accuracy.",
}) => {
  return (
    <div className="space-y-1.5 rounded-xl bg-surface-container-low/60 p-2.5 border border-border-subtle/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : i < rating
                    ? "fill-amber-400/50 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-xs text-foreground">{rating.toFixed(1)}</span>
        </div>

        <span className="text-[11px] font-medium text-muted-foreground">
          ({reviewCount} reviews)
        </span>
      </div>

      {previewSnippet && (
        <p className="text-[11px] text-muted-foreground italic line-clamp-1 flex items-start gap-1">
          <MessageSquare className="h-3 w-3 shrink-0 text-primary mt-0.5" />
          <span>"{previewSnippet}"</span>
        </p>
      )}
    </div>
  );
};
