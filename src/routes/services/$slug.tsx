import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { ServicePageLayout, type ServicePageData } from "@/components/service-page";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/services/$slug")({
  head: ({ match }) => {
    const slug = match.params.slug;
    const formattedTitle = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const SERVICE_SEO_MAP: Record<string, { title: string; desc: string }> = {
      kitchens: {
        title: "Modular Kitchens in Bangalore | Studio Young Designs",
        desc: "Precision-engineered modular kitchens in Bangalore tailored for modern luxury. Blum & Hettich German soft-close fittings, acrylic finishes, and BWP marine plywood.",
      },
      kitchen: {
        title: "Modular Kitchens in Bangalore | Studio Young Designs",
        desc: "Precision-engineered modular kitchens in Bangalore tailored for modern luxury. Blum & Hettich German soft-close fittings, acrylic finishes, and BWP marine plywood.",
      },
      wardrobes: {
        title: "Custom Walk-in Wardrobes in Bangalore | Studio Young Designs",
        desc: "Bespoke walk-in closets, sliding glass wardrobes, and luxury bedroom storage in Bangalore. Handcrafted with natural veneers, solid wood, and integrated LED lighting.",
      },
      wardrobe: {
        title: "Custom Walk-in Wardrobes in Bangalore | Studio Young Designs",
        desc: "Bespoke walk-in closets, sliding glass wardrobes, and luxury bedroom storage in Bangalore. Handcrafted with natural veneers, solid wood, and integrated LED lighting.",
      },
      interiors: {
        title: "Turnkey Residential Interiors in Bangalore | Studio Young Designs",
        desc: "End-to-end luxury home interiors for apartments, penthouses, and villas in Bangalore. Single-point accountability from architectural design to final handover.",
      },
      interior: {
        title: "Turnkey Residential Interiors in Bangalore | Studio Young Designs",
        desc: "End-to-end luxury home interiors for apartments, penthouses, and villas in Bangalore. Single-point accountability from architectural design to final handover.",
      },
      "living-spaces": {
        title: "Living Room Interiors & Furniture in Bangalore | Studio Young Designs",
        desc: "Custom living room interiors, TV credenzas, wall paneling, fluted wood partitions, and handcrafted leather sofas tailored to your Bengaluru home.",
      },
      furniture: {
        title: "Bespoke Handcrafted Furniture Store in Bangalore | Studio Young Designs",
        desc: "Handcrafted solid teakwood dining tables, custom sofas, consoles, and credenzas made in our Bangalore atelier since 1981.",
      },
      "custom-furniture": {
        title: "Custom Furniture Atelier in Bangalore | Studio Young Designs",
        desc: "Bespoke architectural furniture made with natural veneers, solid hardwoods, and precision joinery in Bangalore.",
      },
      "office-furniture": {
        title: "Executive Office & Workstation Furniture in Bangalore | Studio Young Designs",
        desc: "Bespoke executive desks, conference tables, acoustic wooden paneling, and commercial furniture in Bangalore.",
      },
      "home-improvement": {
        title: "Full-Home Renovation & Interior Improvement in Bangalore | Studio Young Designs",
        desc: "Turnkey residential renovation, space redesign, civil updates, false ceiling lighting, and interior overhaul across Bangalore.",
      },
    };

    const targetSeo = SERVICE_SEO_MAP[slug] || {
      title: `${formattedTitle} in Bangalore | Studio Young Designs`,
      desc: `Bespoke luxury ${formattedTitle.toLowerCase()} design, custom manufacturing, and turnkey execution in Bangalore by Studio Young Designs. 45+ years of craftsmanship.`,
    };

    return {
      meta: [
        { title: targetSeo.title },
        {
          name: "description",
          content: targetSeo.desc,
        },
        {
          name: "keywords",
          content: `${formattedTitle.toLowerCase()} Bangalore, custom ${formattedTitle.toLowerCase()} Bangalore, luxury ${formattedTitle.toLowerCase()} design, interior designers Bangalore, custom woodwork Bangalore`,
        },
        { property: "og:title", content: targetSeo.title },
        {
          property: "og:description",
          content: targetSeo.desc,
        },
        { property: "og:image", content: "https://www.studioyoungdesigns.com/og.jpg" },
        { property: "og:url", content: `https://www.studioyoungdesigns.com/services/${slug}` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: targetSeo.title },
        {
          name: "twitter:description",
          content: targetSeo.desc,
        },
        { property: "og:image", content: "https://www.studioyoungdesigns.com/og.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://www.studioyoungdesigns.com/services/${slug}` }],
    };
  },
  component: DynamicServicePage,
});

