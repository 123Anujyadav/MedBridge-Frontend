import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "./ErrorBoundary";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("patient" | "doctor" | "admin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-body-sm font-semibold text-muted-foreground">Verifying secure credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    // `/` is the marketing landing page, so sending an expired session there
    // left the user hunting for a login link. `/auth` is the sign-in page.
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
