import { Pill } from "lucide-react";

import { FOOD_INSTRUCTION_LABELS } from "@/types/prescription";
import type { MedicationLine } from "@/types/prescription";

interface MedicationListProps {
  medications: MedicationLine[];
}

/** A labelled value, omitted entirely when there is nothing to show. */
function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-body-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

/**
 * The prescribed medicines, exactly as written.
 *
 * Read-only by design: nothing in the patient portal may edit a prescription
 * line. Fields the clinician left blank are omitted rather than rendered as
 * "—" everywhere, so a sparse prescription does not look like a broken page.
 */
export function MedicationList({ medications }: MedicationListProps) {
  if (medications.length === 0) {
    return (
      <p className="text-body-sm text-muted-foreground">
        No medicines were listed on this prescription.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {medications.map((med, index) => (
        <div
          key={med.id}
          className="rounded-xl border border-border-subtle p-4 transition-all hover:bg-surface-container-low/50"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pill className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-semibold text-foreground">
                  {index + 1}. {med.name}
                </p>
                {med.strength && <span className="text-primary">{med.strength}</span>}
              </div>

              {(med.generic_name || med.brand_name) && (
                <p className="mt-0.5 text-body-sm text-muted-foreground">
                  {med.generic_name && <>Generic: {med.generic_name}</>}
                  {med.generic_name && med.brand_name && " · "}
                  {med.brand_name && <>Brand: {med.brand_name}</>}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <Field label="Dosage" value={med.dosage} />
                <Field label="Frequency" value={med.frequency} />
                <Field label="Duration" value={med.duration} />
                <Field label="Route" value={med.route} />
                <Field
                  label="Food"
                  value={
                    med.food_instruction
                      ? FOOD_INSTRUCTION_LABELS[med.food_instruction]
                      : null
                  }
                />
                <Field label="Quantity" value={med.quantity} />
              </div>

              {med.special_instructions && (
                <p className="mt-3 rounded-lg bg-surface-container-low p-3 text-body-sm text-foreground">
                  <span className="font-semibold">Notes: </span>
                  {med.special_instructions}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
