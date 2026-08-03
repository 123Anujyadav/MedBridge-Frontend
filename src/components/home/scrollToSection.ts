/**
 * Smooth-scrolls the landing page to one of its section anchors.
 * Shared by the header, hero CTAs, CTA banner and footer link columns so every
 * in-page jump behaves identically.
 */
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
