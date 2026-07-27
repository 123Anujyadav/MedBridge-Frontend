import React, { useState } from "react";
import { User } from "lucide-react";

import { resolveAvatarThumbUrl } from "@/lib/avatar";

interface PatientAvatarProps {
  initials?: string;
  className?: string;
  /** The patient's stored `avatar_url`; initials are shown without one. */
  avatarUrl?: string | null;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  initials = "P",
  className = "",
  avatarUrl,
}) => {
  const src = resolveAvatarThumbUrl(avatarUrl);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary-container font-bold text-xs text-primary-foreground shadow-sm ${className}`}
      aria-label="Patient Avatar"
    >
      {src && !failed ? (
        <img
          src={src}
          alt="Patient profile photo"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initials ? (
        initials.slice(0, 2).toUpperCase()
      ) : (
        <User className="h-4 w-4" />
      )}
    </div>
  );
};
