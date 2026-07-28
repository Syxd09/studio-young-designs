/**
 * Dedicated Portfolio page — /portfolio
 * Filterable masonry grid & interactive arrow slider of all project images with 3D tilt hover and lightbox.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  SlidersHorizontal,
  Filter,
  Check,
} from "lucide-react";
import {
  PageWrapper,
  PageHero,
  Reveal3D,
  SplitHeading,
  TextScramble,
  TiltCard,
  EASE_SMOOTH,
  EASE_OUT_EXPO,
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

type Category = "all" | "kitchens" | "wardrobes" | "living" | "interiors";

interface GalleryItem {
  src: string;
  title: string;
  subtitle: string;
  category: Category;
  span?: "tall" | "wide" | "standard";
}

const defaultGallery: GalleryItem[] = [
  {
    src: svcKitchen,
    title: "Walnut Kitchen",
    subtitle: "Modular · Sadashivanagar",
    category: "kitchens",
    span: "wide",
  },
  {
    src: p1,
    title: "Malabar Residence",
    subtitle: "Dining · Bangalore",
    category: "interiors",
    span: "tall",
  },
  {
    src: svcWardrobe,
    title: "Cedar Walk-In",
    subtitle: "Master Wardrobe",
    category: "wardrobes",
    span: "standard",
  },
  {
    src: svcLiving,
    title: "Living Composition",
    subtitle: "Walnut & Linen",
    category: "living",
    span: "standard",
  },
  {
    src: p2,
    title: "Sadashivanagar House",
    subtitle: "Master Bedroom",
    category: "interiors",
    span: "standard",
  },
  { src: p3, title: "Cubbon Study", subtitle: "Home Library", category: "living", span: "tall" },
  {
    src: svcComplete,
    title: "Turnkey Villa",
    subtitle: "Complete Interior",
    category: "interiors",
    span: "wide",
  },
  {
    src: p4,
    title: "Whitefield Villa",
    subtitle: "Marble & Walnut Bath",
    category: "interiors",
    span: "standard",
  },
  {
    src: aboutImg,
    title: "Craftsman at Work",
    subtitle: "In-House Atelier",
    category: "interiors",
    span: "standard",
  },
  {
    src: heroImg,
    title: "Design Process",
    subtitle: "Material Selection",
    category: "living",
    span: "standard",
  },
];

const matchesCategory = (itemCategory?: string, targetFilter?: string) => {
  if (!targetFilter || targetFilter === "all") return true;
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

export function CompactFilterDropdown({
  categories,
  activeFilter,
  onSelectFilter,
}: {
  categories: { key: string; label: string }[];
  activeFilter: string;
  onSelectFilter: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLabel =
    categories.find((c) => c.key === activeFilter)?.label || "All Projects";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-30">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group inline-flex items-center gap-3 border border-gold/40 bg-charcoal text-cream px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] hover:bg-gold hover:text-charcoal hover:border-gold transition-all duration-300 rounded-lg cursor-pointer shadow-md"
      >
        <Filter size={13} className="text-gold group-hover:text-charcoal transition-colors" />
        <span>Filter: {activeLabel}</span>
        <ChevronDown
          size={14}
          className={`text-gold group-hover:text-charcoal transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 rounded-xl bg-charcoal border border-gold/30 p-2 shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-3 py-2 text-[9px] uppercase tracking-widest text-gold/80 font-bold border-b border-cream/10 mb-1">
              Select Category Filter
            </div>
            {categories.map((cat) => {
              const isSelected = activeFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    onSelectFilter(cat.key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-gold text-charcoal font-bold"
                      : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  <span>{cat.label}</span>
                  {isSelected && <Check size={14} className="text-charcoal stroke-[3]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function PortfolioSlider({
  items,
  onSelectImage,
}: {
  items: any[];
  onSelectImage?: (item: any) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Eager background preloader for instant slide switching
  useEffect(() => {
    if (items && items.length > 0) {
      items.forEach((item) => {
        if (item.src) {
          const img = new Image();
          img.src = item.src;
        }
      });
    }
  }, [items]);

  if (!items || items.length === 0) return null;

  const safeIndex = Math.abs(currentIndex % items.length);
  const currentItem = items[safeIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden bg-charcoal text-cream rounded-2xl p-6 md:p-10 shadow-2xl border border-gold/20">
      {/* Hidden eager image preloader for zero-latency switching */}
      <div className="hidden" aria-hidden="true">
        {items.map((item, idx) => (
          <img key={"preload-" + idx} src={item.src} alt="" loading="eager" decoding="async" />
        ))}
      </div>

      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="gold-rule" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold font-bold">
            {String(safeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-cream/70 font-sans">
          Manual Arrow Controls
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl bg-black/50 group border border-cream/10">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentItem.src || safeIndex}
            src={currentItem.src}
            alt={currentItem.title}
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover cursor-pointer"
            onClick={() => onSelectImage && onSelectImage(currentItem)}
          />
        </AnimatePresence>

        {/* Title Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 md:p-10 flex justify-between items-end pointer-events-none z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.title + safeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold mb-1">
                {currentItem.subtitle || currentItem.category}
              </p>
              <h3 className="font-display text-2xl md:text-4xl text-cream drop-shadow-md">
                {currentItem.title}
              </h3>
            </motion.div>
          </AnimatePresence>
          {onSelectImage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectImage(currentItem);
              }}
              className="pointer-events-auto hidden sm:flex items-center gap-2 border border-cream/40 bg-black/40 backdrop-blur-xs px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-cream hover:border-gold hover:text-gold transition-colors cursor-pointer"
            >
              <span>View Fullscreen</span>
            </button>
          )}
        </div>

        {/* Previous Arrow Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-charcoal/80 text-cream border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-charcoal hover:border-gold transition-all duration-300 cursor-pointer shadow-xl z-20 hover:scale-110 active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Next Arrow Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-charcoal/80 text-cream border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-charcoal hover:border-gold transition-all duration-300 cursor-pointer shadow-xl z-20 hover:scale-110 active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Interactive Thumbnail Strip */}
      <div className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.map((item, idx) => (
          <button
            key={item.src + idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
              idx === safeIndex
                ? "border-gold scale-105 shadow-md shadow-gold/30 ring-2 ring-gold/40"
                : "border-transparent opacity-40 hover:opacity-100 hover:scale-102"
            }`}
          >
            <img src={item.src} alt={item.title} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function PortfolioPage() {
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "slider">("slider");
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

  const { data: dbServices = [] } = useQuery<any[]>({
    queryKey: ["services_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("slug, title")
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

  const categoriesList =
    dbServices.length > 0
      ? [
          { key: "all", label: "All Projects" },
          ...dbServices.map((s) => ({
            key: s.slug,
            label: s.title,
          })),
        ]
      : [
          { key: "all", label: "All Projects" },
          { key: "kitchens", label: "Kitchens" },
          { key: "wardrobes", label: "Wardrobes" },
          { key: "living", label: "Living Spaces" },
          { key: "interiors", label: "Interiors" },
        ];

  const rawList =
    items.length > 0
      ? items
          .filter((i) => i.is_visible)
          .map((i) => ({
            src: i.image_url,
            title: i.title,
            subtitle: i.subtitle,
            category: i.category,
            span: i.span === "wide" || i.span === "tall" ? i.span : "standard",
          }))
      : defaultGallery;

  // Deduplicate list by image source so no image repeats twice
  const galleryList = Array.from(new Map(rawList.map((item) => [item.src, item])).values());

  const filtered =
    filter === "all"
      ? galleryList
      : galleryList.filter((g) => matchesCategory(g.category, filter));

  return (
    <PageWrapper>
      <PageHero
        image={layoutImages.hero_bg || heroImg}
        title="Our Portfolio"
        subtitle="Every project reflects our commitment to timeless design, meticulous detailing and uncompromising execution."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Portfolio" }]}
      />

      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Header + Filters & View Switcher */}
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-border/40 pb-8">
            <div>
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

            {/* Compact Category Filter & View Switcher */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Layout Switcher (Slider vs Grid) */}
              <div className="flex items-center gap-1 bg-charcoal text-cream p-1 rounded-lg border border-gold/30">
                <button
                  type="button"
                  onClick={() => setViewMode("slider")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === "slider"
                      ? "bg-gold text-charcoal shadow-sm"
                      : "text-cream/70 hover:text-cream"
                  }`}
                  title="Interactive Arrow Slider View"
                >
                  <SlidersHorizontal size={13} />
                  <span>Slider</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-gold text-charcoal shadow-sm"
                      : "text-cream/70 hover:text-cream"
                  }`}
                  title="Masonry Grid View"
                >
                  <LayoutGrid size={13} />
                  <span>Grid</span>
                </button>
              </div>

              {/* Minimal Compact Dropdown Filter */}
              <CompactFilterDropdown
                categories={categoriesList}
                activeFilter={filter}
                onSelectFilter={(key) => setFilter(key)}
              />
            </div>
          </div>

          {/* VIEW MODE 1: INTERACTIVE ARROW SLIDER */}
          {viewMode === "slider" ? (
            <PortfolioSlider items={filtered} onSelectImage={(img) => setSelected(img)} />
          ) : (
            /* VIEW MODE 2: MASONRY GRID */
            <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <motion.div
                    key={item.src + item.title}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: EASE_SMOOTH }}
                    className={
                      item.span === "tall"
                        ? "md:row-span-2"
                        : item.span === "wide"
                          ? "md:col-span-2"
                          : ""
                    }
                  >
                    <TiltCard intensity={5}>
                      <button
                        onClick={() => setSelected(item)}
                        className={`group relative block w-full overflow-hidden bg-muted text-left ${
                          item.span === "tall"
                            ? "aspect-[3/4]"
                            : item.span === "wide"
                              ? "aspect-[16/9]"
                              : "aspect-[4/3]"
                        }`}
                      >
                        <motion.img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="text-sm text-white/70">{item.subtitle}</div>
                          <div className="mt-1 font-display text-xl text-white">{item.title}</div>
                          <span className="mt-3 block h-px w-8 bg-gold transition-all duration-500 group-hover:w-16" />
                        </div>
                      </button>
                    </TiltCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
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
