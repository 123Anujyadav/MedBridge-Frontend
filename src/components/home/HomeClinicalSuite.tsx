import {
  Activity,
  Eye,
  Database,
  LineChart,
  ShieldAlert,
  UserCheck,
  PhoneCall,
  Building,
  Users,
  Lock,
  HeartPulse,
  Receipt,
} from "lucide-react";
import ScrollReveal, { StaggerReveal } from "./effects/ScrollReveal";
import GlassCard from "./effects/GlassCard";

const tools = [
  {
    icon: <Activity className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Symptom Analysis",
    desc: "Real-time triage & recommendations",
  },
  {
    icon: <Eye className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Vision AI Diagnostics",
    desc: "Automated medical image analysis",
  },
  {
    icon: <Database className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "EHR / PACS Integration",
    desc: "Universal data format compatibility",
  },
  {
    icon: <LineChart className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Lab Data Analytics",
    desc: "Instant interpretation of lab values",
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Smart Rx",
    desc: "Automated drug interaction check",
  },
  {
    icon: <UserCheck className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Universal Profiles",
    desc: "Cross-hospital data interoperability",
  },
  {
    icon: <PhoneCall className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Emergency SOS",
    desc: "1-tap dispatch & priority alerts",
  },
  {
    icon: <Building className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Pharmacy Network",
    desc: "Inventory-based medicine routing",
  },
  {
    icon: <Users className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Doctor Match",
    desc: "AI matching based on case history",
  },
  {
    icon: <Lock className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Consent Manager",
    desc: "Granular permission control",
  },
  {
    icon: <HeartPulse className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Vitals Sync",
    desc: "Real-time IoT device data ingestion",
  },
  {
    icon: <Receipt className="w-5 h-5 text-emerald-600 float-icon" />,
    title: "Smart Billing",
    desc: "Automated insurance & claims AI",
  },
];

export default function HomeClinicalSuite() {
  return (
    <section id="clinical-suite" className="py-20 lg:py-24 bg-[#fafcfb] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-teal-100/20 rounded-full blur-[110px] -z-10 pointer-events-none mesh-gradient-orb-2" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-100/20 rounded-full blur-[100px] -z-10 pointer-events-none mesh-gradient-orb-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Clinical Intelligence Suite
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            12 interconnected diagnostic tools, zero platform complexity.
          </p>
        </ScrollReveal>

        {/* 12 Tools Grid */}
        <StaggerReveal
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          staggerDelay={0.05}
        >
          {tools.map((t) => (
            <GlassCard
              key={t.title}
              className="p-6 rounded-2xl space-y-3 group hover:border-emerald-300 transition-colors"
              variant="light"
              tilt={true}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                {t.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-base">{t.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
            </GlassCard>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
