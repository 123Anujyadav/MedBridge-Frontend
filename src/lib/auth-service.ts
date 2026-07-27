// ============================================
// Auth Service — MedBridge Platform
// Wraps all /api/v1/auth/* API calls
// ============================================
import api, { clearTokens, setTokens, TOKEN_KEYS } from "./api";
import type { TokenResponse, UserResponse } from "@/types/api";

export interface LoginParams {
  email: string;
  password: string;
  /** Optional UI hint for which portal was used; not sent to the API. */
  role?: "patient" | "doctor" | "admin";
}

export interface PatientSignupParams {
  email: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth: string;
    gender: string;
  };
}

export interface DoctorSignupParams {
  email: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
    specialty: string;
    license_number: string;
    hospital_id?: string;
    hospital_name?: string;
    years_of_experience?: number;
    bio?: string;
  };
}

const authService = {
  /**
   * Login with email/password. Stores tokens in localStorage.
   * Returns the logged-in user details.
   */
  async login(params: LoginParams): Promise<UserResponse> {
    const { data } = await api.post<TokenResponse>("/auth/login", params);
    setTokens(data.access_token, data.refresh_token);
    const user = await authService.getMe();
    localStorage.setItem(TOKEN_KEYS.ROLE, user.role);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    return user;
  },

  /**
   * Sign up a new patient account.
   */
  async signupPatient(params: PatientSignupParams): Promise<{ message: string; user_id: string }> {
    const { data } = await api.post<{ message: string; user_id: string }>(
      "/auth/signup/patient",
      params
    );
    return data;
  },

  /**
   * Sign up a new doctor account.
   */
  async signupDoctor(params: DoctorSignupParams): Promise<{ message: string; user_id: string }> {
    const { data } = await api.post<{ message: string; user_id: string }>(
      "/auth/signup/doctor",
      params
    );
    return data;
  },

  /**
   * Logout — blacklists the refresh token on the backend then clears localStorage.
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // Swallow errors — clear local session regardless
      }
    }
    clearTokens();
  },

  /**
   * Fetch the currently authenticated user from the backend.
   */
  async getMe(): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>("/auth/me");
    return data;
  },

  /**
   * Trigger password reset email.
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  /**
   * Consume reset token and set a new password.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
  },

  /**
   * Restore session from localStorage — validates that a stored access token still works.
   */
  async restoreSession(): Promise<UserResponse | null> {
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!accessToken) return null;
    try {
      const user = await authService.getMe();
      localStorage.setItem(TOKEN_KEYS.ROLE, user.role);
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
      return user;
    } catch {
      clearTokens();
      return null;
    }
  },
};

export default authService;
