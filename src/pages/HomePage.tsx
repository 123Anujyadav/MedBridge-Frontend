import { lazy, Suspense } from "react";
import {
  HomeHeader,
  HomeHero,
  HomeStatsPartners,
  HomeTrustBar,
  HomeCareJourney,
  HomeThoughtDiagnostics,
  HomeFeatures,
  HomeRxOrder,
  HomePharmacyWorkflow,
  HomeClinicalSuite,
  HomeEmergency,
  HomeAIAssistant,
  HomeSecurity,
  HomeComparison,
  HomeTestimonials,
  HomeFAQ,
  HomeCTA,
  HomeFooter,
} from "@/components/home";

// Heavy 3D background — lazy loaded, renders after content is interactive
const GlobalParticleCanvas = lazy(
  () => import("@/components/home/3d/GlobalParticleCanvas")
);
// Cursor spotlight — lazy loaded, non-critical
const CursorSpotlight = lazy(
  () => import("@/components/home/effects/CursorSpotlight")
);

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fafcfb] text-[#0f172a] font-sans antialiased selection:bg-[#064e3b] selection:text-white">
      {/* Global WebGL particle background — fixed, behind all content */}
      <Suspense fallback={null}>
        <GlobalParticleCanvas />
      </Suspense>

      {/* Cursor spotlight — follows mouse with teal glow */}
      <Suspense fallback={null}>
        <CursorSpotlight />
      </Suspense>

      <HomeHeader />

      <main id="main-content">
        <HomeHero />
        <HomeStatsPartners />
        <HomeTrustBar />
        <HomeCareJourney />
        <HomeThoughtDiagnostics />
        <HomeFeatures />
        <HomeRxOrder />
        <HomePharmacyWorkflow />
        <HomeClinicalSuite />
        <HomeEmergency />
        <HomeAIAssistant />
        <HomeSecurity />
        <HomeComparison />
        <HomeTestimonials />
        <HomeFAQ />
        <HomeCTA />
      </main>

      <HomeFooter />
    </div>
  );
}
