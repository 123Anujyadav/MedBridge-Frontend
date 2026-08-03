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

export default function HomePage() {
  return (
    // `overflow-x-clip` (not `-hidden`) stops the decorative SOS ping ring and
    // hero glows from extending the document past the viewport on narrow
    // screens. `clip` does not create a scroll container, so the sticky header
    // keeps working; `hidden` would break it.
    <div className="min-h-screen overflow-x-clip bg-[#fafcfb] text-[#0f172a] font-sans antialiased selection:bg-[#064e3b] selection:text-white">
      <HomeHeader />
      <HomeHero />
      <HomeTrustBar />
      <HomeFeatures />
      <HomePharmacyWorkflow />
      <HomeEmergency />
      <HomeAIAssistant />
      <HomeComparison />
      <HomeTestimonials />
      <HomeCTA />
      <HomeFooter />
    </div>
  );
}
