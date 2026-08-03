import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, type PortalType } from "./SideBar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUserAvatar } from "@/hooks/useAvatar";
import { useWebSocket } from "@/hooks/useWebSocket";

interface AppShellProps {
  portal: PortalType;
  userName: string;
  userRole: string;
  searchPlaceholder: string;
  children: ReactNode;
}

export function AppShell({ portal, userName, userRole, searchPlaceholder, children }: AppShellProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useWebSocket();

  // Read from the same profile cache the profile page writes on upload, so the
  // photo in the top bar changes the moment it is saved, on every page.
  const { avatarUrl } = useCurrentUserAvatar();


  const handleLogout = async () => {
    await logout();
    // Signing out returns to the homepage, the platform's primary landing
    // page, where Portal Access leads back into the right login.
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background decorations */}
      <div className="ambient-blob -right-[10%] -top-[10%] h-[50%] w-[50%] bg-primary/5" />
      <div className="ambient-blob -bottom-[10%] -left-[10%] h-[40%] w-[40%] bg-secondary/5" />

      <Sidebar portal={portal} userName={userName} userRole={userRole} onLogout={handleLogout} />
      <TopBar
        searchPlaceholder={searchPlaceholder}
        userName={userName}
        userRole={userRole}
        avatarUrl={avatarUrl}
      />
      <main className="ml-sidebar-width min-h-screen pt-top-nav-height p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
