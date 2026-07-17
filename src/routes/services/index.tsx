/**
 * Services listing page — /services
 * Shows all 4 services with 3D cards linking to individual pages.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
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
  useCursorTag,
} from "@/components/shared-animations";

import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";
import svcLiving from "@/assets/service-living.jpg";
import svcComplete from "@/assets/service-complete.jpg";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Studio Young Designs" },
      { name: "description", content: "Explore our bespoke interior design services: Kitchens, Wardrobes, Living Spaces, and Complete Interiors." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    num: "01",
    title: "Kitchens",
    description: "Custom modular kitchens built around the way your family cooks and gathers.",
    image: svcKitchen,
    href: "/services/kitchens",
    aspect: "tall",
  },
  {
    num: "02",
    title: "Wardrobes",
    description: "Bespoke wardrobes in walnut, oak and lacquer with brushed metal hardware.",
    image: svcWardrobe,
    href: "/services/wardrobes",
    aspect: "short",
  },
  {
    num: "03",
    title: "Living Spaces",
    description: "Living, dining and lounging rooms composed as considered whole environments.",
    image: svcLiving,
    href: "/services/living-spaces",
    aspect: "short",
  },
  {
    num: "04",
    title: "Interiors",
    description: "End-to-end interior design and execution for residences and commercial spaces.",
    image: svcComplete,
    href: "/services/interiors",
    aspect: "tall",
  },
];

function ServicesPage() {
  return (
    <PageWrapper>
      <PageHero
        image={heroImg}
        title="Our Services"
        subtitle="Four disciplines. One studio. Forty years of quiet excellence."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Services" },
        ]}
      />

      {/* Services Grid */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-20 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <Reveal3D rotateX={10}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow">
                    <TextScramble text="What We Do" />
                  </span>
                </div>
              </Reveal3D>
              <SplitHeading
                text="Spaces shaped by forty years of listening."
                className="text-4xl md:text-6xl"
              />
            </div>
            <Reveal3D delay={0.2} rotateX={6} className="md:col-span-4 md:col-start-9">
              <p className="text-base leading-relaxed text-foreground/70">
                Each discipline draws on four decades of working with wood, stone, metal and light —
                always in dialogue with the people who will inhabit the space.
              </p>
            </Reveal3D>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {services.map((svc, i) => (
              <Reveal3D
                key={svc.title}
                delay={(i % 2) * 0.12}
                rotateX={12}
                rotateY={(i % 2 === 0 ? 1 : -1) * 6}
              >
                <ServiceCard service={svc} />
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={["Kitchens", "Wardrobes", "Living Spaces", "Interiors", "Since 1981"]} />

      {/* Why Section */}
      <section className="bg-charcoal py-24 text-cream md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
          <Reveal3D rotateX={12}>
            <SplitHeading
              text="Let's design something that lasts."
              className="mx-auto max-w-3xl text-4xl text-cream md:text-6xl"
            />
            <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-cream/70">
              Every project begins with a conversation. Tell us about your space, and we'll take it from there.
            </p>
            <div className="mt-12">
              <Magnetic>
                <Link
                  to="/"
                  hash="contact"
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-white px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-charcoal"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <span className="relative">Book a Consultation</span>
                  <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
                </Link>
              </Magnetic>
            </div>
          </Reveal3D>
        </div>
      </section>
    </PageWrapper>
  );
}

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { x, y } = useCursorTag(ref);
  const [hover, setHover] = useState(false);

  return (
    <TiltCard intensity={6}>
      <Link
        ref={ref}
        to={service.href}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`group relative block overflow-hidden bg-muted ${
          service.aspect === "tall" ? "aspect-[4/5]" : "aspect-[4/3]"
        }`}
      >
        <motion.img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

        {/* Cursor tag */}
        <motion.div
          style={{ x, y }}
          animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.6 }}
          transition={{ duration: 0.35, ease: EASE_SMOOTH }}
          className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="grid h-24 w-24 place-items-center rounded-full bg-gold font-display text-sm uppercase tracking-[0.24em] text-charcoal">
            View
          </span>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="eyebrow text-white/60 mb-1">{service.num}</div>
          <div className="overflow-hidden">
            <motion.h3
              className="font-display text-3xl text-white md:text-4xl"
              whileHover={{ y: -4 }}
            >
              {service.title}
            </motion.h3>
          </div>
          <p className="mt-3 max-w-sm text-sm text-white/70">{service.description}</p>
          <motion.span className="mt-4 block h-px bg-gold" initial={{ width: 32 }} whileHover={{ width: 96 }} />
        </div>
      </Link>
    </TiltCard>
  );
}
