import React from "react";
import {
  PlusCircle,
  History,
  Search,
  Share2,
  Download,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderActionsProps {
  onNewChat?: () => void;
  onOpenHistory?: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ onNewChat, onOpenHistory }) => {
  const { toast } = useToast();

  const handleAction = (label: string) => {
    if (label === "Start New Chat" && onNewChat) {
      onNewChat();
      return;
    }
    if (label === "Conversation History" && onOpenHistory) {
      onOpenHistory();
      return;
    }
    toast({
      title: label,
      description: `${label} action clicked (UI Demo).`,
    });
  };

  const actions = [
    { label: "Start New Chat", icon: PlusCircle },
    { label: "Conversation History", icon: History },
    { label: "Search Intake", icon: Search },
    { label: "Share Conversation", icon: Share2 },
    { label: "Export Report", icon: Download },
    { label: "Settings", icon: Settings },
    { label: "Help & FAQ", icon: HelpCircle },
  ];

  return (
    <div className="flex items-center gap-1">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <div key={idx} className="relative group">
            <button
              type="button"
              onClick={() => handleAction(act.label)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container hover:text-foreground active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-xs"
              aria-label={act.label}
            >
              <Icon className="h-4 w-4" />
            </button>

            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex items-center justify-center whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-semibold text-background shadow-md pointer-events-none z-30 animate-fade-in">
              {act.label}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
