// ============================================
// AuthContext — MedBridge Platform
// Real JWT-based authentication via backend API
// ============================================
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import authService, {
  type DoctorLoginParams,
  type LoginParams,
  type PatientSignupParams,
} from "@/lib/auth-service";
import { clearTokens, TOKEN_KEYS } from "@/lib/api";
import type { UserResponse } from "@/types/api";
import type { UserRole } from "@/types";

interface AuthContextType {
  user: UserResponse | null;
  role: UserRole | null;
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
  const queryClient = useQueryClient();

  /**
   * Throw away every cached response.
   *
   * The React Query cache lives in memory for the lifetime of the tab, and it
   * is keyed by *query*, not by account. Signing out cleared the tokens but
   * left the cache intact, so the next person to sign in on the same tab —
   * without a page reload — could be served the previous user's data straight
   * out of it for as long as it stayed fresh: their emergency profile, home
   * address, contact numbers, cases, reports.
   *
   * `clear()` rather than `invalidateQueries()`. Invalidation marks entries
   * stale but *keeps them* and still hands them to the next subscriber while a
   * refetch runs — which is exactly the moment the wrong data would be on
   * screen. `clear()` also removes mutation state and cancels in-flight
   * queries, so a response belonging to the previous session cannot land in
   * the next one.
   */
  const purgeCache = useCallback(() => {
    queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  // Normalize role string safely
  const role = user?.role
    ? (user.role.toLowerCase().trim() as UserRole)
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
        purgeCache();
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  // ── Login ─────────────────────────────────────
  // The cache is purged on the way *in* as well as on the way out. Signing out
  // is not the only way a tab changes hands: a session can be replaced without
  // one — an expired session recovered by signing in as somebody else, or a
  // logout request that failed on the network. Clearing at both ends means no
  // ordering of those events can leave one account reading another's cache.
  const login = useCallback(async (params: LoginParams) => {
    setIsLoading(true);
    try {
      purgeCache();
      const loggedUser = await authService.login(params);
      purgeCache();
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, [purgeCache]);

  // ── Clinician Login (Doctor ID + email + password) ─
  const loginDoctor = useCallback(async (params: DoctorLoginParams) => {
    setIsLoading(true);
    try {
      purgeCache();
      const loggedUser = await authService.loginDoctor(params);
      purgeCache();
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  }, [purgeCache]);

  // ── Patient Signup ─────────────────────────────
  const signupPatient = useCallback(async (params: PatientSignupParams) => {
    return authService.signupPatient(params);
  }, []);

  // ── Logout ────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // In `finally`, so a failed round trip to the server still clears the
      // browser. A logout that leaves the previous user's data on the device
      // because the network dropped is not a logout.
      setUser(null);
      clearTokens();
      purgeCache();
    }
  }, [purgeCache]);

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
