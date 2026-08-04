import { Suspense, lazy, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { MedicationList } from "@/components/patient/prescription/MedicationList";
import { PrescriberCard } from "@/components/patient/prescription/PrescriberCard";
import { SafetyPanel } from "@/components/patient/prescription/SafetyPanel";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useDownloadPrescriptionPdf,
  usePrescriptionDocument,
  usePrintPrescriptionPdf,
  useVerifyPrescription,
} from "@/hooks/usePrescription";
import prescriptionService from "@/lib/prescription-service";

// The pharmacy section pulls in ordering, geolocation and the review dialog.
// None of it is needed to read a prescription, so it is split out of the
// initial bundle and mounted only when this page renders it.
const PharmacyFinder = lazy(() =>
  import("@/components/patient/pharmacy/PharmacyFinder").then((module) => ({
    default: module.PharmacyFinder,
  })),
);

export default function PatientPrescriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: document, isLoading, isError, error, refetch } = usePrescriptionDocument(id);
  const verify = useVerifyPrescription(id);
  const download = useDownloadPrescriptionPdf(id);
  const print = usePrintPrescriptionPdf(id);
  const [isSharing, setIsSharing] = useState(false);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="patient"
      userName={user?.email || "Patient"}
      userRole="Patient Portal"
      searchPlaceholder="Search prescriptions..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);

  if (isError || !document) {
    return shell(
      <ErrorState
        title="Failed to load prescription"
        description={(error as Error)?.message || "This prescription could not be retrieved."}
        onRetry={refetch}
      />,
    );
  }

  const handleDownload = async () => {
    try {
      await download.mutateAsync();
    } catch {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "The prescription PDF could not be downloaded.",
      });
    }
  };

  const handlePrint = async () => {
    try {
      await print.mutateAsync();
    } catch (printError) {
      toast({
        variant: "destructive",
        title: "Print failed",
        description: (printError as Error)?.message ?? "The print window could not open.",
      });
    }
  };

  /**
   * Share the PDF itself, not a link.
   *
   * The download route requires a bearer token, so a URL shared out of the app
   * would 401 for the recipient. The file is fetched and handed to the Web
   * Share API; where that is unavailable it falls back to a download.
   */
  const handleShare = async () => {
    if (!id) return;
    setIsSharing(true);
    try {
      const blob = await prescriptionService.fetchPdf(id, "attachment");
      const file = new File([blob], `prescription-${id.slice(0, 8)}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "MedBridge prescription" });
      } else {
        await download.mutateAsync();
        toast({
          title: "Downloaded instead",
          description: "This browser cannot share files, so the PDF was downloaded.",
        });
      }
    } catch (shareError) {
      // A user dismissing the share sheet raises AbortError; that is not a failure.
      if ((shareError as Error)?.name !== "AbortError") {
        toast({
          variant: "destructive",
          title: "Share failed",
          description: "The prescription could not be shared.",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const actionButton =
    "inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60";

  return shell(
    <>
      <PageHeader
        title={document.diagnosis}
        subtitle={`Prescribed by ${document.prescriber.doctor_name}`}
        breadcrumbs={[
          { label: "Patient" },
          { label: "Prescriptions" },
          { label: document.diagnosis },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/patient/prescriptions")}
              className={actionButton}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={download.isPending}
              className={actionButton}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={print.isPending}
              className={actionButton}
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className={actionButton}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </>
        }
      />

      <div className="space-y-6">
        <PrescriberCard prescriber={document.prescriber} />

        <SectionCard title="Prescribed medications">
          <MedicationList medications={document.medications} />
          {document.notes && (
            <div className="mt-4 rounded-xl bg-surface-container-low p-4">
              <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Doctor&apos;s clinical notes
              </p>
              <p className="mt-1 text-body-sm text-foreground">{document.notes}</p>
            </div>
          )}
          {document.follow_up_date && (
            <p className="mt-4 rounded-xl bg-primary/5 p-3 text-body-sm text-foreground">
              Recommended follow-up:{" "}
              <span className="font-semibold">{document.follow_up_date}</span>
            </p>
          )}
        </SectionCard>

        <SectionCard title="AI safety review">
          <SafetyPanel
            verification={document.verification}
            onRun={() => verify.mutate({ refresh: true })}
            isRunning={verify.isPending}
          />
        </SectionCard>

        <SectionCard title="Nearby pharmacies">
          <Suspense fallback={<LoadingState rows={2} />}>
            {id && <PharmacyFinder prescriptionId={id} />}
          </Suspense>
        </SectionCard>
      </div>
    </>,
  );
}
