import { lazy, Suspense } from "react";
import {
  HomeHeader,
  HomeHero,
  HomeTrustBar,
  HomeFeatures,
  HomePharmacyWorkflow,
  HomeEmergency,
  HomeAIAssistant,
  HomeComparison,
  HomeTestimonials,
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
    // `overflow-x-clip` (not `-hidden`) stops the decorative SOS ping ring and
    // hero glows from extending the document past the viewport on narrow
    // screens. `clip` does not create a scroll container, so the sticky header
    // keeps working; `hidden` would break it.
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

      {/* The page had nav, header and footer landmarks but no `main`, so a
          screen-reader user had no way to skip the navigation and jump to the
          content. A plain wrapper — no styling, no layout effect. */}
      <main id="main-content">
        <HomeHero />
        <HomeTrustBar />
        <HomeFeatures />
        <HomePharmacyWorkflow />
        <HomeEmergency />
        <HomeAIAssistant />
        <HomeComparison />
        <HomeTestimonials />
        <HomeCTA />
      </main>

      <HomeFooter />
    </div>
  );
}
