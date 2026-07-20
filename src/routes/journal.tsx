/**
 * Journal page — /journal
 * Filterable luxury design articles, design tips, and studio news with animated reveals.
 */ import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/utils/supabase";
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

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal & Design Insights — Studio Young Designs" },
      {
        name: "description",
        content:
          "Explore the Studio Young Designs journal. Read about modular kitchen guides in Bangalore, bespoke wardrobe design, timeless interior trends, and expert turnkey execution.",
      },
      {
        name: "keywords",
        content:
          "Bangalore interior design blog, modular kitchen tips, luxury wardrobe ideas, turnkey interiors Bangalore, home styling tips",
      },
      { property: "og:url", content: "https://studioyoungdesigns.com/journal" },
    ],
    links: [{ rel: "canonical", href: "https://studioyoungdesigns.com/journal" }],
  }),
  component: JournalPage,
});

type Category = "all" | "design-tips" | "materials" | "guides";

interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  readTime: string;
  category: Category;
  image: string;
  keywords: string[];
}

const defaultPosts: JournalPost[] = [
  {
    slug: "designing-perfect-modular-kitchen-bangalore",
    title: "Designing the Perfect Modular Kitchen in Bangalore: A Complete Guide",
    excerpt:
      "From layout planning and material selection to ventilation and local climate considerations, explore our essential guide to building a luxury modular kitchen.",
    date: "June 15, 2026",
    readTime: "6 min read",
    category: "guides",
    image: svcKitchen,
    keywords: [
      "modular kitchen Bangalore",
      "kitchen design ideas",
      "luxury kitchens",
      "kitchen layouts",
    ],
    content: [
      "The modular kitchen has evolved from a functional cooking zone into the social heart of the modern Indian home. In Bangalore, where urban lifestyles demand efficiency without compromising on aesthetic sophistication, planning a kitchen requires a careful balance of ergonomics, material durability, and design flow.",
      "At Studio Young Designs, we believe the foundation of any great kitchen is layout selection. Whether you choose an L-shaped, U-shaped, Parallel, or Island configuration, the classic 'work triangle'—the path between your refrigerator, sink, and hob—must remain uncompromised. For compact urban homes, parallel or straight kitchens maximize utility, while spacious villas benefit from island counters that serve as both prep spaces and informal dining tables.",
      "Given Bangalore's climate and cooking habits, material selection is critical. Traditional plywood can fall victim to moisture, which is why we exclusively use high-density moisture-resistant (HDMR) boards and boiling waterproof (BWP) marine plywood for our kitchen carcasses. Acrylic and anti-fingerprint laminate finishes offer a sleek, high-gloss or matte visual that is easy to wipe clean, keeping the kitchen pristine year after year.",
      "Storage optimization is another cornerstone of our design philosophy. By utilizing smart hardware like pull-out tall units, tandem drawers, corner carousels, and soft-close lift-ups, we eliminate dead spaces. Every kitchen is customized to the family's cooking rituals—integrating dedicated spice drawers, built-in appliances, and ergonomic counter heights that match your physical stature for strain-free cooking.",
    ],
  },
  {
    slug: "timeless-interior-trends-walnut-stone-brass",
    title: "The Trinity of Luxury: How Walnut, Natural Stone, and Brass Elevate Spaces",
    excerpt:
      "Discover the material palette that defines timeless luxury. Learn how we combine raw organic textures with polished elements to create rich, balanced environments.",
    date: "May 28, 2026",
    readTime: "5 min read",
    category: "materials",
    image: p3,
    keywords: [
      "luxury interiors",
      "natural stone",
      "walnut wood furniture",
      "brass details in design",
    ],
    content: [
      "Trends come and go, but certain materials possess an inherent quality that transcends fashion. In our design atelier, we often return to a foundational trinity: walnut wood, natural stone, and brushed brass. When combined thoughtfully, these elements establish a sensory richness that makes any space feel instantly grounded and refined.",
      "Walnut wood provides the warmth and organic texture that every room needs. With its deep, chocolate tones and intricate, flowing grain patterns, walnut offers a sophisticated alternative to lighter woods. We utilize it in wall paneling, custom cabinetry, and bespoke dining tables to introduce depth and character.",
      "To balance the warmth of wood, we introduce natural stone. Whether it is Calacatta marble, Brazilian quartzite, or textured granite, stone brings an element of cool majesty and permanence to the interior. Each slab is a unique work of art, featuring veining patterns shaped by nature over millennia. We love bookmatching marble slabs behind fireplaces or using quartzite for waterfall kitchen islands.",
      "Finally, brushed brass serves as the jewelry of the space. In light fixtures, cabinet pulls, inlay lines in wood paneling, or delicate metal legs on furniture, brass catches light beautifully. By opting for a brushed or satin finish rather than high-polish chrome, the metal develops a gentle patina over time, radiating quiet, understated luxury.",
    ],
  },
  {
    slug: "art-of-bespoke-wardrobes-material-selection",
    title: "The Art of Bespoke Wardrobes: Material Selection and Smart Layouts",
    excerpt:
      "Your wardrobe is more than just storage; it is a personal boutique. Explore how custom walk-in closets and glass wardrobes add functional luxury to bedrooms.",
    date: "April 18, 2026",
    readTime: "4 min read",
    category: "guides",
    image: svcWardrobe,
    keywords: ["custom wardrobes", "walk-in wardrobe ideas", "bedroom design", "storage solutions"],
    content: [
      "A wardrobe is a highly personal space. Unlike standard retail furniture, a bespoke wardrobe is tailored specifically to your wardrobe collection, lifestyle, and dressing routines. It transforms organization from a daily chore into an act of self-care.",
      "The layout must always begin with an inventory. Do you have more long garments, suits, folded knits, or accessories? We design custom hanging rails at varied heights, pull-out trouser racks, slide-out jewelry trays lined with velvet, and watch-winder drawers. The goal is to ensure that everything has a visible, easily accessible home.",
      "In terms of aesthetics, glass-fronted wardrobes are making a significant statement in modern master suites. Tinted glass or fluted glass doors framed in matte black aluminum create a boutique-like display, complete with integrated LED strip lighting that triggers on motion sensor. If privacy is preferred, leather-upholstered panels, veneer sheets, or lacquered glass fronts offer a clean, solid exterior.",
      "For homes with generous square footage, the walk-in closet represents the pinnacle of luxury. We design these spaces with central vanity islands, built-in dresser units with backlit mirrors, and plush seating options, turning the wardrobe area into a private sanctuary where you can begin and end your day in comfort.",
    ],
  },
  {
    slug: "turnkey-interior-design-vs-general-contractors",
    title: "Turnkey Interior Design vs. General Contractors: Which is Right for You?",
    excerpt:
      "Navigating a home renovation can be overwhelming. We break down the differences in cost, coordination, quality, and peace of mind between turnkey solutions and contractors.",
    date: "March 10, 2026",
    readTime: "7 min read",
    category: "design-tips",
    image: svcComplete,
    keywords: [
      "turnkey interior designers Bangalore",
      "interior contractor vs designer",
      "home renovation guide",
    ],
    content: [
      "Building your dream home is an exciting milestone, but the journey to completion is notoriously complex. Homeowners are faced with a critical choice early on: hire an end-to-end turnkey interior design firm, or coordinate with a general contractor and multiple subcontractors yourself. Understanding the differences is key to managing your budget, timeline, and stress levels.",
      "The contractor model requires you to act as the project manager. You must hire the carpenter, electrician, plumber, painter, and false-ceiling specialist separately, coordinate their schedules, resolve conflicts when heights or pipe placements clash, and source all materials yourself. While this can seem cost-effective initially, hidden delays, material wastage, and lack of design oversight often lead to budget overruns and compromises in design execution.",
      "A turnkey service, like the one offered at Studio Young Designs, handles the entire lifecycle of your project. We translate initial concepts into detailed 3D renders, manufacture modular units in our state-of-the-art facility, source high-end marbles and custom furniture, manage all on-site labor, and deliver the keys to a finished home. You have a single point of contact, a pre-agreed budget, and a guaranteed timeline.",
      "Ultimately, the choice depends on your time availability and desired level of finish. If you have the expertise and hours to spare to supervise a site daily, the contractor route is viable. However, if you seek a polished, designer-level execution with premium materials, seamless detailing, and absolute peace of mind, investing in a turnkey interior firm is the ideal choice.",
    ],
  },
];

