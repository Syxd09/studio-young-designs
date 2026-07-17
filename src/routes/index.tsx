import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  animate,
  AnimatePresence,
} from "framer-motion";

import {
  PageWrapper,
  Reveal3D,
  Reveal,
  SplitHeading,
  Highlight,
  TiltCard,
  Magnetic,
  TextScramble,
  useCursorTag,
  Marquee,
  ParticleField,
  EASE_SMOOTH,
  EASE_OUT_EXPO,
} from "@/components/shared-animations";

import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";
import svcLiving from "@/assets/service-living.jpg";
import svcComplete from "@/assets/service-complete.jpg";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: "https://project--fbde5fc0-763d-412b-8186-8a95d993998e.lovable.app/og.jpg" },
    ],
  }),
  component: Home,
});

/* ═══════════════════════════════════════════════════════════════
   LOADER — 3D Door-Split Reveal
   ═══════════════════════════════════════════════════════════════ */

function Loader() {
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1600);
    const t2 = setTimeout(() => setPhase("done"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ perspective: "1200px" }}>
      {/* Left door */}
      <motion.div
        initial={{ x: "0%" }}
        animate={phase === "reveal" ? { x: "-100%", rotateY: -15 } : {}}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        className="absolute inset-y-0 left-0 w-1/2 bg-charcoal"
        style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
      />
      {/* Right door */}
      <motion.div
        initial={{ x: "0%" }}
        animate={phase === "reveal" ? { x: "100%", rotateY: 15 } : {}}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        className="absolute inset-y-0 right-0 w-1/2 bg-charcoal"
        style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
      />

      {/* Center branding */}
      <motion.div
        animate={phase === "reveal" ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center text-cream">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE_SMOOTH }}
            className="mb-8 flex justify-center"
          >
            <img
              src="/logo-transparent.png"
              className="h-16 w-auto object-contain"
              alt="Studio Young Designs Logo"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="eyebrow text-cream/60"
          >
            Est. 1981 · Bangalore
          </motion.div>
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.4em", rotateX: 30 }}
            animate={{ opacity: 1, letterSpacing: "0.02em", rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: EASE_SMOOTH }}
            className="mt-4 font-display text-4xl md:text-5xl"
          >
            Studio Young Designs
          </motion.div>
          {/* Gold shimmer wipe */}
          <div className="mx-auto mt-8 h-px w-48 overflow-hidden bg-cream/20">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.2, ease: EASE_SMOOTH }}
              className="h-full w-full bg-gradient-to-r from-transparent via-gold to-transparent"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO — Multi-depth parallax, particles, 3D text entry
   ═══════════════════════════════════════════════════════════════ */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const badgeY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const textZ = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section id="top" ref={ref} className="relative h-[100svh] w-full overflow-hidden bg-charcoal">
      {/* Background image — deepest layer */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroImg}
          alt="Luxury modern living room with walnut wood, warm natural light"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/70" />
      </motion.div>

      {/* Floating gold particles */}
      <ParticleField count={15} />

      {/* Oversized 40+ back layer with depth */}
      <motion.div
        style={{ y: badgeY }}
        className="pointer-events-none absolute inset-0 flex items-end justify-end pb-32 pr-4 md:pr-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 0.50, y: 0, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.4, ease: EASE_SMOOTH }}
          className="font-display text-[28vw] leading-none text-white md:text-[18vw]"
        >
          40<span className="text-gold">+</span>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity, z: textZ }}
        className="relative z-10 h-full px-6 pt-32 md:px-14 pb-36"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-6 flex items-center gap-3 text-white/80"
          >
            <motion.span
              className="gold-rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: EASE_SMOOTH }}
              style={{ transformOrigin: "left" }}
            />
            <span className="eyebrow text-white/70">
              <TextScramble text="Est. 1981 · Bangalore" className="eyebrow text-white/70" />
            </span>
          </motion.div>

          {/* 3D Title — each word enters from rotateX with blur */}
          <h1 className="font-display leading-[1.02] tracking-tight text-white text-[13vw] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            {["Crafting", "Timeless", "Interiors"].map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%", rotateX: 60, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: EASE_SMOOTH }}
                  style={{ transformOrigin: "bottom center" }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <br />
            {["for", "Over"].map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%", rotateX: 60, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1.2, delay: 0.7 + i * 0.1, ease: EASE_SMOOTH }}
                  style={{ transformOrigin: "bottom center" }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "110%", rotateX: 60, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 0.95, ease: EASE_SMOOTH }}
                style={{ transformOrigin: "bottom center" }}
              >
                <Highlight dark>40+ Years.</Highlight>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
          >
            For over four decades, Studio Young Designs has transformed homes and commercial spaces
            through timeless design, premium craftsmanship, and bespoke interiors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Link
                to="/gallery"
                className="group relative inline-flex items-center gap-3 overflow-hidden bg-white px-7 py-4 text-[11px] uppercase tracking-[0.28em] text-charcoal"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="relative">Explore Gallery</span>
                <motion.span
                  className="relative"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  →
                </motion.span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                to="/"
                hash="contact"
                className="group relative inline-flex items-center gap-3 overflow-hidden border border-white/70 px-7 py-4 text-[11px] uppercase tracking-[0.28em] text-white"
              >
                <span className="absolute inset-0 origin-right scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
                <span className="relative transition-colors duration-500 group-hover:text-charcoal">
                  Book a Consultation
                </span>
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        {/* Absolutely positioned bottom row */}
        <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between text-white/75 md:left-14 md:right-14 md:bottom-12 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 1.8 }}
            className="hidden max-w-[220px] text-xs leading-relaxed md:block pointer-events-auto md:ml-auto md:mr-16 text-right"
          >
            A quiet devotion to material, proportion and light — carried through four generations of
            craft.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
            className="flex items-center gap-3 pointer-events-auto"
          >
            <span className="eyebrow text-white/70">Scroll</span>
            <span className="relative block h-12 w-px overflow-hidden bg-white/40">
              <motion.span
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 top-0 h-1/2 bg-gold"
              />
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT — Mask-wipe image reveal + 3D milestone entry
   ═══════════════════════════════════════════════════════════════ */

