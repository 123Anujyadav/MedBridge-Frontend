import React from "react";
import { cn } from "@/lib/utils";

interface ConversationCardProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  children: React.ReactNode;
  className?: string;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  title,
  icon,
  iconBgColor = "bg-primary/10 text-primary",
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md",
        className
      )}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-sm shrink-0", iconBgColor)}>
          {icon}
        </div>
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
};
