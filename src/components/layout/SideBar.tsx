import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Folders,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Activity,
  FileText,
  Pill,
  Calendar,
  Siren,
  Bell,
  ShieldCheck,
  Building2,
  ScrollText,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
};

export type PortalType = "patient" | "doctor" | "admin";

const portalNavConfig: Record<PortalType, { items: NavItem[]; basePath: string }> = {
  patient: {
    basePath: "/patient",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/patient/dashboard" },
      { label: "AI Medical Assistant", icon: Sparkles, path: "/patient/ai-medical-assistant" },
      { label: "Symptom Intake", icon: ClipboardList, path: "/patient/intake" },
      { label: "AI Reports", icon: BarChart3, path: "/patient/reports" },
      { label: "Prescriptions", icon: Pill, path: "/patient/prescriptions" },
      { label: "Medicine Reminders", icon: Bell, path: "/patient/reminders" },
      { label: "Appointments", icon: Calendar, path: "/patient/appointments" },
      { label: "Medical Records", icon: FileText, path: "/patient/records" },
      { label: "Medical History", icon: Activity, path: "/patient/history" },
      { label: "Emergency", icon: Siren, path: "/patient/emergency" },
      { label: "Notifications", icon: Bell, path: "/patient/notifications", badge: 3 },
      { label: "Settings", icon: Settings, path: "/patient/settings" },
    ],
  },
  doctor: {
    basePath: "/doctor",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/doctor/dashboard" },
      { label: "Case Queue", icon: Folders, path: "/doctor/cases", badge: 6 },
      { label: "Consultation", icon: Stethoscope, path: "/doctor/consultation" },
      { label: "Prescription Pad", icon: Pill, path: "/doctor/prescriptions" },
      { label: "Patient History", icon: Users, path: "/doctor/patients" },
      { label: "Schedule", icon: Calendar, path: "/doctor/schedule" },
      { label: "AI Reports", icon: BarChart3, path: "/doctor/ai-reports" },
      { label: "Notifications", icon: Bell, path: "/doctor/notifications", badge: 2 },
      { label: "Settings", icon: Settings, path: "/doctor/settings" },
    ],
  },
  admin: {
    basePath: "/admin",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { label: "Doctor Directory", icon: Users, path: "/admin/doctors" },
      { label: "Hospital Directory", icon: Building2, path: "/admin/hospitals" },
      { label: "Case Monitoring", icon: Folders, path: "/admin/cases" },
      { label: "Compliance & Audit", icon: ScrollText, path: "/admin/compliance" },
      { label: "Verification Center", icon: ShieldCheck, path: "/admin/verification" },
      { label: "System Health", icon: Activity, path: "/admin/system" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications" },
      { label: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
};

interface SidebarProps {
  portal: PortalType;
  userName: string;
  userRole: string;
  onLogout?: () => void;
}

export function Sidebar({ portal, userName, userRole, onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const config = portalNavConfig[portal];
  const primaryActionLabel = portal === "patient" ? "New Case" : portal === "doctor" ? "New Case" : "Add User";

  const handlePrimaryAction = () => {
    if (portal === "patient") {
      navigate("/patient/ai-medical-assistant");
    } else if (portal === "doctor") {
      navigate("/doctor/cases");
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-sidebar-width flex-col border-r border-border-subtle bg-card p-4 shadow-card">
      {/* Logo / Brand */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-headline text-headline-md font-semibold tracking-tight text-primary">MedBridge</h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Health Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {config.items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 active:scale-95",
                isActive
                  ? "bg-surface-container-low font-semibold text-primary"
                  : "font-medium text-muted-foreground hover:bg-surface-container hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-label-md">{item.label}</span>
              {item.badge && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto space-y-1 border-t border-border-subtle pt-4">
        <button
          onClick={handlePrimaryAction}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-primary transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="text-label-md">{primaryActionLabel}</span>
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-surface-container"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="text-sm">Support</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-destructive transition-colors hover:bg-error-soft"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </button>

      </div>
    </aside>
  );
}
