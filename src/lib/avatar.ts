/**
 * Profile photo URL resolution.
 *
 * The backend stores avatars as `/uploads/avatars/<name>.webp` — the same
 * convention used for every other stored file — and serves them from
 * `<api base>/shared/avatars/<name>.webp`. Components should never build that
 * path themselves; they pass whatever `avatar_url` the API returned through
 * `resolveAvatarUrl` and render the result.
 */

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

const STORED_PREFIX = "/uploads/avatars/";

/**
 * Turn a stored `avatar_url` into something an `<img src>` can load.
 *
 * Returns `undefined` when there is no photo, so callers can fall back to
 * initials with a plain truthiness check. Absolute URLs (an external avatar, or
 * a blob: preview) are passed through untouched.
 */
export function resolveAvatarUrl(
  avatarUrl?: string | null
): string | undefined {
  if (!avatarUrl) return undefined;

  if (
    avatarUrl.startsWith("http://") ||
    avatarUrl.startsWith("https://") ||
    avatarUrl.startsWith("blob:") ||
    avatarUrl.startsWith("data:")
  ) {
    return avatarUrl;
  }

  if (avatarUrl.startsWith(STORED_PREFIX)) {
    const filename = avatarUrl.slice(STORED_PREFIX.length);
    return `${API_BASE_URL}/shared/avatars/${filename}`;
  }

  return undefined;
}

/**
 * The smaller rendition, for list rows and small circles.
 *
 * Falls back to the full-size image if the name is not one the backend
 * generated, so an unexpected value degrades to a working picture rather than a
 * broken one.
 */
export function resolveAvatarThumbUrl(
  avatarUrl?: string | null
): string | undefined {
  if (!avatarUrl || !avatarUrl.startsWith(STORED_PREFIX)) {
    return resolveAvatarUrl(avatarUrl);
  }
  return resolveAvatarUrl(avatarUrl.replace(/\.webp$/, "_thumb.webp"));
}

/** Initials shown while there is no photo. Matches the existing fallbacks. */
export function initialsFrom(name?: string | null): string {
  const safe = (name || "").trim();
  if (!safe) return "U";
  return (
    safe
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Client-side pre-check.
 *
 * The backend re-validates everything — this exists only so the patient gets an
 * immediate answer instead of waiting for a round trip to be rejected.
 */
export function validateAvatarFile(file: File): string | null {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return "Choose a JPEG, PNG or WEBP image.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `Image must be under ${AVATAR_MAX_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}
