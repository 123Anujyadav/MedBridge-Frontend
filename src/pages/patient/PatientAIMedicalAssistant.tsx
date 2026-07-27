import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import assistantService from "@/lib/assistant-service";
import { ChatHeader } from "@/components/patient/ai-assistant/ChatHeader";
import { ChatContainer } from "@/components/patient/ai-assistant/ChatContainer";
import { ChatInput } from "@/components/patient/ai-assistant/ChatInput";
import { RightSidebar } from "@/components/patient/ai-assistant/RightSidebar";
import { ChatHistoryDrawer } from "@/components/patient/ai-assistant/history/ChatHistoryDrawer";
import { type ConversationHistoryItem } from "@/components/patient/ai-assistant/history/ConversationPreview";
import { type MessageType } from "@/components/patient/ai-assistant/ChatMessage";
import { type AIResponseData } from "@/components/patient/ai-assistant/cards/StructuredAIResponse";

export default function PatientAIMedicalAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Server-side conversation id. Carrying it on each send is what gives the
  // assistant memory of earlier symptoms and questions.
  const [conversationId, setConversationId] = useState<string | null>(null);

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Responsive Drawer & Tablet Collapse state
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);

  // Right Side Panel Telemetry State
  const [detectedSymptoms, setDetectedSymptoms] = useState<string[]>([]);
  const [conversationSummary, setConversationSummary] = useState<string | null>(null);
  const [suggestedSpecialist, setSuggestedSpecialist] = useState<string | null>(null);
  const [medicalReferences, setMedicalReferences] = useState<string[]>([]);
  const [emergencyRisk, setEmergencyRisk] = useState<"normal" | "moderate" | "critical">("normal");

  // Click suggestion chip -> Populates input box ONLY (does NOT send automatically as per prompt requirement)
  const handleSelectSuggestion = (queryText: string) => {
    setInputText(queryText);
    toast({
      title: "Query Loaded",
      description: "Suggestion populated in input box. Click Send when ready.",
    });
  };

  // Open conversation from history drawer
  const handleSelectHistoryConversation = (item: ConversationHistoryItem) => {
    setIsHistoryOpen(false);
    setInputText("");
    setDetectedSymptoms(item.symptoms);
    setSuggestedSpecialist(item.specialist || "General Practitioner");
    setConversationSummary(item.preview);

    const userTime = item.time;
    const aiTime = item.time;

    setMessages([
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: `Tell me about ${item.title}`,
        timestamp: userTime,
      },
      {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: item.preview,
        timestamp: aiTime,
        symptomsDetected: item.symptoms,
        specialistSuggested: item.specialist,
        structuredData: {
          summary: item.preview,
          symptoms: item.symptoms,
          specialist: item.specialist
            ? { name: item.specialist, reason: "Specialist consultation history match" }
            : undefined,
          urgency: { level: item.urgency, explanation: "Retrieved from patient history record." },
        },
      },
    ]);

    toast({
      title: "History Loaded",
      description: `Loaded consultation: "${item.title}".`,
    });
  };

  // Send message flow — calls the AI Medical Assistant backend.
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isThinking) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: MessageType = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const result = await assistantService.sendMessage({
        message: text,
        conversationId,
      });

      // Retain the thread id so the assistant remembers earlier turns.
      setConversationId(result.conversation_id);

      const aiMsg: MessageType = {
        id: result.message.id,
        sender: "ai",
        text: result.message.text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        symptomsDetected: result.message.symptoms_detected,
        specialistSuggested: result.message.specialist_suggested ?? undefined,
        references: result.message.references,
        structuredData: result.message.structured_data,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setDetectedSymptoms(result.detected_symptoms);
      setSuggestedSpecialist(result.suggested_specialist);
      setMedicalReferences(result.medical_references);
      setConversationSummary(result.conversation_summary);
      setEmergencyRisk(result.emergency_risk);

      if (result.degraded) {
        toast({
          title: "Limited Response",
          description:
            "The AI service is temporarily degraded. Please try again shortly.",
        });
      }
    } catch (err) {
      const description =
        err instanceof Error ? err.message : "Could not reach the AI assistant.";
      toast({
        variant: "destructive",
        title: "Assistant Unavailable",
        description,
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleRegenerateMessage = (msgIndex: number) => {
    if (msgIndex <= 0) return;
    const previousUserMsg = messages[msgIndex - 1];
    if (previousUserMsg && previousUserMsg.sender === "user") {
      setMessages((prev) => prev.slice(0, msgIndex));
      setInputText(previousUserMsg.text);
      toast({
        title: "Query Reloaded",
        description: "Previous question re-loaded into input box. Click Send to regenerate response.",
      });
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInputText("");
    setConversationId(null);
    setDetectedSymptoms([]);
    setConversationSummary(null);
    setSuggestedSpecialist(null);
    setMedicalReferences([]);
    setEmergencyRisk("normal");
    toast({
      title: "Chat Reset",
      description: "Conversation history cleared.",
    });
  };

  return (
    <AppShell
      portal="patient"
      userName={user?.email || "Patient"}
      userRole="Patient Portal"
      searchPlaceholder="Search AI medical assistant, symptoms, or guidelines..."
    >
      {/* AI Conversation History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectConversation={handleSelectHistoryConversation}
        onStartNewConversation={handleClearChat}
      />

      {/* Enhanced Top Header */}
      <ChatHeader
        hasMessages={messages.length > 0}
        isProcessing={isThinking}
        onClearChat={handleClearChat}
        onToggleMobilePanel={() => setIsMobilePanelOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex gap-6 h-[calc(100vh-14rem)] min-h-[580px] overflow-hidden">
        {/* Conversation Area (Left/Center Column) */}
        <div className="flex-1 flex flex-col rounded-2xl border border-border-subtle bg-card shadow-card overflow-hidden h-full">
          {/* Scrollable Conversation Container */}
          <ChatContainer
            messages={messages}
            isThinking={isThinking}
            onSelectSuggestion={handleSelectSuggestion}
            onRegenerateMessage={handleRegenerateMessage}
          />

          {/* Sticky Input Bar at Bottom */}
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSendMessage}
            disabled={isThinking}
          />
        </div>

        {/* Right Side Panel (360px Desktop, Collapsible Tablet, Slide-Over Mobile Drawer) */}
        <RightSidebar
          conversationSummary={conversationSummary}
          detectedSymptoms={detectedSymptoms}
          suggestedSpecialist={suggestedSpecialist}
          medicalReferences={medicalReferences}
          emergencyRisk={emergencyRisk}
          isThinking={isThinking}
          isOpenMobile={isMobilePanelOpen}
          onCloseMobile={() => setIsMobilePanelOpen(false)}
          isCollapsedTablet={isTabletCollapsed}
          onToggleCollapseTablet={() => setIsTabletCollapsed(!isTabletCollapsed)}
        />
      </div>
    </AppShell>
  );
}
