/**
 * Living Spaces service page — /services/living-spaces
 */

import { createFileRoute } from "@tanstack/react-router";
import { ServicePageLayout, type ServicePageData } from "@/components/service-page";

import svcLiving from "@/assets/service-living.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import svcComplete from "@/assets/service-complete.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";

export const Route = createFileRoute("/services/living-spaces")({
  head: () => ({
    meta: [
      { title: "Living Spaces — Studio Young Designs" },
      { name: "description", content: "Living, dining and lounging rooms composed as considered whole environments. Bespoke furniture, lighting and material palettes." },
    ],
  }),
  component: LivingSpacesPage,
});

const data: ServicePageData = {
  slug: "living-spaces",
  title: "Living Spaces",
  subtitle: "Living, dining and lounging rooms composed as considered whole environments.",
  heroImage: svcLiving,
  intro: "Rooms that feel exactly like home.",
  description:
    "We approach living spaces as composed environments — every piece of furniture, every surface, every source of light considered together. The result is rooms that feel effortlessly whole, where families want to gather and guests feel immediately at ease.",
  features: [
    {
      title: "Custom Furniture",
      description: "Sofas, dining tables, consoles and shelving designed and built in-house — matched to the room's material language.",
    },
    {
      title: "Lighting Design",
      description: "Layered schemes with architectural coves, floor lamps, and statement pendants — creating mood from morning to evening.",
    },
    {
      title: "Wall Treatments",
      description: "Hand-plastered textures, timber panelling, natural stone feature walls, and curated paint palettes.",
    },
    {
      title: "Entertainment Systems",
      description: "Hidden media installations, integrated sound systems, and concealed wiring — technology that disappears into the design.",
    },
    {
      title: "Art & Object Curation",
      description: "We work with collectors and galleries to select and place artwork that completes each space.",
    },
    {
      title: "Textile Selection",
      description: "Curtains, upholstery, rugs, and cushions — chosen for texture, weight, and how they feel against the skin.",
    },
  ],
  gallery: [
    { src: svcLiving, alt: "Living Room", title: "Walnut & Linen Living Room", span: "wide" },
    { src: p1, alt: "Dining Area", title: "Oak Dining Table" },
    { src: p3, alt: "Reading Nook", title: "Library & Reading Corner" },
    { src: svcComplete, alt: "Living Detail", title: "Stone & Brass Detail" },
    { src: p2, alt: "Lounge", title: "Evening Lounge Setting", span: "tall" },
    { src: svcKitchen, alt: "Open Plan", title: "Open-Plan Living & Dining" },
  ],
  marqueeItems: ["Custom", "Lighting", "Textiles", "Art", "Furniture", "Bespoke"],
};

function LivingSpacesPage() {
  return <ServicePageLayout data={data} />;
}
