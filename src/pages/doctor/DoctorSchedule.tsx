import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { AppointmentStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/States";
import { useDoctorAppointments, useDoctorProfile, useUpdateAvailability, useUpdateAppointmentStatus } from "@/hooks/useDoctor";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, Video, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: appointments = [], isLoading, isError, error, refetch } = useDoctorAppointments();
  const { data: profile } = useDoctorProfile();
  const updateAvailability = useUpdateAvailability();
  const updateStatus = useUpdateAppointmentStatus();

  const [currentDate, setCurrentDate] = useState(new Date());

  if (isLoading) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search schedule...">
        <LoadingState rows={3} />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search schedule...">
        <ErrorState title="Failed to Load Schedule" description={(error as Error)?.message || "Could not retrieve doctor calendar schedule."} onRetry={refetch} />
      </AppShell>
    );
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((a) => a.date === dateStr);
  };

  const handleToggleAvailability = async () => {
    const nextStatus = profile?.availability === "available" ? "busy" : "available";
    try {
      await updateAvailability.mutateAsync({ availability: nextStatus, next_available: "Now" });
      toast({ title: "Availability Updated", description: `Status set to ${nextStatus}.` });
    } catch {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not change availability status." });
    }
  };

  const handleApptStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, statusStr: newStatus });
      toast({ title: "Status Updated", description: `Appointment set to ${newStatus}.` });
    } catch {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not change appointment status." });
    }
  };

  return (
    <AppShell portal="doctor" userName={user?.email || "Doctor"} userRole="Clinician Portal" searchPlaceholder="Search schedule...">
      <PageHeader
        title="Appointment Schedule"
        subtitle="Manage your calendar, upcoming appointments, and availability."
        breadcrumbs={[{ label: "Doctor" }, { label: "Schedule" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <SectionCard
            title={`${monthName} ${currentDate.getFullYear()}`}
            actions={
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-container">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-container">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            }
          >
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold uppercase text-muted-foreground pb-2">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayAppts = getAppointmentsForDay(day);
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                return (
                  <div key={day} className={`min-h-[80px] rounded-lg border p-2 transition-all ${isToday ? "border-primary bg-primary/5" : "border-border-subtle hover:bg-surface-container-low"}`}>
                    <p className={`text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day}</p>
                    {dayAppts.map((apt) => (
                      <div key={apt.id} className="mt-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {apt.time} {apt.patient_name?.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          <SectionCard title="Appointments Feed">
            {appointments.length === 0 ? (
              <EmptyState icon={<Calendar className="h-8 w-8" />} title="No appointments scheduled" />
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="rounded-xl border border-border-subtle p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm">{apt.patient_name}</p>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>
                    <div className="flex items-center gap-3 text-body-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {apt.date} at {apt.time}
                    </div>
                    <div className="flex items-center justify-between text-body-sm pt-1">
                      <span className="text-muted-foreground capitalize">{apt.type}</span>
                      {apt.status === "scheduled" && (
                        <button onClick={() => handleApptStatusChange(apt.id, "confirmed")} className="text-xs font-semibold text-primary hover:underline">
                          Confirm
                        </button>
                      )}
                      {apt.status === "confirmed" && (
                        <button onClick={() => handleApptStatusChange(apt.id, "completed")} className="text-xs font-semibold text-success hover:underline">
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Availability Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border-subtle p-3">
                <span className="text-body-sm font-medium text-foreground">Current Availability</span>
                <span className="flex items-center gap-2 text-body-sm font-semibold capitalize text-success">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> {profile?.availability || "available"}
                </span>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={updateAvailability.isPending}
                className="w-full rounded-xl border border-border-subtle py-2.5 text-sm font-semibold text-primary hover:bg-surface-container-low disabled:opacity-50"
              >
                {updateAvailability.isPending ? "Updating..." : "Toggle Availability Status"}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
