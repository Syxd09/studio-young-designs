/**
 * Reusable service page template — each service route provides data,
 * this component renders the full page with hero, details, gallery, and CTA.
 */

import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  PageWrapper,
  PageHero,
  Reveal3D,
  SplitHeading,
  TextScramble,
  TiltCard,
  Magnetic,
  Marquee,
  EASE_SMOOTH,
  EASE_OUT_EXPO,
} from "./shared-animations";

export interface ServiceFeature {
  title: string;
  description: string;
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
  marqueeItems: string[];
}

export function ServicePageLayout({ data }: { data: ServicePageData }) {
  return (
    <PageWrapper>
      <PageHero
        image={data.heroImage}
        title={data.title}
        subtitle={data.subtitle}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Services", to: "/services" },
          { label: data.title },
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
                <SplitHeading text={data.intro} className="text-3xl md:text-5xl" />
              </Reveal3D>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <Reveal3D delay={0.2} rotateX={8}>
                <p className="text-lg leading-relaxed text-foreground/70">
                  {data.description}
                </p>
              </Reveal3D>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal3D rotateX={10}>
            <div className="mb-16 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">
                <TextScramble text="What We Offer" />
              </span>
            </div>
          </Reveal3D>
          <div className="grid grid-cols-1 gap-px bg-border/60 border border-border/60 md:grid-cols-2">
            {data.features.map((feat, i) => (
              <Reveal3D key={feat.title} delay={i * 0.1} rotateX={10} rotateY={(i % 2 === 0 ? 1 : -1) * 5}>
                <TiltCard intensity={6}>
                  <div className="group flex h-full flex-col bg-background p-8 transition-colors duration-500 hover:bg-cream md:p-12">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl text-walnut">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-6 bg-gold transition-all duration-500 group-hover:w-14" />
                    </div>
                    <div className="mt-10">
                      <h3 className="font-display text-2xl md:text-3xl">{feat.title}</h3>
                      <p className="mt-4 text-sm leading-relaxed text-foreground/65 md:text-base">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <Marquee items={data.marqueeItems} dark />

      {/* Gallery */}
      <ServiceGallery images={data.gallery} />

      {/* CTA */}
      <section className="bg-charcoal py-24 text-cream md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
          <Reveal3D rotateX={12}>
            <SplitHeading
              text="Ready to begin your project?"
              className="mx-auto max-w-3xl text-4xl text-cream md:text-6xl"
            />
            <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-cream/70">
              Tell us about your space. We'll arrange a quiet visit to your home or our Bangalore studio.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Magnetic>
                <Link
                  to="/"
                  hash="contact"
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-white px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-charcoal"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <span className="relative">Get in Touch</span>
                  <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
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

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-16">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {images.map((img, i) => (
            <Reveal3D key={img.title} delay={(i % 3) * 0.08} rotateX={10}>
              <TiltCard intensity={5}>
                <button
                  onClick={() => setSelected(img)}
                  className={`group relative block w-full overflow-hidden bg-muted text-left ${
                    img.span === "tall"
                      ? "aspect-[3/4] md:row-span-2"
                      : img.span === "wide"
                        ? "aspect-[16/9] md:col-span-2"
                        : "aspect-[4/3]"
                  }`}
                >
                  <motion.img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="text-sm text-white/80">{img.alt}</div>
                    <div className="mt-1 font-display text-xl text-white">{img.title}</div>
                  </div>
                </button>
              </TiltCard>
            </Reveal3D>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
        >
          <motion.img
            src={selected.src}
            alt={selected.alt}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE_SMOOTH }}
            className="max-h-[85vh] max-w-full object-contain"
          />
          <button
            onClick={() => setSelected(null)}
            className="absolute right-6 top-6 text-3xl text-white/70 transition-colors hover:text-white"
          >
            ×
          </button>
        </motion.div>
      )}
    </section>
  );
}
