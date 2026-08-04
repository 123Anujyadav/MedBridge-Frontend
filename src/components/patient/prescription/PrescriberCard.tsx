import { BadgeCheck, Building2, CalendarDays, PenLine, Stethoscope } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { PrescriberCard as PrescriberCardData } from "@/types/prescription";

interface PrescriberCardProps {
  prescriber: PrescriberCardData;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

/**
 * The clinician who signed this prescription.
 *
 * Renders the snapshot the API returns, not the doctor's live profile — these
 * are the details as they stood on the day of signing, which is what a legal
 * record of a prescription has to show.
 */
export function PrescriberCard({ prescriber }: PrescriberCardProps) {
  return (
    <div className="premium-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <UserAvatar
            avatarUrl={prescriber.avatar_url}
            name={prescriber.doctor_name}
            className="h-16 w-16 rounded-2xl text-headline-md"
          />
          <div>
            <h3 className="font-headline text-headline-md text-foreground">
              {prescriber.doctor_name}
            </h3>
            {prescriber.qualification && (
              <p className="mt-0.5 text-body-sm text-muted-foreground">
                {prescriber.qualification}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-body-sm text-muted-foreground">
              {prescriber.specialty && (
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {prescriber.specialty}
                </span>
              )}
              {prescriber.hospital && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {prescriber.hospital}
                </span>
              )}
              {typeof prescriber.experience_years === "number" && (
                <span>{prescriber.experience_years} yrs experience</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {prescriber.consultation_completed && (
            <StatusBadge variant="success" dot>
              Consultation completed
            </StatusBadge>
          )}
          {prescriber.prescription_signed ? (
            <StatusBadge variant="success" dot>
              Prescription signed
            </StatusBadge>
          ) : (
            // An unsigned prescription is not a lesser version of a signed one —
            // it is not yet valid to dispense against, so it is called out
            // rather than left blank.
            <StatusBadge variant="warning" dot>
              Not yet signed
            </StatusBadge>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border-subtle pt-4 sm:grid-cols-3">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Registration No.
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-body-sm font-medium text-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            {prescriber.registration_number || "—"}
          </p>
        </div>
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Consultation date
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-body-sm font-medium text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatDate(prescriber.consultation_date)}
          </p>
        </div>
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Digital signature
          </p>
          {prescriber.signature_url ? (
            <img
              src={prescriber.signature_url}
              alt={`Signature of ${prescriber.doctor_name}`}
              className="mt-1 h-10 object-contain"
            />
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-body-sm font-medium text-foreground">
              <PenLine className="h-4 w-4 text-primary" />
              {prescriber.signed_at
                ? `Signed ${formatDate(prescriber.signed_at)}`
                : "Not signed"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
