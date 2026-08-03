import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

// Patient Portal
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAIMedicalAssistant from "./pages/patient/PatientAIMedicalAssistant";
import PatientIntake from "./pages/patient/PatientIntake";
import PatientReports from "./pages/patient/PatientReports";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientReminders from "./pages/patient/PatientReminders";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientEmergency from "./pages/patient/PatientEmergency";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientProfile from "./pages/patient/PatientProfile";

// Doctor Portal
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorCases from "./pages/doctor/DoctorCases";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorAIReports from "./pages/doctor/DoctorAIReports";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
import DoctorSettings from "./pages/doctor/DoctorSettings";

// Admin Portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCases from "./pages/admin/AdminCases";

import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Homepage & Auth */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            {/* No administrator sign-up route exists. Admin accounts are
                created by an existing administrator or directly in the
                database — never through the frontend. A previous
                `/admin/signup` route redirected into the auth page and is
                removed; the path now falls through to the 404 handler. */}
            <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Patient Portal */}
            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/ai-medical-assistant" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAIMedicalAssistant /></ProtectedRoute>} />
            <Route path="/patient/intake" element={<ProtectedRoute allowedRoles={["patient"]}><PatientIntake /></ProtectedRoute>} />
            <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={["patient"]}><PatientReports /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={["patient"]}><PatientPrescriptions /></ProtectedRoute>} />
            <Route path="/patient/reminders" element={<ProtectedRoute allowedRoles={["patient"]}><PatientReminders /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/records" element={<ProtectedRoute allowedRoles={["patient"]}><PatientRecords /></ProtectedRoute>} />
            <Route path="/patient/history" element={<ProtectedRoute allowedRoles={["patient"]}><PatientHistory /></ProtectedRoute>} />
            <Route path="/patient/emergency" element={<ProtectedRoute allowedRoles={["patient"]}><PatientEmergency /></ProtectedRoute>} />
            <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={["patient"]}><PatientNotifications /></ProtectedRoute>} />
            <Route path="/patient/settings" element={<ProtectedRoute allowedRoles={["patient"]}><PatientSettings /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={["patient"]}><PatientProfile /></ProtectedRoute>} />

            {/* Doctor Portal */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/cases" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorCases /></ProtectedRoute>} />
            <Route path="/doctor/consultation" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorConsultation /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorPrescriptions /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorSchedule /></ProtectedRoute>} />
            <Route path="/doctor/ai-reports" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorAIReports /></ProtectedRoute>} />
            <Route path="/doctor/notifications" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorNotifications /></ProtectedRoute>} />
            <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorSettings /></ProtectedRoute>} />

            {/* Admin Portal */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDoctors /></ProtectedRoute>} />
            <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={["admin"]}><AdminHospitals /></ProtectedRoute>} />
            <Route path="/admin/compliance" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCompliance /></ProtectedRoute>} />
            <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={["admin"]}><AdminVerification /></ProtectedRoute>} />
            <Route path="/admin/system" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSystemHealth /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/cases" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCases /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
