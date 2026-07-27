import React from "react";
import { MedicalSummaryCard } from "./MedicalSummaryCard";
import { SymptomsCard } from "./SymptomsCard";
import { CausesCard, type CauseItem } from "./CausesCard";
import { ActionCard } from "./ActionCard";
import { LifestyleCard, type LifestyleAdviceItem } from "./LifestyleCard";
import { MedicineCard, type MedicineGuidanceItem } from "./MedicineCard";
import { SpecialistCard } from "./SpecialistCard";
import { UrgencyCard, type UrgencyLevel } from "./UrgencyCard";
import { EmergencyCard } from "./EmergencyCard";
import { ReferencesCard } from "./ReferencesCard";
import { FollowUpCard } from "./FollowUpCard";
import { ConversationActionBar } from "./ConversationActionBar";

export interface AIResponseData {
  summary?: string;
  symptoms?: string[];
  causes?: CauseItem[];
  actions?: string[];
  lifestyleAdvice?: LifestyleAdviceItem[];
  medicines?: MedicineGuidanceItem[];
  specialist?: { name: string; reason: string; priority?: "Routine" | "Recommended" | "Urgent" };
  urgency?: { level: UrgencyLevel; explanation: string };
  emergency?: { heading: string; description: string; nearestHospital?: string };
  references?: string[];
  followUpQuestions?: string[];
}

interface StructuredAIResponseProps {
  data: AIResponseData;
  rawText: string;
  onSelectFollowUp: (questionText: string) => void;
  onNewQuestion?: () => void;
}

export const StructuredAIResponse: React.FC<StructuredAIResponseProps> = ({
  data,
  rawText,
  onSelectFollowUp,
  onNewQuestion,
}) => {
  return (
    <div className="space-y-4 w-full animate-fade-in">
      {/* CARD 9: Emergency Warning (Only display when needed) */}
      {data.emergency && (
        <div className="animate-fade-in transition-all duration-300">
          <EmergencyCard
            heading={data.emergency.heading}
            description={data.emergency.description}
            nearestHospital={data.emergency.nearestHospital}
          />
        </div>
      )}

      {/* CARD 1: Medical Summary */}
      {data.summary && (
        <div className="animate-fade-in transition-all duration-300">
          <MedicalSummaryCard summary={data.summary} />
        </div>
      )}

      {/* CARD 2: Detected Symptoms */}
      {data.symptoms && data.symptoms.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <SymptomsCard symptoms={data.symptoms} />
        </div>
      )}

      {/* CARD 3: Possible Causes */}
      {data.causes && data.causes.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <CausesCard causes={data.causes} />
        </div>
      )}

      {/* CARD 4: Recommended Actions */}
      {data.actions && data.actions.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <ActionCard actions={data.actions} />
        </div>
      )}

      {/* CARD 5: Lifestyle Advice */}
      {data.lifestyleAdvice && data.lifestyleAdvice.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <LifestyleCard advice={data.lifestyleAdvice} />
        </div>
      )}

      {/* CARD 6: Medicine Guidance */}
      {data.medicines && data.medicines.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <MedicineCard medicines={data.medicines} />
        </div>
      )}

      {/* CARD 7: Recommended Specialist */}
      {data.specialist && (
        <div className="animate-fade-in transition-all duration-300">
          <SpecialistCard
            specialistName={data.specialist.name}
            reason={data.specialist.reason}
            priority={data.specialist.priority}
          />
        </div>
      )}

      {/* CARD 8: Urgency Level */}
      {data.urgency && (
        <div className="animate-fade-in transition-all duration-300">
          <UrgencyCard level={data.urgency.level} explanation={data.urgency.explanation} />
        </div>
      )}

      {/* CARD 10: Medical References */}
      {data.references && data.references.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <ReferencesCard references={data.references} />
        </div>
      )}

      {/* CARD 11: Follow-up Questions */}
      {data.followUpQuestions && data.followUpQuestions.length > 0 && (
        <div className="animate-fade-in transition-all duration-300">
          <FollowUpCard questions={data.followUpQuestions} onSelectQuestion={onSelectFollowUp} />
        </div>
      )}

      {/* CARD 12: Conversation Actions Bar */}
      <div className="animate-fade-in transition-all duration-300">
        <ConversationActionBar responseText={rawText} onNewQuestion={onNewQuestion} />
      </div>
    </div>
  );
};
