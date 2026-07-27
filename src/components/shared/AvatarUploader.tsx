import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, Upload, X } from "lucide-react";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { AVATAR_ACCEPT, validateAvatarFile } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  avatarUrl?: string | null;
  name?: string | null;
  /** Classes for the avatar circle, so each page keeps its own sizing. */
  avatarClassName?: string;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
  isUploading?: boolean;
  isRemoving?: boolean;
}

/**
 * Profile photo control: choose, preview, save, replace, remove.
 *
 * The chosen file is previewed from a local object URL and nothing is sent
 * until the patient confirms — so a mis-picked photo is discarded client-side
 * instead of being stored and then deleted. Built from the same tokens the
 * surrounding pages already use; it adds a control, it does not restyle a page.
 */
export function AvatarUploader({
  avatarUrl,
  name,
  avatarClassName,
  onUpload,
  onRemove,
  isUploading = false,
  isRemoving = false,
}: AvatarUploaderProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Object URLs are revoked when the preview is replaced or cleared, otherwise
  // every re-pick leaks a blob for the lifetime of the tab.
  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const busy = isUploading || isRemoving;

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow the same file to be picked again after a cancel.
    event.target.value = "";
    if (!file) return;

    const problem = validateAvatarFile(file);
    if (problem) {
      toast({ variant: "destructive", title: "Photo not accepted", description: problem });
      return;
    }
    setPendingFile(file);
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    try {
      await onUpload(pendingFile);
      setPendingFile(null);
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated across the app.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          (error as { response?: { data?: { message?: string; detail?: string } } })
            ?.response?.data?.message ??
          (error as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ??
          "Could not upload the photo. Please try again.",
      });
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove();
      setPendingFile(null);
      toast({ title: "Photo removed", description: "Your profile photo has been removed." });
    } catch {
      toast({
        variant: "destructive",
        title: "Removal failed",
        description: "Could not remove the photo. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <UserAvatar
          avatarUrl={previewUrl ?? avatarUrl}
          name={name}
          className={cn(
            "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
            avatarClassName
          )}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={avatarUrl ? "Change profile photo" : "Upload profile photo"}
          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-card transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        onChange={handlePick}
        className="hidden"
        data-testid="avatar-file-input"
      />

      {pendingFile ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Preview — not saved yet
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {isUploading ? "Saving..." : "Save photo"}
            </button>
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-container active:scale-95"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-container active:scale-95 disabled:opacity-60"
          >
            {avatarUrl ? "Change photo" : "Upload photo"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2 text-xs font-semibold text-destructive transition-all hover:bg-error-soft active:scale-95 disabled:opacity-60"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">JPEG, PNG or WEBP · max 5 MB</p>
    </div>
  );
}
