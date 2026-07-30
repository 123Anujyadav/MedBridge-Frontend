import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

const COUNTDOWN_SECONDS = 3;

/**
 * The confirmation a patient sees before an emergency is raised.
 *
 * A three-second countdown with a cancel button, rather than an immediate
 * trigger. An SOS pulls responders away from other work, so the accidental
 * press needs a way out — but a longer delay would be its own harm, because
 * the person using this may have seconds.
 *
 * The countdown is driven by a single interval held in a ref and cleared on
 * unmount and on cancel. A timer that keeps running after the dialog closes
 * would raise an emergency the patient had already called off.
 */
export function SOSConfirmDialog({
  open,
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setRemaining(COUNTDOWN_SECONDS);
      firedRef.current = false;
      return;
    }

    setRemaining(COUNTDOWN_SECONDS);
    firedRef.current = false;

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          // Guarded: React may run this updater more than once in strict mode,
          // and raising two emergencies from one press is exactly what the
          // duplicate check downstream exists to catch — better not to send it.
          if (!firedRef.current) {
            firedRef.current = true;
            onConfirm();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [open, onConfirm]);

  if (!open) return null;

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    onCancel();
  };

  const counting = remaining > 0 && !isSubmitting;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sos-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-card-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h2 id="sos-dialog-title" className="font-headline text-headline-lg text-foreground">
            You are about to trigger an Emergency SOS.
          </h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            Your location and emergency contact will be shared with the response
            team. Cancel now if this was not intended.
          </p>

          {counting ? (
            <>
              <div
                key={remaining}
                aria-live="assertive"
                className="my-7 flex h-28 w-28 animate-scale-in items-center justify-center rounded-full border-4 border-destructive text-destructive"
              >
                <span className="font-headline text-display-lg leading-none">
                  {remaining}
                </span>
              </div>
              <p className="text-body-sm text-muted-foreground">
                Sending in {remaining} second{remaining === 1 ? "" : "s"}…
              </p>
            </>
          ) : (
            <div className="my-7 flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-destructive" />
              <p className="text-body-sm text-muted-foreground">
                Raising your emergency…
              </p>
            </div>
          )}

          <button
            onClick={stop}
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border-subtle px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            {isSubmitting ? "Cannot cancel now" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
