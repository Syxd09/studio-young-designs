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
      { name: "description", content: "Custom modular kitchens built around the way your family cooks and gathers. Premium materials, master craftsmanship." },
    ],
  }),
  component: KitchensPage,
});

const data: ServicePageData = {
  slug: "kitchens",
  title: "Kitchens",
  subtitle: "Custom modular kitchens built around the way your family cooks and gathers.",
  heroImage: svcKitchen,
  intro: "Where every meal begins with beautiful design.",
  description:
    "Our kitchens are conceived as the heart of the home — spaces where cooking, gathering, and daily ritual overlap. We design every cabinet, countertop, and detail from scratch, using sustainably sourced hardwoods, natural stone, and handmade hardware. Each kitchen is unique to the family it serves.",
  features: [
    {
      title: "Custom Cabinetry",
      description: "Handcrafted cabinets in walnut, oak and lacquer finishes — built to your exact specifications with soft-close hinges and premium internals.",
    },
    {
      title: "Stone Countertops",
      description: "Italian marble, Brazilian quartzite, and locally sourced granite — each slab hand-selected for grain and character.",
    },
    {
      title: "Integrated Appliances",
      description: "Seamless integration of premium appliances from Miele, Gaggenau, and Bosch — hidden behind cabinetry for a clean, unified aesthetic.",
    },
    {
      title: "Smart Storage",
      description: "Corner carousels, pull-out pantries, drawer organisers, and custom spice racks — every centimetre of space made purposeful.",
    },
    {
      title: "Island & Breakfast Bars",
      description: "Statement islands in bookmatched stone with waterfall edges, designed for cooking, dining, and conversation.",
    },
    {
      title: "Lighting Design",
      description: "Layered lighting with under-cabinet LEDs, pendant features, and dimmable ambiance — tuned to the time of day.",
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
  marqueeItems: ["Walnut", "Marble", "Brass", "Handcrafted", "Modular", "Bespoke"],
};

function KitchensPage() {
  return <ServicePageLayout data={data} />;
}
