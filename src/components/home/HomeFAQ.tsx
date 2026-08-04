import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./effects/ScrollReveal";

const faqs = [
  {
    question: "How accurate is the AI diagnosis?",
    answer:
      "MedBridge AI operates at 98.4% diagnostic clinical accuracy by combining medical NLP models with evidence-based clinical protocols. All AI outputs serve as diagnostic decision support for licensed physicians.",
  },
  {
    question: "Is my health data secure and HIPAA-compliant?",
    answer:
      "Yes. MedBridge uses 256-bit AES encryption at rest and TLS 1.3 in transit. We maintain full HIPAA, GDPR, ABDM, and ISO 27001 compliance with strict Role-Based Access Control (RBAC) and immutable audit logs.",
  },
  {
    question: "How does the medicine ordering work?",
    answer:
      "Once a doctor issues a digital prescription (E-Rx), our AI automatically parses the medications and dispatches the order to your nearest verified partner pharmacy for doorstep delivery within 60 minutes.",
  },
  {
    question: "What happens when I trigger the SOS emergency?",
    answer:
      "Triggering SOS instantly broadcasts your live GPS position, blood group, emergency contact info, and medical history directly to the nearest hospital ER and ambulance dispatch unit.",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-0 w-[450px] h-[450px] bg-emerald-100/20 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <ScrollReveal className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#064e3b] text-xs font-bold uppercase tracking-wider gradient-border-always">
            <HelpCircle className="w-3.5 h-3.5 float-icon" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Common Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Everything you need to know about MedBridge AI Platform.
          </p>
        </ScrollReveal>

        {/* FAQ Accordion List */}
        <ScrollReveal delay={0.1}>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-slate-200/80 bg-[#fafcfb] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 text-base sm:text-lg hover:text-[#064e3b] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform duration-300 flex-shrink-0 ml-4 ${
                        isOpen ? "rotate-180 text-[#064e3b]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
