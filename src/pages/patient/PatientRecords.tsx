import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { usePatientReports, useUploadFile } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import { FileText, Upload, Download, Eye, FileImage, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientRecords() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: records = [], isLoading, isError, error, refetch } = usePatientReports();
  const uploadFileMutation = useUploadFile();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medical records...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medical records...">
        <ErrorState title="Failed to Load Records" description={(error as Error)?.message || "Could not retrieve medical records."} onRetry={refetch} />
      </AppShell>
    );
  }

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ variant: "destructive", title: "No File Selected", description: "Please select a file to upload." });
      return;
    }

    try {
      const res = await uploadFileMutation.mutateAsync(selectedFile);
      toast({ title: "Upload Successful", description: `Uploaded file ${res.filename} (${Math.round(res.size_bytes / 1024)} KB)` });
      setUploadOpen(false);
      setSelectedFile(null);
      refetch();
    } catch {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload medical document." });
    }
  };

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search medical records...">
      <PageHeader
        title="Medical Records Upload Hub"
        subtitle="Upload, organize, and manage your medical documents and health records."
        breadcrumbs={[{ label: "Patient" }, { label: "Medical Records" }]}
        actions={
          <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
            <Upload className="h-4 w-4" /> Upload Record
          </button>
        }
      />

      {/* Upload Dropzone */}
      <div className="mb-6">
        <div
          onClick={() => setUploadOpen(true)}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-subtle bg-card p-12 text-center transition-colors hover:border-primary/30 hover:bg-surface-container-low"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
            <Upload className="h-8 w-8" />
          </div>
          <p className="mt-4 font-headline text-headline-md text-foreground">Drop files here to upload to PostgreSQL backend</p>
          <p className="mt-1 text-body-sm text-muted-foreground">Supports PDF, JPG, PNG, DICOM (max 50MB per file)</p>
          <button className="mt-4 rounded-xl border border-border-subtle px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-surface-container">
            Browse Files
          </button>
        </div>
      </div>

      {/* Records Grid */}
      {records.length === 0 ? (
        <SectionCard title="Your Records">
          <EmptyState icon={<FileText className="h-8 w-8" />} title="No records uploaded" description="Upload your medical records to keep them organized and accessible." />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div key={record.id} className="premium-card p-5 transition-all hover:shadow-card-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <StatusBadge variant={record.status === "ready" ? "success" : "neutral"} dot>
                  {record.status}
                </StatusBadge>
              </div>
              <p className="font-semibold text-foreground">{record.title}</p>
              <p className="mt-1 text-body-sm text-muted-foreground">{record.date} • {record.type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setUploadOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-headline text-headline-md text-foreground">Upload Medical Record</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-border-subtle bg-card p-3 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploadFileMutation.isPending}
                  className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
                </button>
                <button type="button" onClick={() => setUploadOpen(false)} className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