const FALLBACK_SERVICES: Record<string, any> = {
  kitchens: {
    slug: "kitchens",
    title: "Premium Modular Kitchens",
    short_desc: "Precision-engineered kitchens tailored for modern luxury.",
    description:
      "Since 1981, Studio Young Designs has engineered bespoke modular kitchens across Bangalore. Blending German soft-close mechanisms (Blum & Hettich), Boiling Water Proof (BWP) marine plywood, quartz countertops, and concealed pantry storage.",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "German Soft-Close Joinery",
        description: "Blum & Hettich motorized lift-up doors, Tandembox drawers, and corner carousels.",
        size: "half",
        theme: "light",
      },
      {
        title: "BWP Marine Plywood",
        description: "Boiling Water Proof grade IS-710 marine plywood core built for lifetime durability.",
        size: "half",
        theme: "dark",
      },
    ],
  },
  wardrobes: {
    slug: "wardrobes",
    title: "Custom Walk-in Wardrobes",
    short_desc: "Bespoke walk-in closets and luxury bedroom storage.",
    description:
      "Handcrafted walk-in closets, sliding glass wardrobes, and floor-to-ceiling hinged wardrobes in Bangalore. Featuring natural wood veneers, leather-wrapped drawers, integrated LED lighting, and island jewelry dressers.",
    image_url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Walk-in Suite Closets",
        description: "Custom island dressers, illuminated watch drawers, and velvet-lined compartments.",
        size: "half",
        theme: "light",
      },
      {
        title: "Glass & Aluminum Shutters",
        description: "Fluted glass doors with concealed soft-close hinges and anodized aluminum frames.",
        size: "half",
        theme: "dark",
      },
    ],
  },
  interiors: {
    slug: "interiors",
    title: "Turnkey Residential Interiors",
    short_desc: "Complete end-to-end luxury home interiors and architectural execution.",
    description:
      "Comprehensive interior execution for 3BHK, 4BHK, penthouses, and luxury villas in Bangalore. Single-point accountability covering space planning, civil modifications, electrical routing, custom joinery, false ceiling lighting, and white-glove handover.",
    image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Single-Point Accountability",
        description: "Complete design, civil modification, custom manufacturing, and white-glove installation.",
        size: "half",
        theme: "light",
      },
      {
        title: "In-House Woodcraft Atelier",
        description: "All furniture and joinery manufactured in our Bangalore factory with strict quality control.",
        size: "half",
        theme: "dark",
      },
    ],
  },
  "living-spaces": {
    slug: "living-spaces",
    title: "Living Room Interiors & Furniture",
    short_desc: "Custom living room interiors, media consoles, and handcrafted seating.",
    description:
      "Custom living room design featuring acoustic wooden wall paneling, fluted wood partitions, TV credenzas, Italian leather sofas, and architectural lighting in Bangalore.",
    image_url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Media Wall Consoles",
        description: "Concealed wiring, Italian marble backdrops, and fluted teakwood paneling.",
        size: "half",
        theme: "light",
      },
      {
        title: "Handcrafted Seating",
        description: "Italian leather, high-density comfort foam, and solid hardwood frames.",
        size: "half",
        theme: "dark",
      },
    ],
  },
  furniture: {
    slug: "furniture",
    title: "Bespoke Handcrafted Furniture Store",
    short_desc: "Custom teakwood, walnut, and oak furniture handcrafted in our Bangalore atelier.",
    description:
      "Since 1981, Studio Young Designs has been crafting bespoke luxury furniture for homes in Bangalore. From solid teak dining tables and leather-upholstered seating to custom coffee tables, credenzas, and consoles, every piece is built to endure for generations.",
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Solid Wood Dining Tables",
        description:
          "Quarter-sawn oak, walnut, and teakwood dining tables tailored to your exact spatial dimensions.",
        size: "half",
        theme: "light",
      },
      {
        title: "Custom Seating & Upholstery",
        description:
          "Italian leather, high-density comfort foam, and handcrafted solid hardwood frames.",
        size: "half",
        theme: "dark",
      },
    ],
  },
  "custom-furniture": {
    slug: "custom-furniture",
    title: "Custom Furniture Atelier",
    short_desc: "Bespoke architectural furniture made with natural veneers and solid joinery.",
    description:
      "Our Bangalore atelier crafts one-of-a-kind furniture pieces tailored precisely to your interior architecture. We blend traditional joinery with German soft-close fittings.",
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Custom Credenzas & Consoles",
        description: "Fluted wood details, brass hardware, and integrated wire management.",
        size: "half",
        theme: "light",
      },
    ],
  },
  "office-furniture": {
    slug: "office-furniture",
    title: "Executive Office & Workstation Furniture",
    short_desc: "Bespoke executive desks, conference tables, and acoustic workspace paneling.",
    description:
      "Studio Young Designs creates refined corporate and home office interiors in Bangalore. Our custom executive desks, conference tables, and storage credenzas combine ergonomic comfort with architectural elegance.",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Executive Desks & Workstations",
        description:
          "Bespoke hardwood executive desks with leather writing pads and concealed power outlets.",
        size: "half",
        theme: "light",
      },
      {
        title: "Conference & Boardroom Tables",
        description:
          "Large-format solid wood conference tables built for modern technology integration.",
        size: "half",
        theme: "dark",
      },
    ],
  },
  "office-interiors": {
    slug: "office-interiors",
    title: "Executive Office Interiors & Commercial Furniture",
    short_desc: "Bespoke commercial interiors, executive suites, and corporate woodwork.",
    description:
      "Commercial interior design and executive furniture crafting in Bangalore. We design productive workspace environments tailored to modern corporate standards.",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Executive Office Suites",
        description: "Tailored office layouts, acoustic wooden paneling, and custom desks.",
        size: "half",
        theme: "light",
      },
    ],
  },
  "home-improvement": {
    slug: "home-improvement",
    title: "Full-Home Improvement & Renovation",
    short_desc: "Turnkey residential renovation, space redesign, civil updates, and interior overhaul.",
    description:
      "Complete home transformation and interior improvement services across Bangalore. We handle civil modifications, electrical routing, custom joinery, false ceiling lighting, and white-glove installation.",
    image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        title: "Turnkey Renovation & Redesign",
        description:
          "Complete interior overhaul for apartments and villas with single-point accountability.",
        size: "half",
        theme: "light",
      },
    ],
  },
};

