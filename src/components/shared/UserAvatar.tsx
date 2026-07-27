import { useEffect, useState } from "react";

import { initialsFrom, resolveAvatarThumbUrl, resolveAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** Stored `avatar_url` from the API, or a local preview URL. */
  avatarUrl?: string | null;
  /** Used for the initials fallback and the alt text. */
  name?: string | null;
  /** Classes for the circle itself — callers keep their existing styling. */
  className?: string;
  /** Prefer the smaller rendition (list rows, compact circles). */
  thumb?: boolean;
}

/**
 * A profile photo, falling back to initials.
 *
 * Drop-in for the initials blocks already in the layout: the caller passes the
 * same classes it used before, so size, colour and border are unchanged and
 * only the content of the circle differs. If the image 404s — a photo removed
 * in another tab, say — it silently reverts to initials rather than showing a
 * broken-image icon.
 */
export function UserAvatar({
  avatarUrl,
  name,
  className,
  thumb = false,
}: UserAvatarProps) {
  const src = thumb ? resolveAvatarThumbUrl(avatarUrl) : resolveAvatarUrl(avatarUrl);
  const [failed, setFailed] = useState(false);

  // A new upload produces a new URL; clear any previous failure so the fresh
  // photo is attempted.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name} profile photo` : "Profile photo"}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initialsFrom(name)}</span>
      )}
    </div>
  );
}
