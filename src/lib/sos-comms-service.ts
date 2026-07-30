// ============================================
// SOS Communications Service — MedBridge
// Wraps the Phase 3 read endpoints
// ============================================
//
// The frontend never talks to Twilio or Google directly. Both are backend
// concerns: the credentials stay server-side, and the browser consumes the
// platform's own APIs, so a change of vendor is invisible here.
import api from "./api";
import type {
  SOSCommunicationsResponse,
  SOSHospitalResponse,
  SOSTimelineResponse,
} from "@/types/api";

const sosCommsService = {
  async getCommunications(id: string): Promise<SOSCommunicationsResponse> {
    const { data } = await api.get<SOSCommunicationsResponse>(
      `/patient/sos/${id}/communications`
    );
    return data;
  },

  async getTimeline(id: string): Promise<SOSTimelineResponse> {
    const { data } = await api.get<SOSTimelineResponse>(
      `/patient/sos/${id}/timeline`
    );
    return data;
  },

  async getHospital(id: string): Promise<SOSHospitalResponse> {
    const { data } = await api.get<SOSHospitalResponse>(
      `/patient/sos/${id}/hospital`
    );
    return data;
  },
};

export default sosCommsService;
