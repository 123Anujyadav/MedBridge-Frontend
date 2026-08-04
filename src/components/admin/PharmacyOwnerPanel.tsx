import { useState } from "react";
import { Copy, KeyRound, Mail, ShieldOff, UserCheck, UserPlus, UserX } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState } from "@/components/shared/States";
import { useToast } from "@/hooks/use-toast";
import {
  useAssignOwner,
  useChangeOwner,
  useCreateOwner,
  useInviteOwner,
  usePharmacyOwners,
  useRemoveOwner,
  useResetOwnerPassword,
  useSetOwnerActive,
} from "@/hooks/usePharmacyAdmin";
import type { AdminPharmacyDetail, PharmacyOwner } from "@/types/pharmacy-admin";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary";
const secondaryButton =
  "inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60";

/** Pulls a server message out of an axios error, falling back sensibly. */
function detail(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
    (error as Error)?.message ??
    fallback
  );
}

/**
 * A credential shown exactly once.
 *
 * Rendered inline rather than as a toast because the administrator has to copy
 * it before dismissing — a toast that auto-hides would lose a password that
 * cannot be retrieved again.
 */
function CredentialCallout({
  password,
  onDismiss,
}: {
  password: string;
  onDismiss: () => void;
}) {
  const { toast } = useToast();
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
      <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Temporary password — shown once
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <code className="rounded-lg bg-card px-3 py-2 font-mono text-body-sm text-foreground">
          {password}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(password);
            toast({ title: "Copied", description: "Share it over a trusted channel." });
          }}
          className={secondaryButton}
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button type="button" onClick={onDismiss} className={secondaryButton}>
          Done
        </button>
      </div>
      <p className="mt-2 text-body-sm text-muted-foreground">
        MedBridge stores only a hash — this cannot be retrieved again. The owner should
        change it on first sign-in.
      </p>
    </div>
  );
}

/**
 * Pharmacy owner provisioning.
 *
 * The last link between a verified pharmacy and someone who can operate it.
 * Every action reuses the existing authentication — the same `users` table and
 * the same login. Nothing here issues a token.
 */
