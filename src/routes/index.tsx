import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, animate } from "framer-motion";

import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about.jpg";
import svcComplete from "@/assets/service-complete.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";
import svcLiving from "@/assets/service-living.jpg";
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

/* --------------------------------- Nav --------------------------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-panel border-b border-border/40 py-3" : "py-6"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-10">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none">Studio Young</span>
          <span className="eyebrow hidden sm:inline">Designs</span>
        </a>
        <nav className="hidden items-center gap-10 md:flex">
          {[
            ["About", "#about"],
            ["Services", "#services"],
            ["Portfolio", "#portfolio"],
            ["Process", "#process"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-xs uppercase tracking-[0.24em] text-foreground/70 transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden rounded-none border border-foreground/70 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] transition-all hover:bg-foreground hover:text-background md:inline-block"
        >
          Book Consultation
        </a>
      </div>
    </header>
  );
}

/* -------------------------- Reveal / helpers -------------------------- */
function Reveal({
  children,
  delay = 0,
  y = 40,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SplitHeading({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <h2 ref={ref} className={`font-display leading-[1.02] tracking-tight ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : {}}
            transition={{ duration: 1.1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

/* Word with animated gold underline brush + highlight glow */
function Highlight({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap italic">
      <span className={dark ? "text-gold" : "text-walnut"}>{children}</span>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left" }}
        className="pointer-events-none absolute -bottom-1 left-0 block h-[6px] w-full rounded-full bg-gold/70 blur-[1px]"
      />
    </span>
  );
}

/* Magnetic hover wrapper — pulls child toward cursor */
function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * 24);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 16);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Infinite marquee band */
function Marquee({
  items,
  dark = false,
}: {
  items: string[];
  dark?: boolean;
}) {
  const row = [...items, ...items, ...items];
  return (
    <div
      className={`relative overflow-hidden border-y ${
        dark ? "border-cream/15 bg-charcoal text-cream" : "border-border bg-cream text-foreground"
      } py-8`}
    >
      <motion.div
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="flex whitespace-nowrap"
      >
        {row.map((t, i) => (
          <span key={i} className="mx-10 flex items-center gap-10 font-display text-4xl md:text-6xl">
            {t}
            <span className="inline-block h-2 w-2 rotate-45 bg-gold" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* Cursor-follow "View" tag inside a container */
function useCursorTag(containerRef: React.RefObject<HTMLElement | null>) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 25 });
  const sy = useSpring(y, { stiffness: 300, damping: 25 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, [containerRef, x, y]);
  return { x: sx, y: sy };
}



/* --------------------------------- Hero -------------------------------- */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const badgeY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

  return (
    <section id="top" ref={ref} className="relative h-[100svh] w-full overflow-hidden bg-charcoal">
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

      {/* Oversized 40+ back layer */}
      <motion.div
        style={{ y: badgeY }}
        className="pointer-events-none absolute inset-0 flex items-end justify-end pb-32 pr-4 md:pr-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.18, y: 0 }}
          transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[28vw] leading-none text-white md:text-[18vw]"
        >
          40<span className="text-gold">+</span>
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 flex h-full flex-col justify-between px-6 pb-14 pt-32 md:px-14 md:pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-6 flex items-center gap-3 text-white/80"
          >
            <span className="gold-rule" />
            <span className="eyebrow text-white/70">Est. 1984 · Bangalore</span>
          </motion.div>
          <h1 className="font-display leading-[1.02] tracking-tight text-white text-[13vw] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            {["Crafting", "Timeless", "Interiors"].map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
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
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                <Highlight dark>40 Years.</Highlight>
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
          >
            For over four decades, Studio Young Designs has transformed homes and commercial spaces
            through timeless design, premium craftsmanship, and bespoke interiors.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a
                href="#portfolio"
                className="group relative inline-flex items-center gap-3 overflow-hidden bg-white px-7 py-4 text-[11px] uppercase tracking-[0.28em] text-charcoal"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="relative">Explore Projects</span>
                <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-3 overflow-hidden border border-white/70 px-7 py-4 text-[11px] uppercase tracking-[0.28em] text-white"
              >
                <span className="absolute inset-0 origin-right scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
                <span className="relative transition-colors duration-500 group-hover:text-charcoal">
                  Book a Consultation
                </span>
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <div className="flex items-end justify-between text-white/75">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 1.6 }}
            className="hidden max-w-[220px] text-xs leading-relaxed md:block"
          >
            A quiet devotion to material, proportion and light — carried through four generations of
            craft.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex items-center gap-3"
          >
            <span className="eyebrow text-white/70">Scroll</span>
            <span className="relative block h-12 w-px bg-white/40 overflow-hidden">
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

/* --------------------------------- About -------------------------------- */
function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);

  const milestones = [
    ["1984", "Studio founded in Bangalore, rooted in bespoke woodwork."],
    ["1998", "Expansion into complete residential interior design."],
    ["2010", "Custom modular kitchens & wardrobes atelier established."],
    ["2024", "700+ homes and spaces delivered across South India."],
  ];

  return (
    <section id="about" ref={ref} className="relative bg-cream py-32 md:py-44">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="sticky top-32">
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">The Studio</span>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden">
              <motion.img
                style={{ y: imgY }}
                src={aboutImg}
                alt="Craftsman hands finishing a walnut furniture piece"
                loading="lazy"
                width={1400}
                height={1600}
                className="h-[115%] w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-7 md:pl-8">
          <SplitHeading
            text="Four decades. One quiet obsession — space that lasts."
            className="text-4xl md:text-6xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-foreground/75">
              Studio Young Designs began in 1984 as a small atelier in Bangalore, drawing on the
              region's tradition of fine joinery. Today, we design and build complete interiors —
              from the residence's first sketch to the last brass detail — for families who value
              restraint, honest materials and craftsmanship that ages beautifully.
            </p>
          </Reveal>

          <div className="mt-16">
            <div className="hairline mb-8" />
            <div className="grid gap-8">
              {milestones.map(([year, text], i) => (
                <Reveal key={year} delay={i * 0.1}>
                  <div className="grid grid-cols-[minmax(0,110px)_1fr] items-baseline gap-6 md:grid-cols-[minmax(0,140px)_1fr]">
                    <div className="font-display text-3xl text-walnut md:text-4xl">{year}</div>
                    <div className="text-sm leading-relaxed text-foreground/70 md:text-base">
                      {text}
                    </div>
                  </div>
                  <div className="hairline mt-6" />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Why Choose Us ------------------------------ */
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
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">Why choose us</span>
            </div>
            <SplitHeading
              text="Considered work, without compromise."
              className="text-4xl md:text-5xl"
            />
          </div>
          <Reveal delay={0.2} className="md:col-span-5 md:col-start-8">
            <p className="text-base leading-relaxed text-foreground/70">
              We are a small studio by choice. It lets us stay close to the drawing, to the wood, to
              the client — and to the standards we set ourselves in 1984.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 border-l border-t border-border/60 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 3) * 0.08}>
              <div className="group relative flex h-full flex-col justify-between border-b border-r border-border/60 p-8 transition-colors duration-500 hover:bg-cream md:p-10">
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-walnut">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-16" />
                </div>
                <div className="mt-16">
                  <h3 className="font-display text-2xl md:text-[1.75rem]">{it.t}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/65">{it.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Services --------------------------------- */
function Services() {
  const items = [
    {
      k: "01",
      t: "Complete Interior Design",
      d: "End-to-end design and execution for residences and commercial spaces.",
      img: svcComplete,
    },
    {
      k: "02",
      t: "Modular Kitchens",
      d: "Custom kitchens built around the way your family cooks and gathers.",
      img: svcKitchen,
    },
    {
      k: "03",
      t: "Custom Wardrobes",
      d: "Bespoke wardrobes in walnut, oak and lacquer with brushed metal hardware.",
      img: svcWardrobe,
    },
    {
      k: "04",
      t: "Living Spaces",
      d: "Living, dining and lounging rooms composed as considered whole environments.",
      img: svcLiving,
    },
  ];
  return (
    <section id="services" className="relative bg-charcoal py-32 text-cream md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-24 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow text-cream/60">Services</span>
            </div>
            <SplitHeading
              text="Four disciplines. One studio."
              className="text-4xl text-cream md:text-6xl"
            />
          </div>
        </div>

        <div className="space-y-24 md:space-y-32">
          {items.map((it, i) => (
            <ServiceRow key={it.k} item={it} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({
  item,
  flip,
}: {
  item: { k: string; t: string; d: string; img: string };
  flip: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"]);
  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16 ${
        flip ? "md:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="md:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            style={{ y }}
            src={item.img}
            alt={item.t}
            loading="lazy"
            className="h-[115%] w-full object-cover transition-transform duration-[1200ms] ease-out will-change-transform hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>
      <div className="md:col-span-5">
        <Reveal>
          <div className="font-display text-6xl text-gold/80">{item.k}</div>
          <h3 className="mt-6 font-display text-4xl md:text-5xl">{item.t}</h3>
          <p className="mt-6 max-w-md text-base leading-relaxed text-cream/70">{item.d}</p>
          <a
            href="#contact"
            className="mt-10 inline-flex items-center gap-3 border-b border-cream/40 pb-2 text-[11px] uppercase tracking-[0.28em] text-cream transition-colors hover:border-gold hover:text-gold"
          >
            Discuss a project <span>→</span>
          </a>
        </Reveal>
      </div>
    </div>
  );
}

/* --------------------------------- Portfolio -------------------------------- */
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
            <div className="mb-6 flex items-center gap-3">
              <span className="gold-rule" />
              <span className="eyebrow">Selected Work</span>
            </div>
            <SplitHeading
              text="A quiet portfolio of considered homes."
              className="text-4xl md:text-6xl"
            />
          </div>
          <Reveal className="max-w-sm">
            <p className="text-sm leading-relaxed text-foreground/65">
              A small selection from seven hundred completed projects — chosen to show how our
              language of material and light adapts to each family.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {pieces.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.1}>
              <a
                href="#contact"
                className={`group relative block overflow-hidden bg-muted ${
                  p.h === "tall" ? "aspect-[4/5]" : "aspect-[4/3]"
                }`}
              >
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
                  <div className="text-white">
                    <div className="eyebrow text-white/70">{p.place}</div>
                    <div className="mt-2 font-display text-2xl md:text-3xl">{p.title}</div>
                  </div>
                  <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-white/70 text-white">
                      →
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Process --------------------------------- */
function Process() {
  const steps = [
    ["Consultation", "We listen. To how you live, entertain, work and rest."],
    ["Concept Design", "Plans, mood and material stories drawn to your brief."],
    ["Material Selection", "Woods, stones, metals and textiles — chosen in hand."],
    ["Manufacturing", "Built in our own atelier by master carpenters."],
    ["Installation", "Site executed by a single dedicated project team."],
    ["Final Handover", "A quiet reveal. Followed by a lifetime of care."],
  ];
  return (
    <section id="process" className="relative bg-cream py-32 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20">
          <div className="mb-6 flex items-center gap-3">
            <span className="gold-rule" />
            <span className="eyebrow">Design Process</span>
          </div>
          <SplitHeading text="Six steps. One considered journey." className="text-4xl md:text-6xl" />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2" />
          <div className="space-y-16 md:space-y-24">
            {steps.map(([title, desc], i) => (
              <Reveal key={title} delay={i * 0.05}>
                <div
                  className={`relative grid grid-cols-[minmax(0,1fr)] gap-8 pl-14 md:grid-cols-2 md:gap-16 md:pl-0 ${
                    i % 2 === 0 ? "md:pr-1/2" : "md:pl-1/2"
                  }`}
                >
                  <div
                    className={`absolute top-2 flex items-center gap-4 md:top-3 ${
                      i % 2 === 0 ? "left-0 md:left-1/2 md:-translate-x-1/2" : "left-0 md:left-1/2 md:-translate-x-1/2"
                    }`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-gold bg-cream font-display text-sm text-walnut">
                      {i + 1}
                    </span>
                  </div>
                  <div className={i % 2 === 0 ? "md:col-start-1 md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"}>
                    <h3 className="font-display text-3xl md:text-4xl">{title}</h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
                      {desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Counter --------------------------------- */
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
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="gold-rule" />
            <span className="eyebrow text-cream/60">By the numbers</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-12 border-t border-cream/15 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((st, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="pt-10">
                <div className="font-display text-6xl leading-none md:text-7xl">
                  {"n" in st ? <CountUp to={st.n} suffix={st.s} /> : st.text}
                </div>
                <div className="mt-6 text-xs uppercase tracking-[0.28em] text-cream/60">
                  {st.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Testimonials -------------------------------- */
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
  return (
    <section className="relative bg-background py-32 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-20 max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="gold-rule" />
            <span className="eyebrow">Kind Words</span>
          </div>
          <SplitHeading
            text="From the families we've built for."
            className="text-4xl md:text-6xl"
          />
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {items.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.1}>
              <figure className="flex h-full flex-col justify-between border-t border-border pt-8">
                <blockquote className="font-display text-2xl leading-snug text-foreground md:text-[1.65rem]">
                  <span className="text-gold">“</span>
                  {t.q}
                  <span className="text-gold">”</span>
                </blockquote>
                <figcaption className="mt-10">
                  <div className="text-sm font-medium">{t.n}</div>
                  <div className="eyebrow mt-1">{t.p}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Contact --------------------------------- */
function Contact() {
  return (
    <section id="contact" className="relative bg-charcoal py-32 text-cream md:py-40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="mb-6 flex items-center gap-3">
            <span className="gold-rule" />
            <span className="eyebrow text-cream/60">Contact</span>
          </div>
          <SplitHeading
            text="Begin a considered conversation."
            className="text-4xl text-cream md:text-5xl"
          />
          <p className="mt-8 max-w-md text-base leading-relaxed text-cream/70">
            Tell us a little about your space. We reply personally, usually within a day, and
            arrange a quiet visit to your home or our Bangalore studio.
          </p>

          <div className="mt-14 space-y-8">
            <div>
              <div className="eyebrow text-cream/50">Studio</div>
              <div className="mt-2 text-base leading-relaxed">
                12/A, Lavelle Road<br />Bangalore 560001, India
              </div>
            </div>
            <div>
              <div className="eyebrow text-cream/50">Direct</div>
              <div className="mt-2 text-base">
                <a href="mailto:studio@youngdesigns.in" className="hover:text-gold">
                  studio@youngdesigns.in
                </a>
                <br />
                <a href="tel:+918012345678" className="hover:text-gold">
                  +91 80 1234 5678
                </a>
              </div>
            </div>
            <div>
              <div className="eyebrow text-cream/50">Hours</div>
              <div className="mt-2 text-base">Mon–Sat · 10:00 – 19:00</div>
            </div>
          </div>

          <div className="mt-14 aspect-[16/10] overflow-hidden border border-cream/15">
            <iframe
              title="Studio Young Designs location"
              src="https://www.google.com/maps?q=Lavelle+Road+Bangalore&output=embed"
              className="h-full w-full grayscale contrast-[1.1]"
              loading="lazy"
            />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you. We'll be in touch shortly.");
          }}
          className="md:col-span-6 md:col-start-7"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field label="Name" name="name" />
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" />
            <Field label="Location" name="location" />
          </div>
          <div className="mt-8">
            <Field label="Project type" name="type" />
          </div>
          <div className="mt-8">
            <Field label="Tell us about your space" name="message" textarea />
          </div>
          <button
            type="submit"
            className="mt-12 group inline-flex items-center gap-4 border border-cream/60 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-cream transition-all hover:border-gold hover:bg-gold hover:text-charcoal"
          >
            Send Enquiry <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-cream/50">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className="mt-3 w-full resize-none border-0 border-b border-cream/25 bg-transparent py-3 text-base text-cream outline-none transition-colors focus:border-gold"
        />
      ) : (
        <input
          type={type}
          name={name}
          className="mt-3 w-full border-0 border-b border-cream/25 bg-transparent py-3 text-base text-cream outline-none transition-colors focus:border-gold"
        />
      )}
    </label>
  );
}

/* --------------------------------- Footer --------------------------------- */
function Footer() {
  return (
    <footer className="bg-charcoal pb-10 pt-4 text-cream/60">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="hairline mb-8 opacity-30" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.24em]">
          <div className="font-display text-base normal-case tracking-normal text-cream">
            Studio Young Designs
          </div>
          <div>© {new Date().getFullYear()} · Bangalore, India</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- Loader ---------------------------------- */
function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={done ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal text-cream"
    >
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="eyebrow text-cream/60"
        >
          Est. 1984 · Bangalore
        </motion.div>
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.02em" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-4xl md:text-5xl"
        >
          Studio Young Designs
        </motion.div>
        <div className="mx-auto mt-8 h-px w-48 overflow-hidden bg-cream/20">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full bg-gold"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------- Page --------------------------------- */
function Home() {
  return (
    <div className="relative bg-background text-foreground">
      <Loader />
      <Nav />
      <main>
        <Hero />
        <About />
        <Why />
        <Services />
        <Portfolio />
        <Process />
        <Counters />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
