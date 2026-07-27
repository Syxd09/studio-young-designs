/**
 * Dedicated About Us Page — /about
 * Full brand narrative, 40-year history, atelier craftsmanship, milestones, and studio ethos.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import {
  PageWrapper,
  PageHero,
  Reveal3D,
  Reveal,
  SplitHeading,
  TextScramble,
  Highlight,
  TiltCard,
  Magnetic,
  Marquee,
  EASE_SMOOTH,
  EASE_OUT_EXPO,
} from "@/components/shared-animations";

import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";
import svcLiving from "@/assets/service-living.jpg";
import svcComplete from "@/assets/service-complete.jpg";
import { VideoShowcase } from "./index";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Studio Young Designs | 40+ Years of Bespoke Craftsmanship" },
      {
        name: "description",
        content:
          "Discover the legacy of Studio Young Designs in Bangalore. Since 1981, crafting bespoke interiors, modular kitchens, custom wardrobes, and architectural spaces with timeless joinery.",
      },
      {
        name: "keywords",
        content:
          "About Studio Young Designs, luxury interior designers Bangalore, bespoke furniture atelier, 40 years interior design Bangalore, custom joinery Bangalore",
      },
      {
        property: "og:title",
        content: "About Us — Studio Young Designs | Bespoke Interiors Bangalore",
      },
      { property: "og:url", content: "https://studioyoungdesigns.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://studioyoungdesigns.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);
  const imgRef = useRef<HTMLDivElement>(null);
  const imgInView = useInView(imgRef, { once: true, margin: "-100px" });

  const { data: config = {} } = useQuery<Record<string, string>>({
    queryKey: ["site_config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_config").select("key, value");
      if (error) throw error;
      return (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    },
    staleTime: 60 * 1000,
  });

  const { data: layoutImages = {} } = useQuery<Record<string, string>>({
    queryKey: ["layout_images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("layout_images").select("key, image_url");
      if (error) throw error;
      return (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.image_url }), {});
    },
    staleTime: 60 * 1000,
  });

  const milestones = useMemo(() => {
    if (config.milestones_data) {
      try {
        const parsed = JSON.parse(config.milestones_data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) => ({
            year: m.year || "1981",
            title: m.title || m.year || "Milestone",
            desc: m.text || m.desc || "",
          }));
        }
      } catch (e) {
        console.error("Failed to parse milestones_data", e);
      }
    }
    return [
      {
        year: "1981",
        title: "Founding of Atelier",
        desc: "Established in Bangalore with a single workbench and a quiet devotion to fine teak and rosewood joinery.",
      },
      {
        year: "1998",
        title: "Residential Architecture Expansion",
        desc: "Graduated into end-to-end residential interiors, designing whole living environments for families.",
      },
      {
        year: "2010",
        title: "Modular Kitchens & Wardrobes Atelier",
        desc: "Launched precision modular manufacturing integrating concealed German hardware with handcrafted wood veneers.",
      },
      {
        year: "2018",
        title: "500+ Homes Milestone",
        desc: "Delivered over 500 bespoke residences across South India, maintaining in-house master artisan execution.",
      },
      {
        year: config.stat_years ? config.stat_years.replace(/\D/g, "") : "2024",
        title: "Four Decades of Excellence",
        desc: `${config.stat_spaces || "700+"} completed projects across Bangalore, Chennai & Hyderabad built to last generations.`,
      },
    ];
  }, [config.milestones_data, config.stat_years, config.stat_spaces]);

  const marqueeItems = useMemo(() => {
    if (config.about_marquee_items) {
      try {
        const parsed = JSON.parse(config.about_marquee_items);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        const split = config.about_marquee_items
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (split.length > 0) return split;
      }
    }
    return [
      "Handcrafted Joinery",
      "Bangalore Atelier",
      "Bespoke Walnut & Marble",
      "Since 1981",
      "Turnkey Excellence",
    ];
  }, [config.about_marquee_items]);

  const pillars = useMemo(() => {
    if (config.about_ethos_data) {
      try {
        const parsed = JSON.parse(config.about_ethos_data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, i: number) => ({
            num: item.num || `0${i + 1}`,
            title: item.title || "Craft Pillar",
            desc: item.desc || item.description || "",
          }));
        }
      } catch (e) {
        console.error("Failed to parse about_ethos_data", e);
      }
    }
    return [
      {
        num: "01",
        title: "In-House Woodcraft Atelier",
        desc: "We do not outsource execution. Every cabinet, table, drawer and wardrobe is drawn, cut, finished and assembled in our own Bangalore atelier.",
      },
      {
        num: "02",
        title: "Honest, Enduring Materials",
        desc: "Natural walnut, Quarter-sawn oak, Italian marble, brushed brass, and low-VOC lacquers selected for how beautifully they age over decades.",
      },
      {
        num: "03",
        title: "Proportion & Architectural Restraint",
        desc: "Quiet elegance over trend-chasing. We design spaces calibrated to room acoustics, natural light, and the daily rhythm of family life.",
      },
      {
        num: "04",
        title: "Single-Point Turnkey Responsibility",
        desc: "From initial layout renders to civil modification, electrical routing, custom fabrication, and final white-glove installation.",
      },
    ];
  }, [config.about_ethos_data]);

  return (
    <PageWrapper>
      {/* Hero Header */}
      <PageHero
        image={layoutImages.about_img || aboutImg}
        title="Our Legacy"
        subtitle={
          config.about_heading ||
          "A quiet devotion to material, proportion and light — carried through four decades."
        }
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About Us" }]}
      />

      {/* Main Brand Narrative Section */}
      <section ref={ref} className="relative bg-cream py-24 md:py-36 text-foreground">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10 items-center">
          {/* Left Column: Image with Mask Reveal */}
          <div className="md:col-span-5">
            <div className="sticky top-32">
              <Reveal3D delay={0.1} rotateY={-8}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow">
                    <TextScramble text="The Heritage" />
                  </span>
                </div>
              </Reveal3D>

              <div
                ref={imgRef}
                className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-xl"
              >
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={imgInView ? { scaleX: 0 } : {}}
                  transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.2 }}
                  style={{ transformOrigin: "right" }}
                  className="absolute inset-0 z-10 bg-cream"
                />
                <motion.img
                  style={{ y: imgY }}
                  src={layoutImages.about_img || aboutImg}
                  alt="Craftsman hands shaping walnut furniture"
                  loading="lazy"
                  width={1400}
                  height={1600}
                  className="h-[115%] w-full object-cover"
                />
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

          {/* Right Column: Brand Story */}
          <div className="md:col-span-7 md:pl-6 space-y-8">
            <Reveal3D rotateX={6}>
              <span className="text-xs uppercase tracking-[0.28em] text-[#cb2026] font-bold">
                The Atelier Story · Established 1981
              </span>
            </Reveal3D>

            <SplitHeading
              text="Four Decades of Mastery. An Unwavering Obsession with Space."
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal font-display leading-[1.1]"
            />

            <Reveal3D delay={0.2} rotateX={8}>
              <div className="space-y-6 text-base md:text-lg leading-relaxed text-foreground/80 font-sans">
                <p>
                  Studio Young Designs was established in Bangalore with a singular conviction: to bridge architectural restraint with the quiet soul of handcrafted wood joinery. What began as an intimate atelier has evolved into South India&apos;s premier integrated interior design studio.
                </p>
                <p>
                  We believe true luxury isn&apos;t born from excessive ornamentation, but from harmony — how natural morning light falls across quarter-sawn walnut, how a custom wardrobe glides without sound, and how an entire residence reflects the daily rhythm of the family within.
                </p>
                <p>
                  Every project is conceived and brought to life under one roof. Our architects, interior designers, master carpenters, and site engineers collaborate seamlessly, eliminating third-party friction and bringing uncompromising precision to every detail.
                </p>
                <p className="text-stone-600 dark:text-stone-400 italic font-display text-xl pt-2 border-t border-border/40">
                  &ldquo;We remain an intimate studio by choice. Staying close to the drawing, the raw material, and the family who will live there ensures every home we touch ages gracefully for generations.&rdquo;
                </p>
              </div>
            </Reveal3D>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60">
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-walnut">
                  {config.stat_years || "40+"}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mt-1">
                  {config.stat_years_label || "Years Experience"}
                </div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-walnut">
                  {config.stat_spaces || "700+"}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mt-1">
                  {config.stat_spaces_label || "Spaces Built"}
                </div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-walnut">
                  {config.stat_artisans || "35+"}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-stone-500 mt-1">
                  {config.stat_artisans_label || "Master Artisans"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Founders Section */}
      <section className="bg-charcoal text-cream py-16 md:py-24 overflow-hidden relative">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="mb-12 max-w-2xl">
            <Reveal3D rotateX={10}>
              <div className="mb-4 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow text-cream/60">
                  <TextScramble text="Leadership & Vision" className="eyebrow text-cream/60" />
                </span>
              </div>
            </Reveal3D>
            <SplitHeading
              text="The minds and hands behind four decades of design."
              className="text-3xl md:text-4xl text-cream font-display"
            />
          </div>

          <div className="space-y-12 md:space-y-16">
            {/* Founder 1: Dhanesh Samant */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* Photo on Left */}
              <div className="md:col-span-4">
                <Reveal3D rotateY={-8}>
                  <div className="relative aspect-[4/4.8] max-h-[290px] md:max-h-[330px] w-full max-w-xs mx-auto overflow-hidden rounded-tr-[2.5rem] rounded-bl-[2.5rem] border border-gold/30 shadow-xl bg-charcoal-light">
                    <img
                      src={config.founder_img_1 || "/images/founders/dhanesh-samant.webp"}
                      alt={config.founder_name_1 || "Dhanesh Samant"}
                      className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </Reveal3D>
              </div>

              {/* Bio on Right */}
              <div className="md:col-span-8 space-y-3">
                <Reveal3D rotateX={6}>
                  <h3 className="font-display text-2xl md:text-4xl tracking-wider text-cream font-bold uppercase leading-snug">
                    {config.founder_name_1 || "DHANESH SAMANT"}
                  </h3>
                  <div className="font-script text-3xl md:text-4xl text-[#cb2026] tracking-wide leading-none py-0.5 font-normal">
                    {config.founder_role_1 || "Founder"}
                  </div>
                </Reveal3D>
                <Reveal3D delay={0.2} rotateX={8}>
                  <p className="text-sm md:text-base leading-relaxed text-cream/80 font-sans font-light max-w-xl pt-1">
                    {config.founder_bio_1 ||
                      "Studio Young Designs has been a brain child of the brilliantly assiduous Dhanesh Samant, who has nurtured it for over four decades. His state of the art designs are crafted with novelty to create homes that exhibits elegant grandeur."}
                  </p>
                </Reveal3D>
              </div>
            </div>

            {/* Founder 2: Geeta Samant */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* Bio on Left */}
              <div className="md:col-span-8 md:order-1 order-2 space-y-3">
                <Reveal3D rotateX={6}>
                  <h3 className="font-display text-2xl md:text-4xl tracking-wider text-cream font-bold uppercase leading-snug">
                    {config.founder_name_2 || "GEETA SAMANT"}
                  </h3>
                  <div className="font-script text-3xl md:text-4xl text-[#cb2026] tracking-wide leading-none py-0.5 font-normal">
                    {config.founder_role_2 || "Co-Founder"}
                  </div>
                </Reveal3D>
                <Reveal3D delay={0.2} rotateX={8}>
                  <p className="text-sm md:text-base leading-relaxed text-cream/80 font-sans font-light max-w-xl pt-1">
                    {config.founder_bio_2 ||
                      "Geeta Samant who excels in her unique preciosity and redefined class and style has taken Studio Young Designs to its pinnacle of glory in the last four decades with her expertise in management and leadership skills."}
                  </p>
                </Reveal3D>
              </div>

              {/* Photo on Right */}
              <div className="md:col-span-4 md:order-2 order-1">
                <Reveal3D rotateY={8}>
                  <div className="relative aspect-[4/4.8] max-h-[290px] md:max-h-[330px] w-full max-w-xs mx-auto overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-gold/30 shadow-xl bg-charcoal-light">
                    <img
                      src={config.founder_img_2 || "/images/founders/geeta-samant.webp"}
                      alt={config.founder_name_2 || "Geeta Samant"}
                      className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </Reveal3D>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Craftsmanship Section */}
      <section className="bg-charcoal py-28 md:py-36 text-cream">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-20 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <Reveal3D rotateX={10}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow text-cream/60">
                    <TextScramble text="Our Ethos" className="eyebrow text-cream/60" />
                  </span>
                </div>
              </Reveal3D>
              <SplitHeading
                text="The four pillars behind every Studio Young interior."
                className="text-3xl md:text-5xl text-cream font-display"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {pillars.map((pillar, i) => (
              <Reveal3D key={pillar.num} delay={i * 0.1} rotateX={8}>
                <TiltCard className="h-full border border-cream/15 bg-charcoal-light/40 p-8 md:p-10 transition-all duration-500 hover:border-gold/50 group">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-display text-4xl text-gold font-light">{pillar.num}</span>
                    <span className="h-px w-12 bg-cream/20 group-hover:w-20 transition-all duration-500 group-hover:bg-gold" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-cream mb-4 group-hover:text-gold transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-cream/70 font-sans">
                    {pillar.desc}
                  </p>
                </TiltCard>
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* Atelier Studio Video Showcase Section */}
      <VideoShowcase
        config={{
          youtube_video_url: config.about_video_url || config.youtube_video_url,
          video_title: config.about_video_title || "Inside Our Atelier",
          video_subtitle:
            config.about_video_subtitle ||
            "Step inside our Bangalore manufacturing facility and experience the precision of master craftspeople working with solid timber, natural stone, and fine brass details.",
          video_poster_url: config.about_video_poster_url || layoutImages.about_img || aboutImg,
        }}
        eyebrow="Atelier In Motion"
        className="pt-24 pb-8 md:pt-32 md:pb-12"
      />

      {/* Call To Action Banner */}
      <section className="relative bg-charcoal pt-8 pb-24 text-cream overflow-hidden border-t border-cream/10">
        <div className="mx-auto max-w-[1200px] px-6 text-center md:px-10 relative z-10 space-y-8">
          <Reveal3D rotateX={10}>
            <span className="eyebrow text-gold">Visit Our Atelier</span>
          </Reveal3D>
          <SplitHeading
            text="Experience the warmth of walnut, stone and brass in person."
            className="text-3xl sm:text-4xl md:text-5xl justify-center text-cream font-display max-w-3xl mx-auto"
          />
          <p className="text-base md:text-lg text-cream/70 max-w-xl mx-auto font-sans">
            Visit our Bangalore Experience Store at Richmond Road. Walk through fully realized
            kitchen setups, wardrobe systems, and timber samples with our principal design team.
          </p>

          <div className="pt-4 flex justify-center">
            <Magnetic>
              <Link
                to="/"
                hash="contact"
                className="group relative inline-flex items-center gap-3 overflow-hidden bg-gold px-8 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-charcoal hover:bg-white transition-colors"
              >
                <span>Book Experience Visit</span>
                <span>→</span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
