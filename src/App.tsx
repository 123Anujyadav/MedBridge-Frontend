import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

// Patient Portal

// Doctor Portal

// Admin Portal

// Pharmacy Owner Portal

// Delivery & Logistics

/**
 * Route-level code splitting.
 *
 * Every page used to be imported statically, so a visitor to the public
 * homepage downloaded the Admin, Doctor, Pharmacy and Delivery portals —
 * charts, dialogs and all — before anything rendered. Each portal now
 * arrives only when someone actually navigates into it.
 *
 * HomePage and NotFound stay eager on purpose: the first is the initial
 * paint, and the second has to render even when a failed chunk fetch is
 * what went wrong.
 */
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const PatientAIMedicalAssistant = lazy(() => import("./pages/patient/PatientAIMedicalAssistant"));
const PatientIntake = lazy(() => import("./pages/patient/PatientIntake"));
const PatientReports = lazy(() => import("./pages/patient/PatientReports"));
const PatientPrescriptions = lazy(() => import("./pages/patient/PatientPrescriptions"));
const PatientPrescriptionDetail = lazy(() => import("./pages/patient/PatientPrescriptionDetail"));
const PatientOrders = lazy(() =>
  import("./pages/patient/PatientOrders").then((m) => ({ default: m.PatientOrders })),
);
const PatientOrderTracking = lazy(() =>
  import("./pages/patient/PatientOrders").then((m) => ({ default: m.PatientOrderTracking })),
);
const PatientReminders = lazy(() => import("./pages/patient/PatientReminders"));
const PatientAppointments = lazy(() => import("./pages/patient/PatientAppointments"));
const PatientRecords = lazy(() => import("./pages/patient/PatientRecords"));
const PatientHistory = lazy(() => import("./pages/patient/PatientHistory"));
const PatientEmergency = lazy(() => import("./pages/patient/PatientEmergency"));
const PatientNotifications = lazy(() => import("./pages/patient/PatientNotifications"));
const PatientSettings = lazy(() => import("./pages/patient/PatientSettings"));
const PatientProfile = lazy(() => import("./pages/patient/PatientProfile"));
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorCases = lazy(() => import("./pages/doctor/DoctorCases"));
const DoctorConsultation = lazy(() => import("./pages/doctor/DoctorConsultation"));
const DoctorPrescriptions = lazy(() => import("./pages/doctor/DoctorPrescriptions"));
const DoctorPatients = lazy(() => import("./pages/doctor/DoctorPatients"));
const DoctorSchedule = lazy(() => import("./pages/doctor/DoctorSchedule"));
const DoctorAIReports = lazy(() => import("./pages/doctor/DoctorAIReports"));
const DoctorNotifications = lazy(() => import("./pages/doctor/DoctorNotifications"));
const DoctorSettings = lazy(() => import("./pages/doctor/DoctorSettings"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDoctors = lazy(() => import("./pages/admin/AdminDoctors"));
const AdminHospitals = lazy(() => import("./pages/admin/AdminHospitals"));
const AdminPharmacies = lazy(() => import("./pages/admin/AdminPharmacies"));
const AdminPharmacyDetail = lazy(() => import("./pages/admin/AdminPharmacyDetail"));
const AdminPharmacyForm = lazy(() => import("./pages/admin/AdminPharmacyForm"));
const AdminPharmacyAnalytics = lazy(() => import("./pages/admin/AdminPharmacyAnalytics"));
const AdminCompliance = lazy(() => import("./pages/admin/AdminCompliance"));
const AdminVerification = lazy(() => import("./pages/admin/AdminVerification"));
const AdminSystemHealth = lazy(() => import("./pages/admin/AdminSystemHealth"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCases = lazy(() => import("./pages/admin/AdminCases"));
const PharmacyDashboard = lazy(() => import("./pages/pharmacy/PharmacyDashboard"));
const PharmacyOrders = lazy(() =>
  import("./pages/pharmacy/PharmacyOrders").then((m) => ({ default: m.PharmacyOrders })),
);
const PharmacyOrderDetail = lazy(() =>
  import("./pages/pharmacy/PharmacyOrders").then((m) => ({ default: m.PharmacyOrderDetail })),
);
const PharmacyInventory = lazy(() => import("./pages/pharmacy/PharmacyInventory"));
const PharmacyAnalytics = lazy(() =>
  import("./pages/pharmacy/PharmacyAnalytics").then((m) => ({ default: m.PharmacyAnalytics })),
);
const PharmacyCustomers = lazy(() =>
  import("./pages/pharmacy/PharmacyAnalytics").then((m) => ({ default: m.PharmacyCustomers })),
);
const DeliveryDashboard = lazy(() => import("./pages/delivery/DeliveryDashboard"));
const DeliveryOrders = lazy(() =>
  import("./pages/delivery/DeliveryOrders").then((m) => ({ default: m.DeliveryOrders })),
);
const DeliveryDetail = lazy(() =>
  import("./pages/delivery/DeliveryOrders").then((m) => ({ default: m.DeliveryDetail })),
);

import { LoadingState } from "@/components/shared/States";
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

/**
 * Shown while a route chunk downloads.
 *
 * Deliberately minimal and unbranded — on a fast connection it is visible for
 * a few frames, and anything heavier reads as a flash of unstyled content.
 */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <LoadingState rows={3} />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<RouteFallback />}>
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
              <Route path="/pharmacy" element={<Navigate to="/pharmacy/dashboard" replace />} />
              <Route path="/delivery" element={<Navigate to="/delivery/dashboard" replace />} />

              {/* Patient Portal */}
              <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/ai-medical-assistant" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAIMedicalAssistant /></ProtectedRoute>} />
              <Route path="/patient/intake" element={<ProtectedRoute allowedRoles={["patient"]}><PatientIntake /></ProtectedRoute>} />
              <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={["patient"]}><PatientReports /></ProtectedRoute>} />
              <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={["patient"]}><PatientPrescriptions /></ProtectedRoute>} />
              {/* Prescription detail, AI safety review, pharmacy search and ordering. */}
              <Route path="/patient/prescriptions/:id" element={<ProtectedRoute allowedRoles={["patient"]}><PatientPrescriptionDetail /></ProtectedRoute>} />
              <Route path="/patient/orders" element={<ProtectedRoute allowedRoles={["patient"]}><PatientOrders /></ProtectedRoute>} />
              <Route path="/patient/orders/:id" element={<ProtectedRoute allowedRoles={["patient"]}><PatientOrderTracking /></ProtectedRoute>} />
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
              {/* Pharmacy administration. Admin-only on both the route guard and the API router. */}
              <Route path="/admin/pharmacies" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPharmacies /></ProtectedRoute>} />
              <Route path="/admin/pharmacy-analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPharmacyAnalytics /></ProtectedRoute>} />
              <Route path="/admin/pharmacies/new" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPharmacyForm /></ProtectedRoute>} />
              <Route path="/admin/pharmacies/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPharmacyDetail /></ProtectedRoute>} />
              <Route path="/admin/compliance" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCompliance /></ProtectedRoute>} />
              <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={["admin"]}><AdminVerification /></ProtectedRoute>} />
              <Route path="/admin/system" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSystemHealth /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotifications /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/cases" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCases /></ProtectedRoute>} />

              {/* Pharmacy Owner Portal — verified partners only. The API gate
                  (`require_verified_pharmacy`) re-checks approval per request. */}
              <Route path="/pharmacy/dashboard" element={<ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyDashboard /></ProtectedRoute>} />
              <Route path="/pharmacy/orders" element={<ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyOrders /></ProtectedRoute>} />
              <Route path="/pharmacy/orders/:id" element={<ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyOrderDetail /></ProtectedRoute>} />
              <Route path="/pharmacy/inventory" element={<ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyInventory /></ProtectedRoute>} />
              <Route path="/pharmacy/customers" element={<ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyCustomers /></ProtectedRoute>} />
              <Route path="/pharmacy/analytics" element={<ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyAnalytics /></ProtectedRoute>} />

              {/* Delivery & Logistics — approved riders only. The API gate
                  (`require_approved_delivery_partner`) re-checks per request. */}
              <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={["delivery_partner"]}><DeliveryDashboard /></ProtectedRoute>} />
              <Route path="/delivery/orders" element={<ProtectedRoute allowedRoles={["delivery_partner"]}><DeliveryOrders /></ProtectedRoute>} />
              <Route path="/delivery/orders/:id" element={<ProtectedRoute allowedRoles={["delivery_partner"]}><DeliveryDetail /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