function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);
  const imgRef = useRef<HTMLDivElement>(null);
  const imgInView = useInView(imgRef, { once: true, margin: "-100px" });

  const milestones = [
    ["1981", "Studio founded in Bangalore, rooted in bespoke woodwork."],
    ["1998", "Expansion into complete residential interior design."],
    ["2010", "Custom modular kitchens & wardrobes atelier established."],
    ["2024", "700+ homes and spaces delivered across South India."],
  ];

  return (
    <section id="about" ref={ref} className="relative bg-cream py-32 md:py-44">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="sticky top-32">
            <Reveal3D delay={0.1} rotateY={-8}>
              <div className="mb-6 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow">
                  <TextScramble text="The Studio" />
                </span>
              </div>
            </Reveal3D>

            {/* Image with horizontal mask-wipe reveal */}
            <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden">
              <motion.div
                initial={{ scaleX: 1 }}
                animate={imgInView ? { scaleX: 0 } : {}}
                transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.2 }}
                style={{ transformOrigin: "right" }}
                className="absolute inset-0 z-10 bg-cream"
              />
              <motion.img
                style={{ y: imgY }}
                src={aboutImg}
                alt="Craftsman hands finishing a walnut furniture piece"
                loading="lazy"
                width={1400}
                height={1600}
                className="h-[115%] w-full object-cover"
              />
              {/* Gold accent border that grows in */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={imgInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.8 }}
                style={{ transformOrigin: "top" }}
                className="absolute right-0 top-0 h-full w-1 bg-gold/60"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-7 md:pl-8">
          <SplitHeading
            text="Four decades. One quiet obsession — space that lasts."
            className="text-4xl md:text-6xl"
          />
          <Reveal3D delay={0.2} rotateX={8}>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-foreground/75">
              Studio Young Designs began in 1981 as a small atelier in Bangalore, drawing on the
              region's tradition of fine joinery. Today, we design and build complete interiors —
              from the residence's first sketch to the last brass detail — for families who value
              restraint, honest materials and craftsmanship that ages beautifully.
            </p>
          </Reveal3D>

          <div className="mt-16">
            <div className="hairline mb-8" />
            <div className="grid gap-8">
              {milestones.map(([year, text], i) => (
                <Reveal3D key={year} delay={i * 0.12} rotateX={10} rotateY={i % 2 === 0 ? 5 : -5}>
                  <div className="grid grid-cols-[minmax(0,110px)_1fr] items-baseline gap-6 md:grid-cols-[minmax(0,140px)_1fr]">
                    <motion.div
                      className="font-display text-3xl text-walnut md:text-4xl"
                      whileHover={{ scale: 1.05, color: "oklch(0.72 0.09 78)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {year}
                    </motion.div>
                    <div className="text-sm leading-relaxed text-foreground/70 md:text-base">{text}</div>
                  </div>
                  <div className="hairline mt-6" />
                </Reveal3D>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WHY CHOOSE US — TiltCards with dynamic lighting
   ═══════════════════════════════════════════════════════════════ */

function Why() {
  const items = [
    { t: "40+ Years Experience", d: "A four-decade practice, refined project by project." },
    { t: "Bespoke Designs", d: "Every space drawn from the ground up around how you live." },
    { t: "Premium Materials", d: "Walnut, oak, natural stone, brass — sourced without compromise." },
    { t: "Turnkey Execution", d: "One studio, from first sketch to final handover." },
    { t: "Expert Craftsmanship", d: "In-house atelier with master carpenters and finishers." },
    { t: "Personalized Design Process", d: "A slow, considered dialogue with each client." },
  ];
  return (
    <section className="relative bg-background py-32 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <Reveal3D rotateX={10}>
              <div className="mb-6 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow">
                  <TextScramble text="Why choose us" />
                </span>
              </div>
            </Reveal3D>
            <SplitHeading text="Considered work, without compromise." className="text-4xl md:text-5xl" />
          </div>
          <Reveal3D delay={0.2} rotateX={6} className="md:col-span-5 md:col-start-8">
            <p className="text-base leading-relaxed text-foreground/70">
              We are a small studio by choice. It lets us stay close to the drawing, to the wood, to
              the client — and to the standards we set ourselves in 1981.
            </p>
          </Reveal3D>
        </div>

        <div className="grid grid-cols-1 border-l border-t border-border/60 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal3D key={it.t} delay={(i % 3) * 0.1} rotateX={12} rotateY={(i % 3 - 1) * 6}>
              <TiltCard intensity={8}>
                <div className="group relative flex h-full flex-col justify-between border-b border-r border-border/60 p-8 transition-colors duration-500 hover:bg-cream md:p-10">
                  <div className="flex items-center justify-between">
                    <motion.span
                      className="font-display text-2xl text-walnut"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </motion.span>
                    <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-16" />
                  </div>
                  <div className="mt-16">
                    <h3 className="font-display text-2xl md:text-[1.75rem]">{it.t}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/65">{it.d}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal3D>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVICES — Diagonal Wipe + 3D Perspective Tilt
   ═══════════════════════════════════════════════════════════════ */

function Services() {
  const items = [
    {
      k: "01",
      t: "Kitchens",
      d: "Custom modular kitchens built around the way your family cooks and gathers.",
      img: svcKitchen,
      href: "/services/kitchens",
    },
    {
      k: "02",
      t: "Wardrobes",
      d: "Bespoke wardrobes in walnut, oak and lacquer with brushed metal hardware.",
      img: svcWardrobe,
      href: "/services/wardrobes",
    },
    {
      k: "03",
      t: "Living Spaces",
      d: "Living, dining and lounging rooms composed as considered whole environments.",
      img: svcLiving,
      href: "/services/living-spaces",
    },
    {
      k: "04",
      t: "Interiors",
      d: "End-to-end design and execution for residences and commercial spaces.",
      img: svcComplete,
      href: "/services/interiors",
    },
  ];
  return (
    <section id="services" className="relative bg-charcoal py-32 text-cream md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-24 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal3D rotateX={10}>
              <div className="mb-6 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow text-cream/60">
                  <TextScramble text="Services" className="eyebrow text-cream/60" />
                </span>
              </div>
            </Reveal3D>
            <SplitHeading text="Four disciplines. One studio." className="text-4xl text-cream md:text-6xl" />
          </div>
        </div>

        <div className="space-y-24 md:space-y-32">
          {items.map((it, i) => (
            <ServiceRow key={it.k} item={it} flip={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({
  item,
  flip,
  index,
}: {
  item: { k: string; t: string; d: string; img: string; href: string };
  flip: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"]);
  const imgRef = useRef<HTMLDivElement>(null);
  const imgInView = useInView(imgRef, { once: true, margin: "-100px" });

  const clipFrom = flip
    ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
    : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
  const clipTo = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16 ${
        flip ? "md:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="md:col-span-7">
        <div ref={imgRef} className="relative aspect-[4/3] overflow-hidden">
          <motion.div
            initial={{ clipPath: clipFrom }}
            animate={imgInView ? { clipPath: clipTo } : {}}
            transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.1 }}
            className="absolute inset-0"
          >
            <motion.img
              style={{ y }}
              src={item.img}
              alt={item.t}
              loading="lazy"
              className="h-[115%] w-full object-cover transition-transform duration-[1200ms] ease-out will-change-transform hover:scale-[1.04]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={imgInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, ease: EASE_SMOOTH, delay: 1 }}
            style={{ transformOrigin: flip ? "right" : "left" }}
            className="absolute bottom-0 left-0 h-[2px] w-full bg-gold/50"
          />
        </div>
      </div>

      <div className="md:col-span-5">
        <Reveal3D delay={0.2} rotateY={flip ? -8 : 8}>
          <motion.div
            className="font-display text-6xl text-gold/80"
            whileHover={{ scale: 1.05, rotateZ: -3 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {item.k}
          </motion.div>
          <h3 className="mt-6 font-display text-4xl md:text-5xl">{item.t}</h3>
          <p className="mt-6 max-w-md text-base leading-relaxed text-cream/70">{item.d}</p>
          <motion.div whileHover={{ x: 8 }} transition={{ type: "spring", stiffness: 300 }} className="mt-10">
            <Link
              to={item.href}
              className="inline-flex items-center gap-3 border-b border-cream/40 pb-2 text-[11px] uppercase tracking-[0.28em] text-cream transition-colors hover:border-gold hover:text-gold"
            >
              Explore service <span>→</span>
            </Link>
          </motion.div>
        </Reveal3D>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — 3D Tilt hover cards with reflection
   ═══════════════════════════════════════════════════════════════ */

function Portfolio() {
  const pieces = [
    { img: p1, title: "Malabar Residence", place: "Dining · Bangalore", h: "tall" },
    { img: p2, title: "Sadashivanagar House", place: "Master Bedroom", h: "short" },
    { img: p3, title: "Cubbon Study", place: "Home Library", h: "short" },
    { img: p4, title: "Whitefield Villa", place: "Marble & Walnut Bath", h: "tall" },
  ];
  return (
    <section id="portfolio" className="relative bg-background py-32 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal3D rotateX={10}>
              <div className="mb-6 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow">
                  <TextScramble text="Selected Work" />
                </span>
              </div>
            </Reveal3D>
            <SplitHeading text="A quiet portfolio of considered homes." className="text-4xl md:text-6xl" />
          </div>
          <Reveal3D className="max-w-sm" rotateX={6}>
            <p className="text-sm leading-relaxed text-foreground/65">
              A small selection from seven hundred completed projects — chosen to show how our
              language of material and light adapts to each family.
            </p>
          </Reveal3D>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {pieces.map((p, i) => (
            <Reveal3D key={p.title} delay={(i % 2) * 0.1} rotateX={12} rotateY={(i % 2 === 0 ? 1 : -1) * 6}>
              <PortfolioCard piece={p} />
            </Reveal3D>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioCard({
  piece,
}: {
  piece: { img: string; title: string; place: string; h: string };
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { x, y } = useCursorTag(ref);
  const [hover, setHover] = useState(false);

  return (
    <TiltCard intensity={6}>
      <Link
        ref={ref}
        to="/gallery"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`group relative block overflow-hidden bg-muted ${
          piece.h === "tall" ? "aspect-[4/5]" : "aspect-[4/3]"
        }`}
      >
        <motion.img
          src={piece.img}
          alt={piece.title}
          loading="lazy"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        {/* Cursor-following "View" blob */}
        <motion.div
          style={{ x, y }}
          animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.6 }}
          transition={{ duration: 0.35, ease: EASE_SMOOTH }}
          className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.span
            className="grid h-24 w-24 place-items-center rounded-full bg-gold font-display text-sm uppercase tracking-[0.24em] text-charcoal"
            animate={hover ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            View
          </motion.span>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
          <div className="text-white">
            <div className="eyebrow text-white/70">{piece.place}</div>
            <div className="mt-2 overflow-hidden">
              <motion.span
                className="block font-display text-2xl md:text-3xl"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {piece.title}
              </motion.span>
            </div>
            <motion.span
              className="mt-3 block h-px bg-gold"
              initial={{ width: 32 }}
              whileHover={{ width: 96 }}
              transition={{ duration: 0.5, ease: EASE_SMOOTH }}
            />
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROCESS — Animated SVG line + 3D step rotation entry
   ═══════════════════════════════════════════════════════════════ */

function Process() {
  const steps = [
    ["Consultation", "We listen. To how you live, entertain, work and rest."],
    ["Concept Design", "Plans, mood and material stories drawn to your brief."],
    ["Material Selection", "Woods, stones, metals and textiles — chosen in hand."],
    ["Manufacturing", "Built in our own atelier by master carpenters."],
    ["Installation", "Site executed by a single dedicated project team."],
    ["Final Handover", "A quiet reveal. Followed by a lifetime of care."],
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="process" ref={sectionRef} className="relative bg-cream py-32 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20">
          <Reveal3D rotateX={10}>
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">
                <TextScramble text="Design Process" />
              </span>
            </div>
          </Reveal3D>
          <SplitHeading text="Six steps. One considered journey." className="text-4xl md:text-6xl" />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-4 top-0 w-px bg-gold md:left-1/2"
          />

          <div className="space-y-16 md:space-y-24">
            {steps.map(([title, desc], i) => (
              <Reveal3D key={title} delay={i * 0.06} rotateX={15} rotateY={i % 2 === 0 ? 8 : -8}>
                <div
                  className={`relative grid grid-cols-[minmax(0,1fr)] gap-8 pl-14 md:grid-cols-2 md:gap-16 md:pl-0 ${
                    i % 2 === 0 ? "md:pr-1/2" : "md:pl-1/2"
                  }`}
                >
                  <div
                    className={`absolute top-2 flex items-center gap-4 md:top-3 ${
                      i % 2 === 0
                        ? "left-0 md:left-1/2 md:-translate-x-1/2"
                        : "left-0 md:left-1/2 md:-translate-x-1/2"
                    }`}
                  >
                    <motion.span
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-cream font-display text-sm leading-none text-walnut"
                      whileInView={{ scale: [0.5, 1.2, 1], borderColor: ["oklch(0.9 0.01 70)", "oklch(0.72 0.09 78)"] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    >
                      <span className="relative -top-[2px]">{i + 1}</span>
                    </motion.span>
                  </div>
                  <div
                    className={
                      i % 2 === 0
                        ? "md:col-start-1 md:pr-16 md:text-right"
                        : "md:col-start-2 md:pl-16"
                    }
                  >
                    <h3 className="font-display text-3xl md:text-4xl">{title}</h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
                      {desc}
                    </p>
                  </div>
                </div>
              </Reveal3D>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COUNTERS — 3D Flip Counter (Departure Board Style)
   ═══════════════════════════════════════════════════════════════ */

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const smooth = useSpring(mv, { duration: 2000, bounce: 0 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 2.2, ease: [0.22, 1, 0.36, 1] });
    const unsub = smooth.on("change", (v) => setVal(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, to, mv, smooth]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

function Counters() {
  const stats: Array<{ n: number; s: string; label: string } | { text: string; label: string }> = [
    { n: 40, s: "+", label: "Years of Experience" },
    { n: 700, s: "+", label: "Projects Completed" },
    { n: 100, s: "%", label: "Custom Designs" },
    { text: "Premium", label: "Quality Materials" },
  ];
  return (
    <section className="relative overflow-hidden bg-walnut-deep py-28 text-cream md:py-36">
      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gold/10"
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal3D rotateX={10}>
          <div className="mb-16 flex items-center gap-3">
            <span className="gold-rule" />
            <span className="eyebrow text-cream/60">
              <TextScramble text="By the numbers" className="eyebrow text-cream/60" />
            </span>
          </div>
        </Reveal3D>
        <div className="grid grid-cols-1 gap-12 border-t border-cream/15 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((st, i) => (
            <Reveal3D key={i} delay={i * 0.12} rotateX={15} rotateY={(i - 1.5) * 5}>
              <div className="pt-10">
                <div className="font-display text-6xl leading-none md:text-7xl">
                  {"n" in st ? <CountUp to={st.n} suffix={st.s} /> : st.text}
                </div>
                <div className="mt-6 text-xs uppercase tracking-[0.28em] text-cream/60">{st.label}</div>
              </div>
            </Reveal3D>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS — 3D Depth Carousel
   ═══════════════════════════════════════════════════════════════ */

function Testimonials() {
  const items = [
    {
      q: "They understood our home before we did. Four decades of intuition — it shows in every joint.",
      n: "Ananya & Rohan Mehta",
      p: "Sadashivanagar Residence",
    },
    {
      q: "A rare studio that treats the drawing, the wood and the client with the same quiet respect.",
      n: "Vikram Rao",
      p: "Whitefield Villa",
    },
    {
      q: "Delivered on time, without a single compromise on material. That's Studio Young.",
      n: "Priya Iyengar",
      p: "Indiranagar Apartment",
    },
  ];

  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length, isMobile]);

  return (
    <section className="relative bg-background py-32 md:py-40 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20 max-w-3xl">
          <Reveal3D rotateX={10}>
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">
                <TextScramble text="Kind Words" />
              </span>
            </div>
          </Reveal3D>
          <SplitHeading text="From the families we've built for." className="text-4xl md:text-6xl" />
        </div>

        <div className="relative" style={{ perspective: "1000px" }}>
          <div className="flex flex-col gap-6 md:flex-row md:gap-0 md:justify-center md:items-center" style={{ minHeight: isMobile ? "auto" : 320 }}>
            {items.map((t, i) => {
              const offset = i - active;
              const isActive = i === active;
              return (
                <motion.figure
                  key={t.n}
                  onClick={() => !isMobile && setActive(i)}
                  animate={isMobile ? {
                    z: 0,
                    x: "0%",
                    scale: 1,
                    opacity: 1,
                    rotateY: 0,
                  } : {
                    z: isActive ? 50 : -100,
                    x: `${offset * 105}%`,
                    scale: isActive ? 1 : 0.85,
                    opacity: isActive ? 1 : 0.4,
                    rotateY: offset * -10,
                  }}
                  transition={{ duration: 0.8, ease: EASE_SMOOTH }}
                  className={`flex-shrink-0 w-full md:w-[420px] md:absolute md:left-1/2 md:-translate-x-1/2 flex flex-col justify-between border-t border-border pt-8 p-8 ${
                    isActive && !isMobile ? "shadow-2xl bg-cream" : "bg-background"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <blockquote className="font-display text-2xl leading-snug text-foreground md:text-[1.65rem]">
                    <span className="text-gold">"</span>
                    {t.q}
                    <span className="text-gold">"</span>
                  </blockquote>
                  <figcaption className="mt-10">
                    <div className="text-sm font-medium">{t.n}</div>
                    <div className="eyebrow mt-1">{t.p}</div>
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>

          {!isMobile && (
            <div className="mt-12 flex items-center justify-center gap-3">
              {items.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActive(i)}
                  className="relative h-2 rounded-full bg-border"
                  animate={{ width: i === active ? 32 : 8, backgroundColor: i === active ? "var(--gold)" : undefined }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT — Enhanced form field animations
   ═══════════════════════════════════════════════════════════════ */

function Contact() {
  const [projectType, setProjectType] = useState("");

  return (
    <section id="contact" className="relative bg-charcoal pt-32 pb-0 text-cream md:pt-40 md:pb-0">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <Reveal3D rotateX={10} rotateY={-6}>
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow text-cream/60">
                <TextScramble text="Contact" className="eyebrow text-cream/60" />
              </span>
            </div>
            <SplitHeading text="Begin a considered conversation." className="text-4xl text-cream md:text-5xl" />
          </Reveal3D>

          <Reveal3D delay={0.2} rotateX={8}>
            <p className="mt-8 max-w-md text-base leading-relaxed text-cream/70">
              Tell us a little about your space. We reply personally, usually within a day, and
              arrange a quiet visit to your home or our Bangalore studio.
            </p>
          </Reveal3D>

          <Reveal3D delay={0.3} rotateX={8}>
            <div className="mt-14 space-y-8">
              <div>
                <div className="eyebrow text-cream/50">Studio</div>
                <div className="mt-2 text-base leading-relaxed">
                  No.105, Parvathi Plaza, Richmond Rd,<br />Richmond Town, Bengaluru, Karnataka 560025
                </div>
              </div>
              <div>
                <div className="eyebrow text-cream/50">Direct</div>
                <div className="mt-2 text-base">
                  <a href="tel:+919902599515" className="hover:text-gold transition-colors">
                    +91-9902599515
                  </a>
                </div>
              </div>
              <div>
                <div className="eyebrow text-cream/50">Email</div>
                <div className="mt-2 text-base space-y-1">
                  <a href="mailto:info@studioyoungdesigns.com" className="hover:text-gold transition-colors block">
                    info@studioyoungdesigns.com
                  </a>
                  <a href="mailto:youngdesigns9@gmail.com" className="hover:text-gold transition-colors block">
                    youngdesigns9@gmail.com
                  </a>
                  <div className="text-cream/40 text-sm mt-1 italic">We reply within 24 Hrs</div>
                </div>
              </div>
              <div>
                <div className="eyebrow text-cream/50">Hours</div>
                <div className="mt-2 text-base space-y-1">
                  <div>Mon–Sat · 10:30 AM – 8:00 PM</div>
                  <div>Sun · 11:00 AM – 6:00 PM</div>
                </div>
              </div>
            </div>
          </Reveal3D>

        </div>

        <Reveal3D delay={0.15} rotateX={8} rotateY={6} className="md:col-span-6 md:col-start-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you. We'll be in touch shortly.");
            }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Field label="Name" name="name" required delay={0} />
              <Field label="Email" name="email" type="email" required delay={0.1} />
              <Field label="Phone" name="phone" required delay={0.2} />
              <Field label="Location" name="location" required delay={0.3} />
            </div>
            
            <div>
              <SelectField
                label="Project type"
                name="type"
                options={["Kitchens", "Wardrobes", "Living Spaces", "Interiors", "Other"]}
                value={projectType}
                onChange={setProjectType}
                required
                delay={0.4}
              />
            </div>

            <AnimatePresence mode="wait">
              {projectType === "Other" && (
                <motion.div
                  key="other-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                  className="space-y-8 overflow-hidden"
                >
                  <Field label="Specify what you want" name="specify_type" required delay={0} />
                  <Field label="Custom project description" name="specify_description" textarea required delay={0.1} />
                </motion.div>
              )}

              {projectType !== "Other" && (
                <motion.div
                  key="default-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                  className="overflow-hidden"
                >
                  <Field label="Tell us about your space" name="message" textarea required delay={0} />
                </motion.div>
              )}
            </AnimatePresence>

            <Magnetic>
              <motion.button
                type="submit"
                className="mt-4 group inline-flex items-center gap-4 border border-cream/60 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-cream transition-all hover:border-gold hover:bg-gold hover:text-charcoal cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Enquiry{" "}
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </motion.button>
            </Magnetic>
          </form>
        </Reveal3D>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  textarea = false,
  delay = 0,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  delay?: number;
  required?: boolean;
}) {
  const ref = useRef<HTMLLabelElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [focused, setFocused] = useState(false);

  return (
    <motion.label
      ref={ref}
      className="block relative"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE_SMOOTH }}
    >
      <motion.span
        className="eyebrow text-cream/50"
        animate={focused ? { color: "#ffffff", y: -2 } : { y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label} {required && <span className="text-gold">*</span>}
      </motion.span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="mt-3 w-full resize-none border-0 border-b border-cream/25 bg-transparent py-3 text-base text-cream outline-none transition-colors focus:border-gold"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="mt-3 w-full border-0 border-b border-cream/25 bg-transparent py-3 text-base text-cream outline-none transition-colors focus:border-gold"
        />
      )}
      <motion.span
        className="absolute bottom-0 left-0 h-px bg-gold"
        animate={{ width: focused ? "100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
      />
    </motion.label>
  );
}

function SelectField({
  label,
  name,
  options,
  value,
  onChange,
  delay = 0,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  delay?: number;
  required?: boolean;
}) {
  const ref = useRef<HTMLLabelElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <motion.label
      ref={ref}
      className="block relative"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE_SMOOTH }}
    >
      <motion.span
        className="eyebrow text-cream/50"
        animate={focused || value ? { color: "#ffffff", y: -2 } : { y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label} {required && <span className="text-gold">*</span>}
      </motion.span>
      
      <input type="hidden" name={name} value={value} required={required} />

      <div
        ref={dropdownRef}
        onClick={() => {
          setIsOpen(!isOpen);
          setFocused(!isOpen);
        }}
        className="relative mt-3 w-full border-0 border-b border-cream/25 bg-transparent py-3 text-base text-cream outline-none transition-colors focus:border-gold cursor-pointer flex items-center justify-between"
      >
        <span className={value ? "text-cream" : "text-cream/40"}>
          {value || `Select ${label.toLowerCase()}...`}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE_SMOOTH }}
          className="w-4 h-4 text-cream/60 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </motion.svg>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto border border-cream/15 bg-walnut-deep rounded-sm shadow-2xl py-1 backdrop-blur-md"
            >
              {options.map((opt) => (
                <div
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt);
                    setIsOpen(false);
                    setFocused(false);
                  }}
                  className={`px-4 py-3 text-sm tracking-wide font-sans cursor-pointer transition-colors ${
                    value === opt
                      ? "bg-gold text-charcoal font-medium"
                      : "text-cream/90 hover:bg-cream/10 hover:text-white"
                  }`}
                >
                  {opt}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.span
        className="absolute bottom-0 left-0 h-px bg-gold"
        animate={{ width: focused ? "100%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
      />
    </motion.label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE — Full composition with shared layout wrappers
   ═══════════════════════════════════════════════════════════════ */

function Home() {
  return (
    <PageWrapper>
      <Loader />
      <Hero />
      <About />
      <Marquee items={["Since 1981", "Bespoke Interiors", "40+ Years", "Bangalore", "Timeless Craft"]} />
      <Why />
      <Services />
      <Portfolio />
      <Marquee dark items={["700+ Homes", "Turnkey Execution", "Walnut · Stone · Brass", "In-House Atelier"]} />
      <Process />
      <Counters />
      <Testimonials />
      <Contact />
    </PageWrapper>
  );
}
