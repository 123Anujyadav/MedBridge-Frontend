// ============================================
// usePrescription — React Query hooks
// Prescription document, AI safety review, printable PDF
// ============================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import prescriptionService from "@/lib/prescription-service";
import { useAuth } from "@/context/AuthContext";
import type { PrescriptionDocument, RxVerification } from "@/types/prescription";

/**
 * Cache key, scoped to the signed-in account.
 *
 * Carries the user id for the same reason `emergencyProfileKey` does: the React
 * Query cache survives sign-out, so on a shared browser the next person in
 * could otherwise be served the previous patient's prescription — drug names,
 * diagnosis and prescriber — while the entry was still fresh.
 *
 * Kept out from under `["patient"]` so the WebSocket's broad
 * `PATIENT_KEYS.all` invalidations do not re-fetch a prescription that no
 * appointment or notification event can change.
 */
export const prescriptionKey = (prescriptionId: string, userId?: string) =>
  ["prescriptionDocument", userId ?? "anonymous", prescriptionId] as const;

/**
 * One prescription with its prescriber card, medication lines and latest
 * safety review.
 *
 * A prescription is immutable once signed, so this is cached hard. Only the
 * safety review changes, and the verify mutation writes its result straight
 * into this entry.
 */
export function usePrescriptionDocument(prescriptionId: string | undefined) {
  const { user } = useAuth();

  return useQuery<PrescriptionDocument>({
    queryKey: prescriptionKey(prescriptionId ?? "", user?.id),
    queryFn: () => prescriptionService.getDocument(prescriptionId as string),
    enabled: Boolean(prescriptionId),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Run the AI safety review.
 *
 * The result is written into the document cache rather than invalidating it,
 * because the endpoint already returned the review — re-fetching the whole
 * document would ask a question that was just answered.
 *
 * A `null` result means verification is switched off server-side. It is stored
 * as-is so the UI can distinguish "not checked" from "checked and clear";
 * treating the two alike would show a patient a clean bill of health for a
 * prescription nothing examined.
 */
export function useVerifyPrescription(prescriptionId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<RxVerification | null, Error, { refresh?: boolean } | void>({
    mutationFn: (variables) =>
      prescriptionService.verify(
        prescriptionId as string,
        (variables && "refresh" in variables ? variables.refresh : false) ?? false
      ),
    onSuccess: (verification) => {
      if (!prescriptionId) return;
      queryClient.setQueryData<PrescriptionDocument>(
        prescriptionKey(prescriptionId, user?.id),
        (previous) => (previous ? { ...previous, verification } : previous)
      );
    },
  });
}

/**
 * Download the printable prescription.
 *
 * Exposed as a mutation rather than a bare function so callers get the pending
 * and error states for free — the request fetches a PDF over the network and
 * can fail like any other.
 */
export function useDownloadPrescriptionPdf(prescriptionId: string | undefined) {
  return useMutation<void, Error, void>({
    mutationFn: () => prescriptionService.downloadPdf(prescriptionId as string),
  });
}

/** Open the printable prescription in a new tab for printing. */
export function usePrintPrescriptionPdf(prescriptionId: string | undefined) {
  return useMutation<void, Error, void>({
    mutationFn: () => prescriptionService.printPdf(prescriptionId as string),
  });
}
