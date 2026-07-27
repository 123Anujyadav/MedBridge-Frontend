// ============================================
// AI Medical Assistant Service
// Wraps /api/v1/ai/assistant/* — reuses the shared
// axios client (auth headers + token refresh).
// ============================================
import api from "./api";
import type { AIResponseData } from "@/components/patient/ai-assistant/cards/StructuredAIResponse";

export type EmergencyRisk = "normal" | "moderate" | "critical";

/** One assistant turn, as returned by the backend. */
export interface AssistantMessagePayload {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  structured_data: AIResponseData;
  symptoms_detected: string[];
  specialist_suggested: string | null;
  references: string[];
}

/** Everything the page needs after one exchange. */
export interface SendMessageResponse {
  conversation_id: string;
  title: string;
  message: AssistantMessagePayload;
  conversation_summary: string | null;
  detected_symptoms: string[];
  suggested_specialist: string | null;
  medical_references: string[];
  emergency_risk: EmergencyRisk;
  degraded: boolean;
}

export interface ConversationSummary {
  conversation_id: string;
  title: string;
  preview: string;
  language: string;
  emergency_risk: EmergencyRisk;
  symptoms: string[];
  specialist: string | null;
  message_count: number;
  updated_at: string;
}

export interface ConversationTurn {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  structured_data: AIResponseData;
}

export interface ConversationDetail {
  conversation_id: string;
  title: string;
  status: string;
  summary: string | null;
  language: string;
  emergency_risk: EmergencyRisk;
  detected_symptoms: string[];
  suggested_specialist: string | null;
  medical_references: string[];
  messages: ConversationTurn[];
  created_at: string;
  updated_at: string;
}

const assistantService = {
  /**
   * Send a patient message. Omit conversationId to start a new thread;
   * pass the id returned previously to continue one (this is what gives
   * the assistant its memory across turns).
   */
  async sendMessage(params: {
    message: string;
    conversationId?: string | null;
  }): Promise<SendMessageResponse> {
    const { data } = await api.post<SendMessageResponse>("/ai/assistant/messages", {
      message: params.message,
      conversation_id: params.conversationId ?? null,
    });
    return data;
  },

  /** List past conversations for the history drawer. */
  async listConversations(limit = 50): Promise<ConversationSummary[]> {
    const { data } = await api.get<ConversationSummary[]>(
      "/ai/assistant/conversations",
      { params: { limit } }
    );
    return data;
  },

  /** Load one conversation with its full transcript. */
  async getConversation(conversationId: string): Promise<ConversationDetail> {
    const { data } = await api.get<ConversationDetail>(
      `/ai/assistant/conversations/${conversationId}`
    );
    return data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/ai/assistant/conversations/${conversationId}`);
  },
};

export default assistantService;
