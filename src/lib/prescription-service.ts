// ============================================
// Prescription Service — MedBridge Platform
// Wraps /api/v1/prescriptions/*
// ============================================
//
// Phase 1 scope: reading a prescription, running its AI safety review, and
// previewing/downloading the printable PDF. Nothing here orders medicines —
// that belongs to the pharmacy workflow built on top of this in Phase 2.
//
// Every route is authorised server-side against the bearer token: a
// prescription is readable only by its patient, its prescriber, or an admin.
// The id in the path is checked, not trusted.
import api from "./api";
import type { PrescriptionDocument, RxVerification } from "@/types/prescription";

const prescriptionService = {
  /**
   * The full prescription: prescriber card, medication lines and the most
   * recent safety review.
   *
   * The review is *read* here, not run — fetching a document should not block
   * on two external drug APIs. Call `verify` to run one.
   */
  async getDocument(prescriptionId: string): Promise<PrescriptionDocument> {
    const { data } = await api.get<PrescriptionDocument>(
      `/prescriptions/${prescriptionId}`
    );
    return data;
  },

  /**
   * Run (or fetch) the AI safety review.
   *
   * Returns `null` when verification is switched off server-side. Callers must
   * render that as "not checked" — never as "no problems found".
   *
   * @param refresh Force a new review instead of returning the stored one.
   */
  async verify(
    prescriptionId: string,
    refresh = false
  ): Promise<RxVerification | null> {
    const { data } = await api.post<RxVerification | null>(
      `/prescriptions/${prescriptionId}/verify`,
      null,
      { params: { refresh } }
    );
    return data ?? null;
  },

  /**
   * Fetch the printable PDF as a blob.
   *
   * Returned as a blob rather than a URL because the endpoint requires the
   * bearer token — a bare href would 401, and putting the token in a query
   * string would leak it into browser history and server logs.
   */
  async fetchPdf(
    prescriptionId: string,
    disposition: "inline" | "attachment" = "inline"
  ): Promise<Blob> {
    const { data } = await api.get<Blob>(`/prescriptions/${prescriptionId}/pdf`, {
      params: { disposition },
      responseType: "blob",
    });
    return data;
  },

  /** Object URL for previewing the PDF. Caller must revokeObjectURL when done. */
  async createPdfPreviewUrl(prescriptionId: string): Promise<string> {
    const blob = await this.fetchPdf(prescriptionId, "inline");
    return URL.createObjectURL(blob);
  },

  /** Trigger a browser download of the printable prescription. */
  async downloadPdf(prescriptionId: string, filename?: string): Promise<void> {
    const blob = await this.fetchPdf(prescriptionId, "attachment");
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename ?? `prescription-${prescriptionId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      // Revoked in a finally so a failed click cannot leak the object URL.
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Open the PDF in a new tab for printing.
   *
   * The object URL is deliberately not revoked immediately: doing so races the
   * new tab's load and yields a blank page. It is released when that tab closes.
   */
  async printPdf(prescriptionId: string): Promise<void> {
    const url = await this.createPdfPreviewUrl(prescriptionId);
    const tab = window.open(url, "_blank");
    if (!tab) {
      URL.revokeObjectURL(url);
      throw new Error(
        "The print window was blocked. Allow pop-ups for this site and try again."
      );
    }
    tab.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
  },
};

export default prescriptionService;