const categories: Array<{ key: Category; label: string }> = [
  { key: "all", label: "All Journal" },
  { key: "guides", label: "Guides & Manuals" },
  { key: "materials", label: "Material Studies" },
  { key: "design-tips", label: "Design Philosophy" },
];

function JournalPage() {
  const [filter, setFilter] = useState<Category>("all");
  const [selectedPost, setSelectedPost] = useState<JournalPost | null>(null);

  const { data: dbPosts = [] } = useQuery<any[]>({
    queryKey: ["journal_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .order("published_date", { ascending: false });
      if (error) throw error;
      return data || [];
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

  const parseKeywords = (p: any) => {
    if (p.tags) {
      if (Array.isArray(p.tags) && p.tags.length > 0) return p.tags;
      if (typeof p.tags === "string" && p.tags.trim()) {
        return p.tags
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }
    if (p.keywords) {
      if (Array.isArray(p.keywords) && p.keywords.length > 0) return p.keywords;
      if (typeof p.keywords === "string" && p.keywords.trim()) {
        return p.keywords
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }
    return p.category ? [p.category] : ["Design"];
  };

  const postsList: JournalPost[] =
    dbPosts.length > 0
      ? dbPosts
          .filter((p) => p.is_visible)
          .map((p) => ({
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content
              ? Array.isArray(p.content)
                ? p.content
                : p.content.split("\n\n")
              : [],
            date: format(new Date(p.published_date), "MMMM dd, yyyy"),
            readTime: p.read_time,
            category:
              p.category === "Material Studies" || p.category === "materials"
                ? "materials"
                : p.category === "Design Philosophy" ||
                    p.category === "design-tips" ||
                    p.category === "Design Theory"
                  ? "design-tips"
                  : "guides",
            image: p.image_url,
            keywords: parseKeywords(p),
          }))
      : defaultPosts;

  const filteredPosts =
    filter === "all" ? postsList : postsList.filter((p) => p.category === filter);

  // Close detail viewer on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPost(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PageWrapper>
      <PageHero
        image={layoutImages.about_img || aboutImg}
        title="Journal"
        subtitle="Insights on living gracefully. Musings on materials, space planning, and the art of design."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Journal" }]}
      />

      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Section Header & Filter */}
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Reveal3D rotateX={10}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow">
                    <TextScramble text="Design Notebook" />
                  </span>
                </div>
                <SplitHeading
                  text="Considered insights."
                  className="text-4xl text-charcoal md:text-5xl"
                />
              </Reveal3D>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setFilter(cat.key)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: EASE_SMOOTH }}
                  className={`border px-5 py-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                    filter === cat.key
                      ? "border-charcoal bg-charcoal text-cream"
                      : "border-charcoal/15 text-charcoal/60 hover:border-charcoal/40 hover:text-charcoal"
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.slug}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: EASE_SMOOTH }}
                  className="group flex flex-col cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <TiltCard className="aspect-[16/10] w-full overflow-hidden border border-charcoal/10 bg-walnut-deep/5">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
                    />
                  </TiltCard>

                  <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl text-charcoal group-hover:text-gold transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-charcoal/70 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {post.keywords && post.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="bg-charcoal/5 border border-charcoal/10 text-charcoal/70 text-[10px] px-2 py-0.5 rounded-sm font-medium tracking-wide"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-charcoal font-medium">
                    <span>Read Article</span>
                    <motion.span
                      className="inline-block"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: 4 },
                      }}
                      initial="initial"
                      whileHover="hover"
                      animate={post.slug === selectedPost?.slug ? "hover" : "initial"}
                    >
                      →
                    </motion.span>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Detailed Article Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 md:p-6"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ x: "100%", skewX: 2 }}
              animate={{ x: 0, skewX: 0 }}
              exit={{ x: "100%", skewX: 1 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="h-full w-full max-w-3xl overflow-y-auto bg-charcoal text-cream p-8 md:p-16 rounded-sm shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute right-8 top-8 text-cream/60 hover:text-white transition-colors cursor-pointer group"
                aria-label="Close article"
              >
                <span className="inline-block font-sans text-xs uppercase tracking-[0.2em] mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Close
                </span>
                <span className="text-xl">✕</span>
              </button>

              <article className="space-y-8 mt-6">
                {/* Meta details */}
                <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-cream/40">
                  <span>{selectedPost.date}</span>
                  <span>·</span>
                  <span>{selectedPost.readTime}</span>
                  <span>·</span>
                  <span className="text-gold">{selectedPost.category.replace("-", " ")}</span>
                </div>

                <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight">
                  {selectedPost.title}
                </h2>

                <div className="aspect-[16/9] w-full overflow-hidden border border-cream/15">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content body */}
                <div className="space-y-6 text-cream/80 text-base leading-relaxed font-sans font-light">
                  {selectedPost.content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {/* Keywords/Tags */}
                {selectedPost.keywords && selectedPost.keywords.length > 0 && (
                  <div className="pt-8 border-t border-cream/10">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-cream/40 uppercase tracking-widest mr-2">
                        Tags:
                      </span>
                      {selectedPost.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="bg-gold/10 border border-gold/30 px-3 py-1 rounded-sm text-xs text-gold font-medium"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
