import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { AppointmentStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { usePatientAppointments, useBookAppointment, useCancelAppointment } from "@/hooks/usePatient";
import { useAuth } from "@/context/AuthContext";
import type { AppointmentResponse } from "@/types/api";
import { Calendar, Clock, Video, Phone, MapPin, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: appointments = [], isLoading, isError, error, refetch } = usePatientAppointments();
  const bookAppointment = useBookAppointment();
  const cancelAppointment = useCancelAppointment();

  const [showBookModal, setShowBookModal] = useState(false);
  const [filter, setFilter] = useState("all");

  if (isLoading) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search appointments...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search appointments...">
        <ErrorState title="Failed to Load Appointments" description={(error as Error)?.message || "Could not fetch appointment schedule."} onRetry={refetch} />
      </AppShell>
    );
  }

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doctorId = formData.get("doctorId") as string;
    const specialty = formData.get("specialty") as string;
    const hospitalName = formData.get("hospitalName") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const type = (formData.get("type") as "in_person" | "video" | "phone" | "ai_triage") || "in_person";
    const reason = formData.get("reason") as string;

    if (!doctorId || !date || !time || !reason) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please complete all required fields." });
      return;
    }

    try {
      await bookAppointment.mutateAsync({
        doctor_id: doctorId,
        specialty: specialty || "General Medicine",
        hospital_name: hospitalName || "MedBridge Clinical Center",
        date,
        time,
        type,
        reason,
      });
      toast({ title: "Appointment Booked", description: "Your appointment has been scheduled successfully." });
      setShowBookModal(false);
    } catch {
      toast({ variant: "destructive", title: "Booking Failed", description: "Could not schedule appointment." });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment.mutateAsync(id);
      toast({ title: "Appointment Cancelled", description: "The appointment has been marked as cancelled." });
    } catch {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not cancel appointment." });
    }
  };

  const columns: Column<AppointmentResponse>[] = [
    {
      key: "doctor_name",
      header: "Doctor",
      sortable: true,
      sortValue: (a) => a.doctor_name,
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-semibold text-sm text-primary">
            {a.doctor_name ? a.doctor_name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "DR"}
          </div>
          <div>
            <p className="font-medium text-foreground">{a.doctor_name}</p>
            <p className="text-xs text-muted-foreground">{a.specialty}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date & Time",
      sortable: true,
      sortValue: (a) => a.date + a.time,
      render: (a) => (
        <div className="flex items-center gap-2 text-body-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{a.date}</span>
          <Clock className="h-3.5 w-3.5 text-muted-foreground ml-2" />
          <span>{a.time}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (a) => (
        <span className="flex items-center gap-1.5 text-body-sm capitalize">
          {a.type === "video" ? <Video className="h-4 w-4 text-primary" /> : a.type === "phone" ? <Phone className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
          {a.type.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (a) => <span className="text-body-sm text-muted-foreground">{a.reason}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <AppointmentStatusBadge status={a.status} />,
    },
    {
      key: "actions",
      header: "Action",
      render: (a) =>
        a.status !== "cancelled" && a.status !== "completed" ? (
          <button onClick={() => handleCancel(a.id)} className="text-xs font-semibold text-destructive hover:underline">
            Cancel
          </button>
        ) : null,
    },
  ];

  return (
    <AppShell portal="patient" userName={user?.email || "Patient"} userRole="Patient Portal" searchPlaceholder="Search appointments...">
      <PageHeader
        title="Appointment Management"
        subtitle="View, schedule, and manage your doctor appointments."
        breadcrumbs={[{ label: "Patient" }, { label: "Appointments" }]}
        actions={
          <button onClick={() => setShowBookModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
            <Plus className="h-4 w-4" /> Book Appointment
          </button>
        }
      />

      {/* Quick Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: appointments.length, color: "text-foreground" },
          { label: "Confirmed", value: appointments.filter((a) => a.status === "confirmed").length, color: "text-success" },
          { label: "Scheduled", value: appointments.filter((a) => a.status === "scheduled").length, color: "text-primary" },
          { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, color: "text-muted-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="premium-card p-4">
            <p className={`font-headline text-headline-md font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-body-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        {["all", "scheduled", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${filter === f ? "bg-primary text-primary-foreground" : "border border-border-subtle text-muted-foreground hover:bg-surface-container-low"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SectionCard title="Appointments">
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="No appointments found"
            description="Book an appointment with a specialist."
            action={
              <button onClick={() => setShowBookModal(true)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Book Now
              </button>
            }
          />
        </SectionCard>
      ) : (
        <DataTable columns={columns} data={filtered} rowKey={(a) => a.id} />
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4" onClick={() => setShowBookModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-headline-md text-foreground">Book Appointment</h2>
              <button onClick={() => setShowBookModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleBook}>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Select Specialist / Doctor</label>
                <select name="doctorId" required className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm">
                  <option value="61480a1b-b562-4a59-86ff-8c03c77333ca">Dr. Sarah Smith — Cardiology ($150)</option>
                  <option value="c3d2e1f0-9876-5432-10fe-dcba98765432">Dr. James Wilson — Neurology ($180)</option>
                  <option value="e4f5a6b7-1122-3344-5566-778899aabbcc">Dr. Elena Rostova — General Medicine ($120)</option>
                  <option value="a1b2c3d4-4455-6677-8899-001122334455">Dr. Marcus Vance — Orthopedics ($160)</option>
                  <option value="b2c3d4e5-5566-7788-9900-112233445566">Dr. Anita Patel — Pediatrics ($140)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Specialty</label>
                  <select name="specialty" className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm">
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Hospital / Location</label>
                  <select name="hospitalName" className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm">
                    <option value="MedBridge Boston General Hospital">MedBridge Boston General Hospital</option>
                    <option value="St. Jude Specialty Care Center">St. Jude Specialty Care Center</option>
                    <option value="Metro Heart & Spine Institute">Metro Heart & Spine Institute</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Date (YYYY-MM-DD)</label>
                  <input name="date" type="date" required className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Time (HH:MM)</label>
                  <input name="time" type="time" required className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Consultation Type</label>
                <select name="type" className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm">
                  <option value="in_person">In Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone</option>
                  <option value="ai_triage">AI Triage</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Reason for Visit</label>
                <textarea name="reason" required rows={3} placeholder="Describe symptom or reason..." className="w-full resize-none rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm" />
              </div>
              <button
                type="submit"
                disabled={bookAppointment.isPending}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {bookAppointment.isPending ? "Scheduling..." : "Schedule Appointment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
