import React from "react";
import { Heart, Activity, Utensils, Moon, Droplets, Smile } from "lucide-react";

export interface LifestyleAdviceItem {
  category: "Exercise" | "Diet" | "Sleep" | "Hydration" | "Stress Management" | string;
  description: string;
}

interface LifestyleCardProps {
  advice: LifestyleAdviceItem[];
}

export const LifestyleCard: React.FC<LifestyleCardProps> = ({ advice }) => {
  if (!advice || advice.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "exercise":
        return <Activity className="h-3.5 w-3.5 text-primary" />;
      case "diet":
        return <Utensils className="h-3.5 w-3.5 text-secondary" />;
      case "sleep":
        return <Moon className="h-3.5 w-3.5 text-tertiary" />;
      case "hydration":
        return <Droplets className="h-3.5 w-3.5 text-primary" />;
      case "stress management":
        return <Smile className="h-3.5 w-3.5 text-success" />;
      default:
        return <Heart className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
          <Heart className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Lifestyle Advice</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {advice.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border-subtle/70 bg-surface-container-low p-3 space-y-1"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-card shadow-xs">
                {getCategoryIcon(item.category)}
              </div>
              <span className="font-bold text-xs text-foreground">{item.category}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
