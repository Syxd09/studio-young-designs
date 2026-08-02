/**
 * Reusable service page template — each service route provides data,
 * this component renders the full page with hero, details, gallery, and CTA.
 */

import { Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView, AnimatePresence, animate } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PageWrapper,
  PageHero,
  Reveal3D,
  SplitHeading,
  TextScramble,
  TiltCard,
  Magnetic,
  EASE_SMOOTH,
  EASE_OUT_EXPO,
} from "./shared-animations";

export interface ServiceFeature {
  title: string;
  description: string;
  image?: string;
  size?: "half" | "full";
  theme?: "light" | "dark";
}

export interface GalleryImage {
  src: string;
  alt: string;
  title: string;
  span?: "tall" | "wide" | "normal";
}

export interface ServicePageData {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  intro: string;
  description: string;
  features: ServiceFeature[];
  gallery: GalleryImage[];
}

export function ServicePageLayout({ data }: { data: ServicePageData }) {
  const { data: dbService } = useQuery<any>({
    queryKey: ["service_detail", data.slug],
    queryFn: async () => {
      // Try exact slug match first
      const { data: res } = await supabase
        .from("services")
        .select("*")
        .eq("slug", data.slug)
        .maybeSingle();

      if (res) return res;

      // Fallback slug matching (e.g. kitchens vs kitchen, living-spaces vs living)
      const altSlug = data.slug.endsWith("s")
        ? data.slug.slice(0, -1)
        : data.slug === "living-spaces"
          ? "living"
          : `${data.slug}s`;

      const { data: altRes } = await supabase
        .from("services")
        .select("*")
        .eq("slug", altSlug)
        .maybeSingle();

      return altRes || null;
    },
    staleTime: 0,
  });

  const { data: allGallery = [] } = useQuery<any[]>({
    queryKey: ["service_gallery_all"],
    queryFn: async () => {
      const { data: res, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return res || [];
    },
    staleTime: 0,
  });

  const matchesCategory = (itemCategory?: string, targetFilter?: string) => {
    if (!targetFilter) return true;
    if (!itemCategory) return false;
    const c1 = itemCategory.toLowerCase().trim();
    const c2 = targetFilter.toLowerCase().trim();
    if (c1 === c2) return true;
    if ((c1 === "living" || c1 === "living-spaces") && (c2 === "living" || c2 === "living-spaces"))
      return true;
    if ((c1 === "kitchens" || c1 === "kitchen") && (c2 === "kitchens" || c2 === "kitchen"))
      return true;
    if ((c1 === "wardrobes" || c1 === "wardrobe") && (c2 === "wardrobes" || c2 === "wardrobe"))
      return true;
    if (
      (c1 === "interiors" || c1 === "turnkey-interiors") &&
      (c2 === "interiors" || c2 === "turnkey-interiors")
    )
      return true;
    return false;
  };

  const dbGallery = allGallery.filter((g: any) => matchesCategory(g.category, data.slug));

  const { data: siteConfig = {} } = useQuery<Record<string, string>>({
    queryKey: ["site_config"],
    queryFn: async () => {
      const { data: res, error } = await supabase.from("site_config").select("key, value");
      if (error) throw error;
      return (res || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    },
    staleTime: 0,
  });

  const mergedData: ServicePageData = {
    ...data,
    title: dbService?.title || data.title,
    subtitle: dbService?.short_desc || data.subtitle,
    heroImage: dbService?.image_url || data.heroImage,
    intro: siteConfig[`service_intro_${data.slug}`] || dbService?.intro || data.intro,
    description: dbService?.description || data.description,
    features:
      dbService?.features !== undefined &&
      Array.isArray(dbService.features) &&
      dbService.features.length > 0
        ? dbService.features.map((f: any, idx: number) => {
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
                  // Fallback to string splitting below
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
            return {
              title: `Offer Card 0${idx + 1}`,
              description: "",
              size: "half",
              theme: "light",
            };
          })
        : data.features,
    gallery:
      dbGallery.length > 0
        ? Array.from(
            new Map(
              dbGallery.map((g: any) => [
                g.image_url,
                {
                  src: g.image_url,
                  alt: g.title || "Gallery Image",
                  title: g.title || g.subtitle || "",
                  span: g.span === "wide" || g.span === "tall" ? g.span : "normal",
                },
              ]),
            ).values(),
          )
        : data.gallery,
  };

  return (
    <PageWrapper>
      <PageHero
        image={mergedData.heroImage}
        title={mergedData.title}
        subtitle={mergedData.subtitle}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Services", to: "/services" },
          { label: mergedData.title },
        ]}
      />

      {/* Intro Section */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <Reveal3D rotateX={10}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow">
                    <TextScramble text="Overview" />
                  </span>
                </div>
                <SplitHeading text={mergedData.intro} className="text-3xl md:text-5xl" />
              </Reveal3D>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <Reveal3D delay={0.2} rotateX={8}>
                <p className="text-lg leading-relaxed text-foreground/70">
                  {mergedData.description}
                </p>
              </Reveal3D>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid — WHAT WE OFFER */}
      <section className="bg-[#FAF8F5] py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 space-y-12">
          {/* Section Header */}
          <Reveal3D rotateX={10}>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-6 bg-[#C5A059]" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-sans font-semibold">
                  <TextScramble text="What We Offer" />
                </span>
              </div>
              <SplitHeading
                text={mergedData.intro || "Thoughtful Kitchens. Timeless Living."}
                className="text-4xl text-stone-900 md:text-5xl lg:text-6xl font-display font-normal leading-tight"
              />
              <p className="mt-4 max-w-3xl text-base text-stone-600 md:text-lg leading-relaxed font-sans">
                {mergedData.subtitle}
              </p>
            </div>
          </Reveal3D>

          {/* Offer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {mergedData.features.map((feat, i) => {
              const isFull = feat.size === "full";
              const isDark = feat.theme === "dark";
              const cardImg = feat.image || mergedData.heroImage;

              return (
                <div
                  key={feat.title + i}
                  className={isFull ? "col-span-1 md:col-span-12" : "col-span-1 md:col-span-6"}
                >
                  <Reveal3D delay={i * 0.08} rotateX={8}>
                    <div
                      className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col md:flex-row ${
                        isFull ? "min-h-[340px] md:h-[380px]" : "min-h-[320px] md:h-[340px]"
                      } ${isDark ? "bg-[#23201D] text-cream" : "bg-[#F2EFE9] text-stone-900"}`}
                    >
                      {/* Text Side */}
                      <div
                        className={`flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 ${
                          isFull ? "w-full md:w-5/12" : "w-full md:w-1/2"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-[#C5A059]/60" />
                            <span className="font-display text-lg tracking-widest text-[#C5A059] font-medium">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <h3
                            className={`mt-4 sm:mt-5 font-display text-2xl md:text-3xl lg:text-4xl font-normal leading-tight ${
                              isDark ? "text-cream" : "text-stone-900"
                            }`}
                          >
                            {feat.title}
                          </h3>
                          <p
                            className={`mt-3 sm:mt-4 text-xs sm:text-sm md:text-base leading-relaxed ${
                              isDark ? "text-stone-300/80" : "text-stone-600"
                            }`}
                          >
                            {feat.description}
                          </p>
                        </div>
                      </div>

                      {/* Image Side */}
                      <div
                        className={`relative overflow-hidden h-full ${
                          isFull
                            ? "w-full md:w-7/12 min-h-[260px] md:min-h-full"
                            : "w-full md:w-1/2 min-h-[240px] md:min-h-full"
                        }`}
                      >
                        <img
                          src={cardImg}
                          alt={feat.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </Reveal3D>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <ServiceGallery images={mergedData.gallery} />

      {/* CTA */}
      <section className="bg-charcoal py-24 text-cream md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
          <Reveal3D rotateX={12}>
            <SplitHeading
              text="Ready to begin your project?"
              className="mx-auto max-w-3xl text-4xl text-cream md:text-6xl"
            />
            <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-cream/70">
              Tell us about your space. We'll arrange a quiet visit to your home or our Bangalore
              studio.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Magnetic>
                <Link
                  to="/"
                  hash="contact"
                  search={{ service: mergedData.title }}
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-white px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-charcoal"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <span className="relative">Get in Touch</span>
                  <span className="relative transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  to="/services"
                  className="group relative inline-flex items-center gap-3 overflow-hidden border border-cream/60 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-cream transition-all hover:border-gold hover:text-gold"
                >
                  All Services
                </Link>
              </Magnetic>
            </div>
          </Reveal3D>
        </div>
      </section>
    </PageWrapper>
  );
}

/* ─── Service Gallery ─── */

function ServiceGallery({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tripled images list for infinite loop
  const loopImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    return [...images, ...images, ...images];
  }, [images]);

  // Align scroll to center (middle copy of the W content)
  const alignCenter = () => {
    const el = containerRef.current;
    if (el) {
      const W = el.scrollWidth / 3;
      el.scrollLeft = W;
    }
  };

  // Run center alignment once images/track are loaded
  useEffect(() => {
    if (loopImages.length === 0) return;

    // We delay alignment slightly to allow browser layout calculations
    const timer = setTimeout(alignCenter, 100);
    window.addEventListener("resize", alignCenter);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", alignCenter);
    };
  }, [loopImages]);

  // Seamless boundary wrap check in onScroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const W = el.scrollWidth / 3;
    if (W <= 0) return;

    // Right boundary wrap (past 2/3 of content)
    if (el.scrollLeft >= 2 * W) {
      el.scrollLeft -= W;
    }
    // Left boundary wrap (below 1/3 of content)
    else if (el.scrollLeft < W) {
      el.scrollLeft += W;
    }
  };

  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    const W = el.scrollWidth / 3;
    const scrollAmount = el.clientWidth * 0.7;
    const target = el.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);

    animate(el.scrollLeft, target, {
      type: "spring",
      stiffness: 80,
      damping: 18,
      mass: 0.8,
      onUpdate: (val) => {
        el.scrollLeft = val;
      },
    });
  };

  if (!images || images.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 space-y-12">
        <div className="mb-8">
          <Reveal3D rotateX={10}>
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">
                <TextScramble text="Project Gallery" />
              </span>
            </div>
            <SplitHeading text="A glimpse of our work." className="text-3xl md:text-5xl" />
          </Reveal3D>
        </div>

        {/* Horizontal Multi-Card Track Gallery */}
        <div className="relative w-full group py-2">
          {/* Left Floating Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white/85 text-stone-900 border border-stone-200/80 shadow-2xl backdrop-blur-md flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Floating Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white/85 text-stone-900 border border-stone-200/80 shadow-2xl backdrop-blur-md flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} />
          </button>

          {/* Edge-to-Edge Pure Photography Track */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none px-4 md:px-8 py-2 h-[68vh] min-h-[460px] max-h-[700px] items-stretch"
          >
            {loopImages.map((img: GalleryImage, idx: number) => (
              <div
                key={img.src + idx}
                className="flex-none relative h-full w-auto group/slide cursor-pointer overflow-hidden rounded-sm select-none"
                onClick={() => setSelected(img)}
              >
                <img
                  src={img.src}
                  alt={img.alt || "Gallery"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-auto max-w-none object-cover transition-transform duration-700 ease-out group-hover/slide:scale-[1.02]"
                />
                {/* Subtle Hover Overlay with Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/slide:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 pointer-events-none">
                  {img.title && (
                    <span className="font-display text-lg text-white uppercase tracking-wider font-medium">
                      {img.title}
                    </span>
                  )}
                  {img.alt && (
                    <span className="text-xs text-white/80 uppercase tracking-widest font-sans mt-0.5">
                      {img.alt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_SMOOTH }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.src}
                alt={selected.title}
                className="max-h-[80vh] max-w-full object-contain"
              />
              <div className="mt-4 text-center">
                <div className="font-display text-2xl text-white">{selected.title}</div>
                {selected.alt && (
                  <div className="text-sm text-stone-400 mt-1 uppercase tracking-widest">
                    {selected.alt}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute right-0 -top-12 text-3xl text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
