import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Stethoscope,
  Building2,
  UserCheck,
  HeartPulse,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { scrollToSection } from "./scrollToSection";

/**
 * The design ships no `how-it-works` section anchor, which left the "How It
 * Works" nav item scrolling nowhere. The 4-step Prescription-to-Pharmacy
 * timeline is the page's only step-by-step walkthrough, so it is the target.
 */
const HOW_IT_WORKS_ANCHOR = "rx-pharmacy";

export default function HomeHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToSection = (id: string) => {
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064e3b] to-[#0d9488] flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-[#064e3b] flex items-center gap-1">
              MedBridge
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800/70 -mt-1">
              AI Healthcare Platform
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        {/*
          Nav, portal actions and burger switch at `lg`, not `md`. The full
          header needs ~1013px; revealing the desktop nav at md (768px) made
          every width from 768–1012px scroll sideways.
        */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <button
            onClick={() => goToSection("features")}
            className="hover:text-[#064e3b] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => goToSection(HOW_IT_WORKS_ANCHOR)}
            className="hover:text-[#064e3b] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => goToSection("ai-assistant")}
            className="hover:text-[#064e3b] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AI Assistant
          </button>
          <button
            onClick={() => goToSection("emergency")}
            className="hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 text-red-600 font-bold"
          >
            Emergency
          </button>
          <button
            onClick={() => goToSection("rx-pharmacy")}
            className="hover:text-[#064e3b] transition-colors cursor-pointer"
          >
            Prescriptions
          </button>
          <button
            onClick={() => goToSection("why-us")}
            className="hover:text-[#064e3b] transition-colors cursor-pointer"
          >
            Doctors
          </button>
        </nav>

        {/* Right Action Buttons: Direct Portal Access & Get Started */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Portal Access Dropdown for Direct Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-emerald-50/50 font-semibold text-sm flex items-center gap-2 transition-all outline-none">
              <UserCheck className="w-4 h-4 text-[#064e3b]" />
              Portal Access
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-white rounded-xl shadow-xl border border-slate-100">
              <DropdownMenuItem
                onClick={() => navigate("/auth?role=patient&mode=login")}
                className="p-2.5 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center gap-3 text-slate-800 font-medium text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#064e3b] flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Patient Login</div>
                  <div className="text-xs text-slate-500">Access health records</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/auth?role=doctor&mode=login")}
                className="p-2.5 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center gap-3 text-slate-800 font-medium text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Doctor Login</div>
                  <div className="text-xs text-slate-500">Clinical workspace</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/auth?role=admin&mode=login")}
                className="p-2.5 hover:bg-emerald-50 rounded-lg cursor-pointer flex items-center gap-3 text-slate-800 font-medium text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Admin Login</div>
                  <div className="text-xs text-slate-500">Enterprise analytics</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Direct Get Started CTA */}
          <button
            onClick={() => navigate("/auth?role=patient&mode=signup")}
            className="px-5 py-2.5 rounded-lg bg-[#064e3b] hover:bg-[#043927] text-white font-semibold text-sm shadow-md shadow-emerald-900/15 transition-all hover:scale-[1.02] active:scale-95"
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => goToSection("features")}
            className="block w-full text-left py-2 text-slate-800 font-semibold"
          >
            Features
          </button>
          <button
            onClick={() => goToSection(HOW_IT_WORKS_ANCHOR)}
            className="block w-full text-left py-2 text-slate-800 font-semibold"
          >
            How It Works
          </button>
          <button
            onClick={() => goToSection("ai-assistant")}
            className="block w-full text-left py-2 text-[#064e3b] font-semibold"
          >
            AI Assistant
          </button>
          <button
            onClick={() => goToSection("emergency")}
            className="block w-full text-left py-2 text-red-600 font-bold"
          >
            Emergency SOS
          </button>
          <button
            onClick={() => goToSection("rx-pharmacy")}
            className="block w-full text-left py-2 text-slate-800 font-semibold"
          >
            Prescription to Pharmacy
          </button>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth?role=patient&mode=login");
              }}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-800 font-semibold text-center"
            >
              Patient Portal
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth?role=doctor&mode=login");
              }}
              className="w-full py-2.5 rounded-lg border border-emerald-600 text-[#064e3b] font-semibold text-center"
            >
              Doctor Portal
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth?role=admin&mode=login");
              }}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-center"
            >
              Admin Portal
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/auth?role=patient&mode=signup");
              }}
              className="w-full py-2.5 rounded-lg bg-[#064e3b] text-white font-semibold text-center mt-1"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
