import React, { useEffect, useState } from "react";

import { initialsFrom, resolveAvatarUrl } from "@/lib/avatar";

interface DoctorAvatarProps {
  photoUrl: string;
  name: string;
  isOnline?: boolean;
  size?: "md" | "lg";
}

/**
 * A clinician's profile photo, falling back to their initials.
 *
 * The fallback used to be a fixed stock photograph of a person, so a real
 * doctor who had not uploaded an avatar was shown to patients wearing a
 * stranger's face. Initials are the convention the rest of the platform uses
 * (`UserAvatar`), and `resolveAvatarUrl` is what turns a stored
 * `/uploads/avatars/...` path into something an `<img>` can load.
 */
export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  photoUrl,
  name,
  isOnline = true,
  size = "lg",
}) => {
  const sizeClasses = size === "lg" ? "h-28 w-28" : "h-24 w-24";
  const src = resolveAvatarUrl(photoUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-full border-4 border-card bg-surface-container-high shadow-md transition-transform duration-300 group-hover:scale-105 ${sizeClasses}`}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-headline text-2xl font-bold text-muted-foreground"
          >
            {initialsFrom(name)}
          </span>
        )}
      </div>

      {/* Online indicator dot */}
      {isOnline && (
        <span
          className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card p-0.5 shadow-md"
          title="Online Now"
        >
          <span className="h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
        </span>
      )}
    </div>
  );
};
