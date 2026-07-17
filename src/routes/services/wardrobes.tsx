/**
 * Wardrobes service page — /services/wardrobes
 */

import { createFileRoute } from "@tanstack/react-router";
import { ServicePageLayout, type ServicePageData } from "@/components/service-page";

import svcWardrobe from "@/assets/service-wardrobe.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcComplete from "@/assets/service-complete.jpg";

export const Route = createFileRoute("/services/wardrobes")({
  head: () => ({
    meta: [
      { title: "Custom Wardrobes — Studio Young Designs" },
      { name: "description", content: "Bespoke wardrobes in walnut, oak and lacquer with brushed metal hardware. Walk-in closets designed around your life." },
    ],
  }),
  component: WardrobesPage,
});

const data: ServicePageData = {
  slug: "wardrobes",
  title: "Wardrobes",
  subtitle: "Bespoke wardrobes and dressing rooms designed around the way you dress.",
  heroImage: svcWardrobe,
  intro: "Storage elevated to an art form.",
  description:
    "A wardrobe should be more than storage — it should be a room you enjoy stepping into. We design walk-in closets, sliding-door systems, and fitted wardrobes that make the daily ritual of dressing a pleasure. Lined in cedar, finished in walnut or hand-lacquered to your chosen palette.",
  features: [
    {
      title: "Walk-In Closets",
      description: "Full dressing rooms with islands, seating, and mirror walls — designed with the same attention as any living space in your home.",
    },
    {
      title: "Sliding Door Systems",
      description: "Precision-engineered sliding mechanisms in aluminium and steel, fitted with smoked glass, mirror, or timber panels.",
    },
    {
      title: "Custom Interiors",
      description: "Adjustable shelving, pull-out shoe racks, jewelry drawers with velvet inserts, and illuminated hanging sections.",
    },
    {
      title: "Dressing Areas",
      description: "Integrated vanity tables, make-up mirrors with studio lighting, and personal display niches — quiet luxury built in.",
    },
    {
      title: "Material Palette",
      description: "Walnut, oak, cedar lining, hand-lacquer in any RAL shade, brushed brass hardware, and soft-leather pulls.",
    },
    {
      title: "Smart Lighting",
      description: "Motion-activated LED strips, backlit hanging rails, and accent spots — illuminating your collection with gallery-quality light.",
    },
  ],
  gallery: [
    { src: svcWardrobe, alt: "Walk-In Wardrobe", title: "Cedar-Lined Walk-In", span: "tall" },
    { src: p4, alt: "Wardrobe Detail", title: "Brass Pull Detail" },
    { src: p1, alt: "Sliding Doors", title: "Smoked Glass Sliders" },
    { src: svcKitchen, alt: "Dressing Area", title: "Integrated Vanity" },
    { src: p2, alt: "Interior Shelving", title: "Adjustable Shelving", span: "wide" },
    { src: svcComplete, alt: "Wardrobe Lighting", title: "Motion-Activated LEDs" },
  ],
  marqueeItems: ["Walnut", "Cedar", "Brass", "Walk-In", "Sliding", "Bespoke"],
};

function WardrobesPage() {
  return <ServicePageLayout data={data} />;
}
