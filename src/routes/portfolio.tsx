/**
 * Dedicated Portfolio page — /portfolio
 * Horizontal multi-card project gallery track with side navigation arrows and lightbox view.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
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
      { property: "og:url", content: "https://www.studioyoungdesigns.com/portfolio" },
    ],
    links: [{ rel: "canonical", href: "https://www.studioyoungdesigns.com/portfolio" }],
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
  const isAnimatingRef = useRef(false);

  // Tripled items list for infinite loop
  const loopItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    return [...items, ...items, ...items];
  }, [items]);

  // Align scroll to center (middle copy of the W content)
  const alignCenter = () => {
    const el = containerRef.current;
    if (el) {
      const W = el.scrollWidth / 3;
      el.scrollLeft = W;
    }
  };

  // Run center alignment once items/track are loaded
  useEffect(() => {
    if (loopItems.length === 0) return;

    // We delay alignment slightly to allow browser layout calculations
    const timer = setTimeout(alignCenter, 100);
    window.addEventListener("resize", alignCenter);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", alignCenter);
    };
  }, [loopItems]);

  // Seamless boundary wrap check in onScroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    // If animating programmatically, wrap after animation finishes
    if (isAnimatingRef.current) return;

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

    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const scrollAmount = el.clientWidth * 0.7;
    const target = el.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);

    animate(el.scrollLeft, target, {
      duration: 1.35,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (val) => {
        el.scrollLeft = Math.round(val);
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        handleScroll();
      },
    });
  };

  if (!items || items.length === 0) return null;

  return (
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

      {/* Edge-to-Edge Pure Photography Track — Manual Navigation Only */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none px-4 md:px-8 py-2 h-[72vh] min-h-[500px] max-h-[780px] items-stretch"
      >
        {loopItems.map((item: any, idx: number) => (
          <motion.div
            key={item.src + idx}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1], // Custom OutExpo easing
              delay: (idx % items.length) * 0.03,
            }}
            className="flex-none relative h-full w-auto group/slide cursor-pointer overflow-hidden rounded-sm select-none"
            onClick={() => onSelectImage && onSelectImage(item)}
          >
            <img
              src={item.src}
              alt={item.title || "Gallery"}
              loading="lazy"
              decoding="async"
              className="h-full w-auto max-w-none object-cover transition-transform duration-1000 ease-out group-hover/slide:scale-[1.03]"
            />
            {/* Subtle Hover Overlay with Title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/slide:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 pointer-events-none">
              {item.title && (
                <span className="font-display text-lg text-white uppercase tracking-wider font-medium">
                  {item.title}
                </span>
              )}
              {item.subtitle && (
                <span className="text-xs text-white/80 uppercase tracking-widest font-sans mt-0.5">
                  {item.subtitle}
                </span>
              )}
            </div>
          </motion.div>
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
        .eq("is_visible", true)
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