function DynamicServicePage() {
  const { slug } = Route.useParams();

  const {
    data: dbService,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: ["service_detail", slug],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
      if (data) return data;

      const altSlug = slug.endsWith("s")
        ? slug.slice(0, -1)
        : slug === "living-spaces"
          ? "living"
          : `${slug}s`;

      const { data: altRes } = await supabase
        .from("services")
        .select("*")
        .eq("slug", altSlug)
        .maybeSingle();
      return altRes || null;
    },
  });

  const activeService = dbService || FALLBACK_SERVICES[slug] || FALLBACK_SERVICES[slug.replace(/-store$/, "")] || FALLBACK_SERVICES[slug.replace(/s$/, "")];

  if (isLoading && !activeService) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
      </div>
    );
  }

  if (!activeService) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-stone-900">
        <h1 className="font-display text-2xl uppercase tracking-widest text-[#cb2026]">
          Service Not Found
        </h1>
        <p className="text-xs text-stone-400 mt-2">
          The requested Atelier discipline does not exist or has been removed.
        </p>
      </div>
    );
  }

  // Parse features
  const parsedFeatures = (activeService.features || []).map((f: any, idx: number) => {
    if (typeof f === "object" && f !== null) {
      return {
        title: f.title || `Offer Card 0${idx + 1}`,
        description: f.description || "",
        image: f.image || f.image_url || "",
        size: f.size === "full" ? "full" : "half",
        theme: f.theme === "dark" ? "dark" : "light",
      };
    }
    if (typeof f === "string") {
      if (f.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(f);
          return {
            title: parsed.title || `Offer Card 0${idx + 1}`,
            description: parsed.description || "",
            image: parsed.image || parsed.image_url || "",
            size: parsed.size === "full" ? "full" : "half",
            theme: parsed.theme === "dark" ? "dark" : "light",
          };
        } catch (e) {
          // Fallback below
        }
      }
      const colonIdx = f.indexOf(":");
      if (colonIdx === -1) {
        return {
          title: f || `Offer Card 0${idx + 1}`,
          description: f,
          size: "half",
          theme: "light",
        };
      }
      return {
        title: f.substring(0, colonIdx).trim(),
        description: f.substring(colonIdx + 1).trim(),
        size: "half",
        theme: "light",
      };
    }
    return { title: `Offer Card 0${idx + 1}`, description: "", size: "half", theme: "light" };
  });

  const pageData: ServicePageData = {
    slug: activeService.slug,
    title: activeService.title,
    subtitle: activeService.short_desc || activeService.subtitle,
    heroImage: activeService.image_url || activeService.heroImage || "",
    intro: activeService.title,
    description: activeService.description,
    features: parsedFeatures,
    gallery: [], // Loaded dynamically in ServicePageLayout
  };

  return <ServicePageLayout data={pageData} />;
}
