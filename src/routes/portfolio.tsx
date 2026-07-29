/**
 * Dedicated Portfolio page — /portfolio
 * Horizontal multi-card project gallery track with side navigation arrows and lightbox view.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PageWrapper,
  PageHero,
  Reveal3D,
  SplitHeading,
  TextScramble,
  EASE_SMOOTH,
} from "@/components/shared-animations";

import heroImg from "@/assets/hero.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";
import svcLiving from "@/assets/service-living.jpg";
import svcComplete from "@/assets/service-complete.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import aboutImg from "@/assets/about.jpg";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Our Portfolio — Studio Young Designs" },
      {
        name: "description",
        content:
          "Browse our portfolio of bespoke interiors, modular kitchens, custom wardrobes, and living spaces crafted over 45 years.",
      },
      { property: "og:url", content: "https://studioyoungdesigns.com/portfolio" },
    ],
    links: [{ rel: "canonical", href: "https://studioyoungdesigns.com/portfolio" }],
  }),
  component: PortfolioPage,
});

interface GalleryItem {
  src: string;
  title: string;
  subtitle: string;
  category: string;
}

const defaultGallery: GalleryItem[] = [
  {
    src: svcKitchen,
    title: "Walnut & Marble Kitchen",
    subtitle: "MODULAR KITCHEN · SADASHIVANAGAR",
    category: "kitchens",
  },
  {
    src: p1,
    title: "Malabar Dining Suite",
    subtitle: "BESPOKE DINING · BANGALORE",
    category: "interiors",
  },
  {
    src: svcWardrobe,
    title: "Cedar Walk-In Closet",
    subtitle: "MASTER WARDROBE · RICHMOND TOWN",
    category: "wardrobes",
  },
  {
    src: svcLiving,
    title: "The Living Composition",
    subtitle: "LIVING SPACES · KORAMANGALA",
    category: "living",
  },
  {
    src: p2,
    title: "Sadashivanagar Bedroom",
    subtitle: "MASTER SUITE · BANGALORE",
    category: "interiors",
  },
  {
    src: p3,
    title: "Cubbon Park Library",
    subtitle: "HOME STUDY · CUBBON PARK",
    category: "living",
  },
  {
    src: svcComplete,
    title: "Turnkey Luxury Villa",
    subtitle: "FULL INTERIOR REALIZATION · WHITEFIELD",
    category: "interiors",
  },
  {
    src: p4,
    title: "Whitefield Villa Bath",
    subtitle: "MARBLE & WALNUT BATHROOM",
    category: "interiors",
  },
  {
    src: aboutImg,
    title: "In-House Atelier Suite",
    subtitle: "HANDCRAFTED JOINERY",
    category: "interiors",
  },
  {
    src: heroImg,
    title: "Material Atelier",
    subtitle: "TIMBER & BRASS SPECIFICATIONS",
    category: "living",
  },
];

export function PortfolioTrack({
  items,
  onSelectImage,
}: {
  items: any[];
  onSelectImage?: (item: any) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full group py-4">
      {/* Left Scroll Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-white/90 text-stone-900 border border-stone-300 shadow-xl flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 cursor-pointer"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Right Scroll Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-full bg-white/90 text-stone-900 border border-stone-300 shadow-xl flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 cursor-pointer"
        aria-label="Scroll Right"
      >
        <ChevronRight size={22} />
      </button>

      {/* Horizontal Multi-Card Track */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth px-2 py-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item, idx) => (
          <div
            key={item.src + idx}
            className="flex-none w-[280px] sm:w-[340px] md:w-[400px] group/card cursor-pointer scroll-snap-align-start space-y-3"
            onClick={() => onSelectImage && onSelectImage(item)}
          >
            {/* Title / Subtitle label above card */}
            <div className="px-1">
              <h4 className="font-display text-lg sm:text-xl uppercase tracking-wider text-stone-900 font-medium truncate">
                {item.title || "STUDIO YOUNG DESIGNS"}
              </h4>
              {item.subtitle && (
                <p className="text-[11px] uppercase tracking-widest text-stone-500 mt-0.5 font-sans">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Vertical Image Card */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 rounded-sm border border-stone-200/80 shadow-md transition-all duration-500 group-hover/card:shadow-xl group-hover/card:border-stone-400">
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioPage() {
  const [selected, setSelected] = useState<any | null>(null);

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  const { data: layoutImages = {} } = useQuery<Record<string, string>>({
    queryKey: ["layout_images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("layout_images").select("key, image_url");
      if (error) throw error;
      return (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.image_url }), {});
    },
    staleTime: 0,
  });

  const rawList =
    items.length > 0
      ? items
          .filter((i) => i.is_visible)
          .map((i) => ({
            src: i.image_url,
            title: i.title,
            subtitle: i.subtitle,
            category: i.category,
          }))
      : defaultGallery;

  // Deduplicate list by image source so no image repeats twice
  const galleryList = Array.from(new Map(rawList.map((item) => [item.src, item])).values());

  return (
    <PageWrapper>
      <PageHero
        image={
          layoutImages.portfolio_hero_bg ||
          layoutImages.portfolio_img ||
          layoutImages.hero_bg ||
          heroImg
        }
        title="Our Portfolio"
        subtitle="Every project reflects our commitment to timeless design, meticulous detailing and uncompromising execution."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Portfolio" }]}
      />

      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 space-y-12">
          {/* Header */}
          <div className="border-b border-border/40 pb-8">
            <Reveal3D rotateX={10}>
              <div className="mb-6 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow">
                  <TextScramble text="SELECTED WORK" />
                </span>
              </div>
              <SplitHeading
                text="A Portfolio Built on Craftsmanship"
                className="text-4xl md:text-5xl"
              />
            </Reveal3D>
          </div>

          {/* Horizontal Multi-Card Track Gallery */}
          <PortfolioTrack items={galleryList} onSelectImage={(img) => setSelected(img)} />
        </div>
      </section>

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
                <div className="eyebrow mt-1 text-white/60">{selected.subtitle}</div>
              </div>
            </motion.div>
            <button
              onClick={() => setSelected(null)}
              className="absolute right-6 top-6 text-3xl text-white/70 transition-colors hover:text-white"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
