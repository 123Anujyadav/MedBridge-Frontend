// ============================================
// AuthContext — MedBridge Platform
// Real JWT-based authentication via backend API
// ============================================
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService, {
  type DoctorLoginParams,
  type LoginParams,
  type PatientSignupParams,
} from "@/lib/auth-service";
import { clearTokens, TOKEN_KEYS } from "@/lib/api";
import type { UserResponse } from "@/types/api";

interface AuthContextType {
  user: UserResponse | null;
  role: "patient" | "doctor" | "admin" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  /** Clinician sign-in — Doctor ID, email and password. */
  loginDoctor: (params: DoctorLoginParams) => Promise<void>;
  signupPatient: (params: PatientSignupParams) => Promise<{ message: string; user_id: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Normalize role string safely
  const role = user?.role
    ? (user.role.toLowerCase().trim() as "patient" | "doctor" | "admin")
    : null;

  const isAuthenticated = !!user;

  // ── Restore session from localStorage on mount ─
  useEffect(() => {
    async function restore() {
      setIsLoading(true);
      try {
        const restored = await authService.restoreSession();
        setUser(restored);
      } catch (err) {
        console.warn("Session restoration failed, clearing auth state:", err);
        setUser(null);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  // ── Login ─────────────────────────────────────
  const login = useCallback(async (params: LoginParams) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(params);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Clinician Login (Doctor ID + email + password) ─
  const loginDoctor = useCallback(async (params: DoctorLoginParams) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.loginDoctor(params);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Patient Signup ─────────────────────────────
  const signupPatient = useCallback(async (params: PatientSignupParams) => {
    return authService.signupPatient(params);
  }, []);

  // ── Logout ────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      clearTokens();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        loginDoctor,
        signupPatient,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { TOKEN_KEYS };
