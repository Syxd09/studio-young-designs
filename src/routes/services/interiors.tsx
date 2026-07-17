/**
 * Interiors service page — /services/interiors
 */

import { createFileRoute } from "@tanstack/react-router";
import { ServicePageLayout, type ServicePageData } from "@/components/service-page";

import svcComplete from "@/assets/service-complete.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import svcLiving from "@/assets/service-living.jpg";

export const Route = createFileRoute("/services/interiors")({
  head: () => ({
    meta: [
      { title: "Complete Interiors — Studio Young Designs" },
      { name: "description", content: "End-to-end interior design and execution for residences and commercial spaces. One studio, from first sketch to final handover." },
    ],
  }),
  component: InteriorsPage,
});

const data: ServicePageData = {
  slug: "interiors",
  title: "Interiors",
  subtitle: "End-to-end interior design and execution — from first sketch to final handover.",
  heroImage: svcComplete,
  intro: "Complete spaces, considered down to the last brass detail.",
  description:
    "Our complete interior service is for clients who want one studio to handle everything — concept, material selection, furniture, execution, and installation. We take entire homes, offices, and hospitality spaces from blank shell to finished environment, working as a single accountable team throughout.",
  features: [
    {
      title: "Space Planning",
      description: "Detailed floor plans, circulation studies, and 3D walkthroughs — ensuring every room flows naturally before a single wall is built.",
    },
    {
      title: "Material Selection",
      description: "Woods, stones, metals, textiles, and finishes — sourced from across India and Italy, chosen by hand in our material library.",
    },
    {
      title: "Project Management",
      description: "A dedicated project manager, weekly site visits, detailed timelines, and transparent costing — so you never have to wonder what's next.",
    },
    {
      title: "Turnkey Delivery",
      description: "From civil works to furniture placement, lighting to landscaping — we hand over a finished space, ready to inhabit.",
    },
    {
      title: "Commercial Interiors",
      description: "Offices, retail spaces, restaurants, and hospitality projects — designed with the same care and craft we bring to homes.",
    },
    {
      title: "Post-Handover Care",
      description: "A one-year warranty on all installations, with ongoing maintenance guidance for wood, stone, and metal surfaces.",
    },
  ],
  gallery: [
    { src: svcComplete, alt: "Complete Interior", title: "Sadashivanagar Residence", span: "wide" },
    { src: p1, alt: "Dining Room", title: "Formal Dining Room" },
    { src: p4, alt: "Bathroom", title: "Marble & Walnut Bath" },
    { src: p3, alt: "Study", title: "Home Library & Study", span: "tall" },
    { src: svcLiving, alt: "Living Room", title: "Living Room Composition" },
    { src: p2, alt: "Bedroom", title: "Master Bedroom Suite" },
  ],
  marqueeItems: ["Turnkey", "Bespoke", "Premium", "40+ Years", "700+ Homes", "One Studio"],
};

function InteriorsPage() {
  return <ServicePageLayout data={data} />;
}
