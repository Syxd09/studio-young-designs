/**
 * Gallery page — /gallery
 * Filterable masonry grid of all project images with 3D tilt hover and lightbox.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Studio Young Designs" },
      { name: "description", content: "Browse our portfolio of bespoke interiors, modular kitchens, custom wardrobes, and living spaces crafted over 40 years." },
    ],
  }),
  component: GalleryPage,
});

type Category = "all" | "kitchens" | "wardrobes" | "living" | "interiors";

interface GalleryItem {
  src: string;
  title: string;
  subtitle: string;
  category: Category;
  span?: "tall" | "wide";
}

const gallery: GalleryItem[] = [
  { src: svcKitchen, title: "Walnut Kitchen", subtitle: "Modular · Sadashivanagar", category: "kitchens", span: "wide" },
  { src: p1, title: "Malabar Residence", subtitle: "Dining · Bangalore", category: "interiors", span: "tall" },
  { src: svcWardrobe, title: "Cedar Walk-In", subtitle: "Master Wardrobe", category: "wardrobes" },
  { src: svcLiving, title: "Living Composition", subtitle: "Walnut & Linen", category: "living" },
  { src: p2, title: "Sadashivanagar House", subtitle: "Master Bedroom", category: "interiors" },
  { src: p3, title: "Cubbon Study", subtitle: "Home Library", category: "living", span: "tall" },
  { src: svcComplete, title: "Turnkey Villa", subtitle: "Complete Interior", category: "interiors", span: "wide" },
  { src: p4, title: "Whitefield Villa", subtitle: "Marble & Walnut Bath", category: "interiors" },
  { src: aboutImg, title: "Craftsman at Work", subtitle: "In-House Atelier", category: "interiors" },
  { src: heroImg, title: "Design Process", subtitle: "Material Selection", category: "living" },
];

const categories: Array<{ key: Category; label: string }> = [
  { key: "all", label: "All Projects" },
  { key: "kitchens", label: "Kitchens" },
  { key: "wardrobes", label: "Wardrobes" },
  { key: "living", label: "Living Spaces" },
  { key: "interiors", label: "Interiors" },
];

function GalleryPage() {
  const [filter, setFilter] = useState<Category>("all");
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const filtered = filter === "all" ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <PageWrapper>
      <PageHero
        image={heroImg}
        title="Gallery"
        subtitle="Seven hundred spaces. A small selection of the ones that stayed with us."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Gallery" },
        ]}
      />

      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Header + Filters */}
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Reveal3D rotateX={10}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow">
                    <TextScramble text="Selected Work" />
                  </span>
                </div>
                <SplitHeading text="Our portfolio of considered spaces." className="text-4xl md:text-5xl" />
              </Reveal3D>
            </div>

            {/* Category filter tabs */}
            <Reveal3D delay={0.2} rotateX={6}>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.key}
                    onClick={() => setFilter(cat.key)}
                    className={`rounded-none border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                      filter === cat.key
                        ? "border-gold bg-gold text-charcoal"
                        : "border-border text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </Reveal3D>
          </div>

          {/* Masonry Grid */}
          <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.title}
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
