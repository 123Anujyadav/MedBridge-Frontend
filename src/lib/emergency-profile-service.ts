// ============================================
// Emergency Profile Service — MedBridge Platform
// Wraps /api/v1/patient/emergency-profile/*
// ============================================
//
// Phase 1 scope: the standing emergency record only. Nothing here dispatches,
// messages or alerts anybody — those belong to the SOS system built on top of
// this data later.
//
// Every route is patient-scoped on the server from the bearer token, so none of
// these calls takes a patient id. There is no parameter to tamper with.
import api from "./api";
import type {
  EmergencyLocationUpdate,
  EmergencyProfileResponse,
  EmergencyProfileUpsert,
} from "@/types/api";

const emergencyProfileService = {
  /**
   * The signed-in patient's emergency profile, or `null` if they have not
   * created one yet.
   *
   * The backend answers with `null` rather than 404 for "not created", so the
   * page can render an empty form instead of an error for what is simply the
   * starting state.
   */
  async getProfile(): Promise<EmergencyProfileResponse | null> {
    const { data } = await api.get<EmergencyProfileResponse | null>(
      "/patient/emergency-profile"
    );
    return data ?? null;
  },

  /** Create or update the emergency contact and registered address. */
  async saveProfile(
    payload: EmergencyProfileUpsert
  ): Promise<EmergencyProfileResponse> {
    const { data } = await api.put<EmergencyProfileResponse>(
      "/patient/emergency-profile",
      payload
    );
    return data;
  },

  /** Delete the profile in full. */
  async deleteProfile(): Promise<{ message: string; patient_id: string }> {
    const { data } = await api.delete<{ message: string; patient_id: string }>(
      "/patient/emergency-profile"
    );
    return data;
  },

  /**
   * Store coordinates captured from the browser.
   *
   * Only the two numbers are sent — the Google Maps link comes back derived on
   * the server, so the stored link can only ever point at the stored position.
   */
  async updateLocation(
    payload: EmergencyLocationUpdate
  ): Promise<EmergencyProfileResponse> {
    const { data } = await api.put<EmergencyProfileResponse>(
      "/patient/emergency-profile/location",
      payload
    );
    return data;
  },

  /** Forget the stored coordinates, keeping the contact and address. */
  async clearLocation(): Promise<EmergencyProfileResponse> {
    const { data } = await api.delete<EmergencyProfileResponse>(
      "/patient/emergency-profile/location"
    );
    return data;
  },
};

export default emergencyProfileService;
