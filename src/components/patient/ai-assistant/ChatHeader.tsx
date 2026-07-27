import React from "react";
import { MedicalAIAvatar } from "./header/MedicalAIAvatar";
import { StatusBadge, type HeaderState } from "./header/StatusBadge";
import { CapabilityBadges } from "./header/CapabilityBadges";
import { SystemStatusBar } from "./header/SystemStatusBar";
import { HeaderActions } from "./header/HeaderActions";
import { PatientContextBar } from "./header/PatientContextBar";
import { NotificationBanner } from "./header/NotificationBanner";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  hasMessages: boolean;
  isProcessing: boolean;
  onClearChat: () => void;
  onToggleMobilePanel?: () => void;
  onOpenHistory?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  hasMessages,
  isProcessing,
  onClearChat,
  onToggleMobilePanel,
  onOpenHistory,
}) => {
  const navigate = useNavigate();

  const getHeaderState = (): HeaderState => {
    if (isProcessing) return "Analyzing";
    return "Idle";
  };

  return (
    <div className="mb-5 space-y-3">
      {/* 1. Notification Banner */}
      <NotificationBanner />

      {/* 2. Main Premium Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-card p-4 shadow-card">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs font-semibold text-muted-foreground shadow-xs transition-all hover:bg-surface-container hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Medical AI Avatar */}
            <MedicalAIAvatar />

            {/* Name, Subtitle, & Status Badge */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-base text-foreground tracking-tight">
                  AI Medical Assistant
                </h1>
                <StatusBadge state={getHeaderState()} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Evidence-Based Healthcare Assistant
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {onToggleMobilePanel && (
              <button
                type="button"
                onClick={onToggleMobilePanel}
                className="flex lg:hidden items-center gap-2 rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs font-semibold text-foreground shadow-xs transition-all hover:bg-surface-container active:scale-95"
                title="Open Live Medical Dashboard"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

            <HeaderActions onNewChat={onClearChat} onOpenHistory={onOpenHistory} />
          </div>
        </div>

        {/* Center Section: Capability Badges & System Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle/50">
          <CapabilityBadges />
          <SystemStatusBar />
        </div>
      </div>

      {/* 3. Patient Context Information Bar */}
      <PatientContextBar topic={hasMessages ? "Clinical Symptom Intake" : null} />
    </div>
  );
};