export function PharmacyOwnerPanel({ pharmacy }: { pharmacy: AdminPharmacyDetail }) {
  const { toast } = useToast();
  const { data: owners = [], isLoading } = usePharmacyOwners(pharmacy.id);

  const createOwner = useCreateOwner(pharmacy.id);
  const assignOwner = useAssignOwner(pharmacy.id);
  const changeOwner = useChangeOwner(pharmacy.id);
  const removeOwner = useRemoveOwner(pharmacy.id);
  const setActive = useSetOwnerActive(pharmacy.id);
  const resetPassword = useResetOwnerPassword(pharmacy.id);
  const invite = useInviteOwner(pharmacy.id);

  const [email, setEmail] = useState("");
  const [linkUserId, setLinkUserId] = useState("");
  const [reason, setReason] = useState("");
  const [credential, setCredential] = useState<string | null>(null);

  const active = owners.find((o) => o.is_active) ?? null;
  const staffable = pharmacy.verification_status === "approved" && pharmacy.is_active;

  const run = async (
    action: () => Promise<unknown>,
    success: string,
    failure: string,
  ) => {
    try {
      const result = await action();
      const password =
        (result as { temporary_password?: string } | undefined)?.temporary_password ?? null;
      if (password) setCredential(password);
      toast({ title: success });
      return true;
    } catch (error) {
      toast({ variant: "destructive", title: failure, description: detail(error, failure) });
      return false;
    }
  };

  if (isLoading) return <LoadingState rows={2} />;

  return (
    <div className="space-y-5">
      {!staffable && (
        // Stated up front rather than surfacing as a rejected request: the
        // administrator's next step is verification, not retrying this form.
        <p className="rounded-xl bg-warning-soft p-4 text-body-sm text-warning">
          {pharmacy.verification_status !== "approved"
            ? `This pharmacy is '${pharmacy.verification_status}'. Complete verification before assigning an owner.`
            : "This pharmacy is suspended. Reactivate it before assigning an owner."}
        </p>
      )}

      {credential && (
        <CredentialCallout password={credential} onDismiss={() => setCredential(null)} />
      )}

      {active ? (
        <div className="rounded-xl border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">{active.email}</span>
                <StatusBadge variant="success" dot>
                  Active owner
                </StatusBadge>
                {!active.is_verified && (
                  <StatusBadge variant="warning">Email unverified</StatusBadge>
                )}
              </div>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Can sign in at /pharmacy/dashboard and sees only this store.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={invite.isPending}
                onClick={() =>
                  run(
                    () => invite.mutateAsync({ userId: active.id }),
                    "Invitation sent in-app",
                    "Could not send the invitation",
                  )
                }
                className={secondaryButton}
              >
                <Mail className="h-4 w-4" />
                Invite
              </button>
              <button
                type="button"
                disabled={resetPassword.isPending}
                onClick={() =>
                  run(
                    () => resetPassword.mutateAsync({ userId: active.id }),
                    "Password reset",
                    "Could not reset the password",
                  )
                }
                className={secondaryButton}
              >
                <KeyRound className="h-4 w-4" />
                Reset password
              </button>
              <button
                type="button"
                disabled={setActive.isPending}
                onClick={() =>
                  run(
                    () =>
                      setActive.mutateAsync({
                        userId: active.id,
                        active: false,
                        reason: reason || "Suspended by administrator",
                      }),
                    "Owner suspended",
                    "Could not suspend the owner",
                  )
                }
                className={secondaryButton}
              >
                <ShieldOff className="h-4 w-4" />
                Suspend
              </button>
              <button
                type="button"
                disabled={removeOwner.isPending}
                onClick={() =>
                  run(
                    () =>
                      removeOwner.mutateAsync({
                        reason: reason || "Removed by administrator",
                      }),
                    "Access revoked",
                    "Could not remove the owner",
                  )
                }
                className={secondaryButton}
              >
                <UserX className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>

          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (recorded in the audit trail)"
            className={`${inputClass} mt-3`}
          />

          <div className="mt-4 border-t border-border-subtle pt-4">
            <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Hand over to another account
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <input
                value={linkUserId}
                onChange={(event) => setLinkUserId(event.target.value)}
                placeholder="New owner user ID"
                className={`${inputClass} flex-1 min-w-[220px]`}
              />
              <button
                type="button"
                disabled={!linkUserId.trim() || changeOwner.isPending}
                onClick={async () => {
                  const ok = await run(
                    () =>
                      changeOwner.mutateAsync({
                        userId: linkUserId.trim(),
                        reason: reason || "Ownership transferred",
                      }),
                    "Ownership transferred",
                    "Could not change the owner",
                  );
                  if (ok) setLinkUserId("");
                }}
                className={primaryButton}
              >
                <UserCheck className="h-4 w-4" />
                Change owner
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<UserPlus className="h-8 w-8" />}
          title="No active owner"
          description="Nobody can sign in to this store's portal until an owner is assigned."
        />
      )}

      {!active && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border-subtle p-4">
            <p className="font-semibold text-foreground">Create a new owner account</p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              A dedicated pharmacy login. A temporary password is generated and shown
              once.
            </p>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@pharmacy.example"
              type="email"
              className={`${inputClass} mt-3`}
            />
            <button
              type="button"
              disabled={!staffable || !email.trim() || createOwner.isPending}
              onClick={async () => {
                const ok = await run(
                  () => createOwner.mutateAsync({ email: email.trim() }),
                  "Owner account created",
                  "Could not create the account",
                );
                if (ok) setEmail("");
              }}
              className={`${primaryButton} mt-3`}
            >
              <UserPlus className="h-4 w-4" />
              Create owner
            </button>
          </div>

          <div className="rounded-xl border border-border-subtle p-4">
            <p className="font-semibold text-foreground">Link an existing account</p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Only unassigned accounts qualify — a patient, doctor or administrator
              cannot be converted.
            </p>
            <input
              value={linkUserId}
              onChange={(event) => setLinkUserId(event.target.value)}
              placeholder="Existing user ID"
              className={`${inputClass} mt-3`}
            />
            <button
              type="button"
              disabled={!staffable || !linkUserId.trim() || assignOwner.isPending}
              onClick={async () => {
                const ok = await run(
                  () => assignOwner.mutateAsync({ userId: linkUserId.trim() }),
                  "Owner assigned",
                  "Could not assign the owner",
                );
                if (ok) setLinkUserId("");
              }}
              className={`${primaryButton} mt-3`}
            >
              <UserCheck className="h-4 w-4" />
              Assign owner
            </button>
          </div>
        </div>
      )}

      {owners.filter((o) => !o.is_active).length > 0 && (
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Previous & suspended
          </p>
          <div className="mt-2 space-y-2">
            {owners
              .filter((o) => !o.is_active)
              .map((owner: PharmacyOwner) => (
                <div
                  key={owner.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle p-3"
                >
                  <div>
                    <span className="text-body-sm font-medium text-foreground">
                      {owner.email}
                    </span>
                    <StatusBadge variant="neutral" className="ml-2">
                      {owner.pharmacy_id ? "Suspended" : "Revoked"}
                    </StatusBadge>
                  </div>
                  {/* Only a suspended owner can be restored — a revoked one has
                      lost the store link and must be re-assigned instead. */}
                  {owner.pharmacy_id && !active && (
                    <button
                      type="button"
                      disabled={setActive.isPending}
                      onClick={() =>
                        run(
                          () =>
                            setActive.mutateAsync({
                              userId: owner.id,
                              active: true,
                              reason: reason || "Reactivated by administrator",
                            }),
                          "Owner reactivated",
                          "Could not reactivate the owner",
                        )
                      }
                      className={secondaryButton}
                    >
                      <UserCheck className="h-4 w-4" />
                      Reactivate
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
