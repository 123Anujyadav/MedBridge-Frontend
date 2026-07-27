import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { AppointmentStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  usePatientAppointments,
  useBookAppointment,
  useCancelAppointment,
  useRescheduleAppointment,
  useBookableDoctors,
} from "@/hooks/usePatient";
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
  const rescheduleAppointment = useRescheduleAppointment();

  const [showBookModal, setShowBookModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentResponse | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const { data: bookableDoctors = [], isLoading: doctorsLoading } = useBookableDoctors();
  const selectedDoctor = bookableDoctors.find((d) => d.id === selectedDoctorId);

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
    const doctorId = selectedDoctorId;
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
        // Taken from the selected doctor's own record, so the appointment can
        // never claim a specialty or hospital the clinician does not have.
        specialty: selectedDoctor?.specialty || "General Medicine",
        hospital_name: selectedDoctor?.hospital_name || "MedBridge Clinical Center",
        date,
        time,
        type,
        reason,
      });
      toast({ title: "Appointment Booked", description: "Your appointment has been scheduled successfully." });
      setShowBookModal(false);
      setSelectedDoctorId("");
    } catch {
      toast({ variant: "destructive", title: "Booking Failed", description: "Could not schedule appointment." });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment.mutateAsync(id);
      toast({ title: "Appointment Cancelled", description: "The appointment has been marked as cancelled." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: (err as Error)?.message || "Could not cancel appointment.",
      });
    }
  };

  const handleReschedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    try {
      await rescheduleAppointment.mutateAsync({
        id: rescheduleTarget.id,
        date: rescheduleDate,
        time: rescheduleTime,
      });
      toast({
        title: "Appointment Rescheduled",
        description: `Moved to ${rescheduleDate} at ${rescheduleTime}. Your doctor has been notified.`,
      });
      setRescheduleTarget(null);
    } catch (err) {
      // The server rejects an already-booked slot; showing its message tells the
      // patient to pick another time rather than just "failed".
      toast({
        variant: "destructive",
        title: "Reschedule Failed",
        description: (err as Error)?.message || "Could not reschedule appointment.",
      });
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
        a.status !== "cancelled" && a.status !== "completed" && a.status !== "no_show" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRescheduleTarget(a)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reschedule
            </button>
            <button onClick={() => handleCancel(a.id)} className="text-xs font-semibold text-destructive hover:underline">
              Cancel
            </button>
          </div>
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
                {/* Real, verified clinicians from the database. Five hardcoded
                    UUIDs used to live here, none of which existed in any
                    environment, so every booking failed on "Doctor not found". */}
                <select
                  name="doctorId"
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  disabled={doctorsLoading || bookableDoctors.length === 0}
                  className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm"
                >
                  <option value="">
                    {doctorsLoading
                      ? "Loading doctors..."
                      : bookableDoctors.length === 0
                      ? "No verified doctors available"
                      : "Choose a doctor"}
                  </option>
                  {bookableDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                      {d.consultation_fee > 0 ? ` ($${d.consultation_fee})` : ""}
                    </option>
                  ))}
                </select>
                {!doctorsLoading && bookableDoctors.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No verified clinicians are registered yet, so booking is
                    unavailable. Please try again later.
                  </p>
                )}
              </div>
              {/* Specialty and hospital follow from the chosen doctor rather than
                  being picked independently — a mismatched pair produced
                  appointments whose specialty contradicted the clinician's. */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Specialty</label>
                  <input
                    readOnly
                    value={selectedDoctor?.specialty || ""}
                    placeholder="Select a doctor first"
                    className="w-full rounded-xl border border-border-subtle bg-surface-container px-4 py-3 text-sm text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Hospital / Location</label>
                  <input
                    readOnly
                    value={selectedDoctor?.hospital_name || ""}
                    placeholder="Select a doctor first"
                    className="w-full rounded-xl border border-border-subtle bg-surface-container px-4 py-3 text-sm text-muted-foreground"
                  />
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

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setRescheduleTarget(null)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-headline-md text-foreground">Reschedule Appointment</h2>
              <button onClick={() => setRescheduleTarget(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-body-sm text-muted-foreground">
              {rescheduleTarget.doctor_name} — currently {rescheduleTarget.date} at {rescheduleTarget.time}
            </p>
            <form className="space-y-4" onSubmit={handleReschedule}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">New Time</label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={rescheduleAppointment.isPending}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {rescheduleAppointment.isPending ? "Rescheduling..." : "Confirm New Slot"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
