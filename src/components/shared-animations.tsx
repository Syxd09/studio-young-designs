/**
 * Shared animation components, layout (Nav/Footer), and design tokens
 * used across all pages of Studio Young Designs.
 */

import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useMotionTemplate,
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════
   GLOBAL EFFECTS
   ═══════════════════════════════════════════════════════════════ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="scroll-progress" />;
}

export function GrainOverlay() {
  return <div className="grain-overlay" />;
}

export function ParticleField({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 10,
    opacity: 0.15 + Math.random() * 0.35,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, oklch(0.72 0.09 78 / ${p.opacity}), transparent)`,
            boxShadow: `0 0 ${p.size * 3}px oklch(0.72 0.09 78 / ${p.opacity * 0.5})`,
          }}
          animate={{
            y: ["100vh", "-10vh"],
            scale: [0, 1, 1, 0],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REVEAL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

export function Reveal3D({
  children,
  delay = 0,
  rotateX = 12,
  rotateY = 0,
  z = -80,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  rotateX?: number;
  rotateY?: number;
  z?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <div ref={ref} className={`perspective-container ${className}`}>
      <motion.div
        initial={{ opacity: 0, rotateX, rotateY, z, y: 40 }}
        animate={inView ? { opacity: 1, rotateX: 0, rotateY: 0, z: 0, y: 0 } : {}}
        transition={{ duration: 1.2, delay, ease: EASE_SMOOTH }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 40,
  className = "",
}: {
  children: ReactNode;
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
      transition={{ duration: 1, delay, ease: EASE_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SplitHeading({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <h2 ref={ref} className={`font-display leading-[1.02] tracking-tight ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-2 pr-[0.28em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotateX: 40, opacity: 0 }}
            animate={inView ? { y: "0%", rotateX: 0, opacity: 1 } : {}}
            transition={{ duration: 1.1, delay: i * 0.08, ease: EASE_SMOOTH }}
            style={{ transformOrigin: "bottom center" }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

export function Highlight({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap italic">
      <span className={dark ? "text-gold" : "text-walnut"}>{children}</span>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.6, ease: EASE_SMOOTH }}
        style={{ transformOrigin: "left" }}
        className="pointer-events-none absolute -bottom-1 left-0 block h-[6px] w-full rounded-full bg-gold/70 blur-[1px]"
      />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

export function TiltCard({
  children,
  className = "",
  intensity = 10,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 20 });
  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateX.set((py - 0.5) * -intensity);
      rotateY.set((px - 0.5) * intensity);
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [intensity, rotateX, rotateY, mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <div className="perspective-container">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        className={`relative ${className}`}
      >
        {children}
        <motion.div
          style={{ background }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </motion.div>
    </div>
  );
}

export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
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
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function TextScramble({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [displayed, setDisplayed] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ—·•";

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = 20;
    const id = setInterval(() => {
      frame++;
      setDisplayed(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (frame / totalFrames >= (i + 1) / text.length) return text[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );
      if (frame >= totalFrames) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [inView, text, chars]);

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}

export function useCursorTag(containerRef: React.RefObject<HTMLElement | null>) {
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

export function Marquee({ items, dark = false, reverse = false }: { items: string[]; dark?: boolean; reverse?: boolean }) {
  const row = [...items, ...items, ...items];
  const isLeftToRight = dark || reverse; // dark marquee is left-to-right, light is right-to-left
  return (
    <div
      className={`relative overflow-hidden border-y ${
        dark ? "border-cream/15 bg-charcoal text-cream" : "border-border bg-cream text-foreground"
      } py-8`}
    >
      <motion.div
        animate={{ x: isLeftToRight ? ["-33.333%", "0%"] : ["0%", "-33.333%"] }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
        className="flex whitespace-nowrap"
      >
        {row.map((t, i) => (
          <span key={i} className="mx-10 flex items-center gap-10 font-display text-4xl md:text-6xl">
            {t}
            <motion.span
              className="inline-block h-2 w-2 bg-gold"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS: Array<{ label: string; to: string; hash?: string }> = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/", hash: "about" },
  { label: "Services", to: "/services" },
  { label: "Gallery", to: "/gallery" },
  { label: "Journal", to: "/journal" },
  { label: "Contact Us", to: "/", hash: "contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <Link
          to="/"
          className="flex items-center"
        >
          <img
            src="/logo-transparent.png"
            className="h-10 w-auto object-contain md:h-12"
            alt="Studio Young Designs"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <motion.div key={link.label} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link
                to={link.to}
                hash={link.hash}
                className={`text-xs uppercase tracking-[0.24em] transition-colors duration-500 ${
                  scrolled
                    ? "text-foreground/70 hover:text-foreground"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <Magnetic>
          <Link
            to="/"
            hash="contact"
            className={`hidden rounded-none border px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] transition-all duration-500 md:inline-block ${
              scrolled
                ? "border-foreground/70 text-foreground hover:bg-foreground hover:text-background"
                : "border-white/70 text-white hover:bg-white hover:text-charcoal"
            }`}
          >
            Book Consultation
          </Link>
        </Magnetic>

        {/* Mobile hamburger */}
        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden transition-colors duration-500 ${
            mobileOpen ? "text-cream" : (scrolled ? "text-foreground" : "text-white")
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block h-px w-6 bg-current" />
          <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} className="block h-px w-6 bg-current" />
          <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block h-px w-6 bg-current" />
        </motion.button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-charcoal text-cream"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 30, rotateX: 40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: EASE_SMOOTH }}
              >
                <Link
                  to={link.to}
                  hash={link.hash}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-4xl"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const brandName = "Studio Young Designs";

  const socialLinks = [
    {
      name: "YouTube",
      href: "https://www.youtube.com/channel/UCckX_6Fd6Cd7RG0eWkLyKYQ",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/youngdesign9",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: "Pinterest",
      href: "https://pin.it/2NG2wbjJE",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.164 0 7.397 2.967 7.397 6.93 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.63 0 12-5.373 12-12 0-6.628-5.37-12-12-12z"/>
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/studioyoungdesigns",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      )
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/919902599515",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    }
  ];
  return (
    <footer ref={ref} className="bg-charcoal pb-12 pt-10 text-cream/60">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        
        {/* Two column grid content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16 items-center mb-20">
          
          {/* Left Column: Branding and Legacy */}
          <div className="md:col-span-6 space-y-8">
            <div className="flex items-center">
              <img
                src="/footer-logo.png"
                className="h-16 w-auto object-contain"
                alt="Studio Young Designs"
              />
            </div>

            {/* Description */}
            <p className="font-display text-2xl text-cream/90 max-w-md italic leading-relaxed">
              Studio Young Designs is a Furniture and Interior Design Firm with a strong legacy.
            </p>

            {/* Social Links with magnetic and staggered animation */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="flex items-center gap-3"
            >
              {socialLinks.map((social) => (
                <Magnetic key={social.name}>
                  <motion.a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SMOOTH } }
                    }}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "var(--gold)",
                      borderColor: "var(--gold)",
                      color: "var(--cream)"
                    }}
                    className="w-10 h-10 rounded-full border border-cream/15 grid place-items-center text-cream/65 hover:text-cream transition-colors duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="w-4 h-4 grid place-items-center"
                    >
                      {social.icon}
                    </motion.div>
                  </motion.a>
                </Magnetic>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Google Location Map */}
          <div className="md:col-span-6">
            <div className="aspect-[16/9] w-full overflow-hidden border border-cream/15">
              <iframe
                title="Studio Young Designs location"
                src="https://www.google.com/maps?q=Studio+Young+Designs+Experience+store,+Bengaluru&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="hairline mb-8 opacity-30" />
        <div className="flex flex-wrap items-center justify-between gap-6 text-xs">
          <div className="font-display text-base normal-case tracking-normal italic text-cream/70">
            {"Spaces shaped by legacy and light.".split("").map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.02, ease: EASE_SMOOTH }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-[10px] uppercase tracking-[0.24em] text-cream/40 font-sans"
          >
            Copyright © 2025 Studio Young Designs · All Rights Reserved
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE WRAPPER — wraps inner pages with Nav + Footer + effects
   ═══════════════════════════════════════════════════════════════ */

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-background text-foreground">
      <GrainOverlay />
      <ScrollProgress />
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INNER-PAGE HERO — reusable hero for service / gallery pages
   ═══════════════════════════════════════════════════════════════ */

export function PageHero({
  image,
  title,
  subtitle,
  breadcrumbs,
}: {
  image: string;
  title: string;
  subtitle: string;
  breadcrumbs: Array<{ label: string; to?: string; hash?: string }>;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useMotionTemplate`${useSpring(
    (() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMotionValue(0);
    })(),
  )}%`;

  // Simpler parallax without template
  const imgY = useSpring(
    (() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const mv = useMotionValue(0);
      return mv;
    })(),
  );

  return (
    <section ref={ref} className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-charcoal">
      <motion.div
        style={{ y: imgY }}
        className="absolute inset-0"
      >
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-14">
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 flex items-center gap-2 text-white/60"
          >
            {breadcrumbs.map((bc, i) => (
              <span key={bc.label} className="flex items-center gap-2">
                {i > 0 && <span className="text-gold">/</span>}
                {bc.to ? (
                  <Link to={bc.to} hash={bc.hash} className="eyebrow text-white/60 transition-colors hover:text-white">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="eyebrow text-white/80">{bc.label}</span>
                )}
              </span>
            ))}
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 30, rotateX: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE_SMOOTH }}
            className="font-display text-5xl text-white md:text-7xl lg:text-8xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-4 max-w-xl text-lg text-white/70"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
