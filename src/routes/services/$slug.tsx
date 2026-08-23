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

    return {
      meta: [
        { title: `${formattedTitle} in Bangalore | Studio Young Designs` },
        {
          name: "description",
          content: `Bespoke luxury ${formattedTitle.toLowerCase()} design, custom manufacturing, and turnkey execution in Bangalore by Studio Young Designs. 45+ years of craftsmanship.`,
        },
        {
          name: "keywords",
          content: `${formattedTitle.toLowerCase()} Bangalore, custom ${formattedTitle.toLowerCase()} Bangalore, luxury ${formattedTitle.toLowerCase()} design, interior designers Bangalore, custom woodwork Bangalore`,
        },
        { property: "og:title", content: `${formattedTitle} in Bangalore | Studio Young Designs` },
        {
          property: "og:description",
          content: `Bespoke luxury ${formattedTitle.toLowerCase()} design, custom manufacturing, and turnkey execution in Bangalore.`,
        },
        { property: "og:image", content: "https://www.studioyoungdesigns.com/og.jpg" },
        { property: "og:url", content: `https://www.studioyoungdesigns.com/services/${slug}` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${formattedTitle} in Bangalore | Studio Young Designs` },
        {
          name: "twitter:description",
          content: `Bespoke luxury ${formattedTitle.toLowerCase()} design and turnkey execution in Bangalore.`,
        },
        { name: "twitter:image", content: "https://www.studioyoungdesigns.com/og.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://www.studioyoungdesigns.com/services/${slug}` }],
    };
  },
  component: DynamicServicePage,
});

const FALLBACK_SERVICES: Record<string, any> = {
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
