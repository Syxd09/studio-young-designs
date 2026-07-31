/**
 * Kitchens service page — /services/kitchens
 */

import { createFileRoute } from "@tanstack/react-router";
import { ServicePageLayout, type ServicePageData } from "@/components/service-page";

import svcKitchen from "@/assets/service-kitchen.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import svcLiving from "@/assets/service-living.jpg";
import svcComplete from "@/assets/service-complete.jpg";

export const Route = createFileRoute("/services/kitchens")({
  head: () => ({
    meta: [
      { title: "Modular Kitchens — Studio Young Designs" },
      {
        name: "description",
        content:
          "Custom modular kitchens built around the way your family cooks and gathers. Premium materials, master craftsmanship.",
      },
      { property: "og:url", content: "https://studioyoungdesigns.com/services/kitchens" },
    ],
    links: [{ rel: "canonical", href: "https://studioyoungdesigns.com/services/kitchens" }],
  }),
  component: KitchensPage,
});

const data: ServicePageData = {
  slug: "kitchens",
  title: "Kitchens",
  subtitle: "Every kitchen we create is a perfect balance of beauty, functionality and enduring quality.",
  heroImage: svcKitchen,
  intro: "Thoughtful Kitchens. Timeless Living.",
  description:
    "Our kitchens are conceived as the heart of the home — spaces where cooking, gathering, and daily ritual overlap. We design every cabinet, countertop, and detail from scratch, using sustainably sourced hardwoods, natural stone, and handmade hardware.",
  features: [
    {
      title: "Bespoke Kitchen Design",
      description:
        "Every kitchen is thoughtfully designed around your lifestyle, blending timeless aesthetics with intelligent functionality.",
      image: svcKitchen,
      size: "half",
      theme: "light",
    },
    {
      title: "Tailored to You",
      description:
        "Custom-designed layouts that maximize space, comfort and everyday efficiency.",
      image: p2,
      size: "half",
      theme: "dark",
    },
    {
      title: "Designed for Living",
      description:
        "Beautifully planned kitchens that balance elegance, practicality and lasting value.",
      image: p1,
      size: "full",
      theme: "light",
    },
  ],
  gallery: [
    { src: svcKitchen, alt: "Modular Kitchen", title: "Walnut & Marble Kitchen", span: "wide" },
    { src: p1, alt: "Kitchen Detail", title: "Brass Hardware Detail" },
    { src: p2, alt: "Kitchen Island", title: "Stone Island Counter" },
    { src: svcLiving, alt: "Open Kitchen", title: "Open-Plan Kitchen Living" },
    { src: p3, alt: "Kitchen Storage", title: "Custom Pantry System", span: "tall" },
    { src: svcComplete, alt: "Kitchen Lighting", title: "Under-Cabinet Lighting" },
  ],
};

function KitchensPage() {
  return <ServicePageLayout data={data} />;
}
