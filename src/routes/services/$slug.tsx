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
        { title: `${formattedTitle} — Studio Young Designs` },
        {
          name: "description",
          content: `Bespoke luxury ${formattedTitle.toLowerCase()} design, custom manufacturing, and turnkey execution in Bangalore by Studio Young Designs.`,
        },
        { property: "og:title", content: `${formattedTitle} — Studio Young Designs` },
        {
          property: "og:description",
          content: `Bespoke luxury ${formattedTitle.toLowerCase()} design and execution in Bangalore.`,
        },
        { property: "og:image", content: "https://studioyoungdesigns.com/og.jpg" },
        { property: "og:url", content: `https://studioyoungdesigns.com/services/${slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${formattedTitle} — Studio Young Designs` },
        {
          name: "twitter:description",
          content: `Bespoke luxury ${formattedTitle.toLowerCase()} design and execution in Bangalore.`,
        },
        { name: "twitter:image", content: "https://studioyoungdesigns.com/og.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://studioyoungdesigns.com/services/${slug}` }],
    };
  },
  component: DynamicServicePage,
});

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

      const { data: altRes } = await supabase.from("services").select("*").eq("slug", altSlug).maybeSingle();
      return altRes || null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
      </div>
    );
  }

  if (error || !dbService) {
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
  const parsedFeatures = (dbService.features || []).map((f: any, idx: number) => {
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
        return { title: f || `Offer Card 0${idx + 1}`, description: f, size: "half", theme: "light" };
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
    slug: dbService.slug,
    title: dbService.title,
    subtitle: dbService.short_desc,
    heroImage: dbService.image_url,
    intro: dbService.title,
    description: dbService.description,
    features: parsedFeatures,
    gallery: [], // Loaded dynamically in ServicePageLayout
  };

  return <ServicePageLayout data={pageData} />;
}
