import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import {
  PageWrapper,
  PageHero,
  Reveal3D,
  SplitHeading,
  TextScramble,
  Magnetic,
} from "@/components/shared-animations";

import heroImg from "@/assets/hero.jpg";
import { Download } from "lucide-react";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";
import svcLiving from "@/assets/service-living.jpg";
import svcComplete from "@/assets/service-complete.jpg";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Interior Design & Joinery Services in Bangalore | Studio Young Designs" },
      {
        name: "description",
        content:
          "Explore bespoke interior design services in Bangalore: Modular Kitchens, Custom Walk-in Wardrobes, Living Room Interiors, and Turnkey Home Execution since 1981.",
      },
      {
        name: "keywords",
        content:
          "interior design services Bangalore, modular kitchen services Bangalore, custom wardrobes Bangalore, turnkey home interiors Bangalore, bespoke carpentry Bangalore",
      },
      {
        property: "og:title",
        content: "Interior Design & Joinery Services in Bangalore | Studio Young Designs",
      },
      {
        property: "og:description",
        content:
          "Explore bespoke interior design services in Bangalore: Modular Kitchens, Custom Walk-in Wardrobes, Living Room Interiors, and Turnkey Home Execution.",
      },
      { property: "og:image", content: "https://www.studioyoungdesigns.com/og.jpg" },
      { property: "og:url", content: "https://www.studioyoungdesigns.com/services" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.studioyoungdesigns.com/services" }],
  }),
  component: ServicesPage,
});

interface SignatureService {
  num: string;
  title: string;
  description: string;
  href: string;
}

const signatureServices: SignatureService[] = [
  {
    num: "01",
    title: "Premium Modular Kitchens",
    description: "Precision-engineered kitchens tailored for modern luxury.",
    href: "/services/kitchens",
  },
  {
    num: "02",
    title: "Luxury Wardrobes & Walk-in Closets",
    description: "Bespoke storage solutions designed around your lifestyle.",
    href: "/services/wardrobes",
  },
  {
    num: "03",
    title: "Luxury Home Interiors",
    description: "Complete interior design and turnkey execution for exceptional homes.",
    href: "/services/interiors",
  },
  {
    num: "04",
    title: "Living Room Interiors",
    description: "Sophisticated spaces crafted for comfort and entertaining.",
    href: "/services/living-spaces",
  },
  {
    num: "05",
    title: "Bedroom Interiors",
    description: "Elegant private spaces designed for everyday luxury.",
    href: "/services/living-spaces",
  },
  {
    num: "06",
    title: "Genuine Leather Furniture",
    description: "Handcrafted leather sofas and furniture, made to last for generations.",
    href: "/services/interiors",
  },
  {
    num: "07",
    title: "Custom Furniture",
    description: "Made-to-order furniture designed exclusively for your home.",
    href: "/services/interiors",
  },
  {
    num: "08",
    title: "Dining & Bar Spaces",
    description: "Refined spaces for memorable gatherings.",
    href: "/services/living-spaces",
  },
  {
    num: "09",
    title: "TV & Entertainment Units",
    description: "Contemporary media walls with seamless functionality.",
    href: "/services/living-spaces",
  },
  {
    num: "10",
    title: "Turnkey Interior Solutions",
    description: "From concept to completion, managed under one roof.",
    href: "/services/interiors",
  },
];

function ServicesPage() {
  const { data: dbServices = [] } = useQuery<any[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
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

  const { data: siteConfig = {} } = useQuery<Record<string, string>>({
    queryKey: ["site_config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_config").select("key, value");
      if (error) throw error;
      return (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    },
    staleTime: 0,
  });

  const servicesList: SignatureService[] =
    dbServices.length > 0
      ? dbServices
          .filter((s) => s.is_visible !== false)
          .map((s, idx) => ({
            num: String(idx + 1).padStart(2, "0"),
            title: s.title,
            description: s.short_desc || s.description || "",
            href: s.slug
              ? s.slug.startsWith("/")
                ? s.slug
                : `/services/${s.slug}`
              : "/services/interiors",
          }))
      : signatureServices;

  const servicesSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.studioyoungdesigns.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://www.studioyoungdesigns.com/services",
          },
        ],
      },
      {
        "@type": "OfferCatalog",
        "@id": "https://www.studioyoungdesigns.com/services/#catalog",
        name: "Studio Young Designs Interior & Joinery Catalog",
        url: "https://www.studioyoungdesigns.com/services",
      },
    ],
  };

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <PageHero
        image={
          layoutImages.services_hero_bg ||
          layoutImages.services_img ||
          layoutImages.hero_bg ||
          heroImg
        }
        title={siteConfig.services_title || "From Concept to Completion. Seamlessly Managed."}
        subtitle={
          siteConfig.services_subtitle ||
          "Thoughtfully designed. Expertly crafted. Flawlessly executed."
        }
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
      />

      {/* Signature Services Numbered List */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-16 grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <Reveal3D rotateX={10}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="gold-rule" />
                  <span className="eyebrow">
                    <TextScramble
                      text={siteConfig.services_section_eyebrow || "OUR SIGNATURE SERVICES"}
                    />
                  </span>
                </div>
              </Reveal3D>
              <SplitHeading
                text={
                  siteConfig.services_section_heading ||
                  "Thoughtfully designed. Expertly crafted. Flawlessly executed."
                }
                className="text-4xl md:text-6xl"
              />
            </div>
            <Reveal3D delay={0.2} rotateX={6} className="md:col-span-5 md:col-start-8">
              <p className="text-base leading-relaxed text-foreground/70">
                {siteConfig.services_section_desc ||
                  "For over 45 years, Studio Young Designs has created bespoke interiors that combine timeless design, meticulous craftsmanship, and flawless execution. From a single handcrafted kitchen to complete luxury residences, every project is designed, manufactured, and delivered with uncompromising attention to detail."}
              </p>
            </Reveal3D>
          </div>

          {/* Clean luxury numbered list */}
          <div className="mt-16 space-y-0 border-t border-border/40">
            {servicesList.map((item, idx) => (
              <Reveal3D key={item.num} delay={idx * 0.04} rotateX={4}>
                <Link
                  to={item.href}
                  className="group relative flex flex-col gap-4 border-b border-border/40 py-8 px-4 transition-all duration-300 hover:bg-white/80 md:flex-row md:items-center md:justify-between md:py-10 md:px-8"
                >
                  <div className="flex items-baseline gap-6 md:gap-10 md:w-1/2">
                    <span className="font-display text-2xl font-light text-gold md:text-3xl">
                      {item.num}
                    </span>
                    <h3 className="font-display text-2xl text-charcoal group-hover:text-gold transition-colors duration-300 md:text-3xl lg:text-4xl">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between gap-6 md:w-1/2 md:justify-end">
                    <p className="max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
                      {item.description}
                    </p>
                    <span className="text-xl text-gold/60 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-gold md:text-2xl">
                      →
                    </span>
                  </div>
                </Link>
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Visual Gallery Showcase */}
      <section className="bg-cream pb-24 md:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-12">
            <Reveal3D rotateX={10}>
              <div className="mb-4 flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow">
                  <TextScramble text="DISCIPLINE SHOWCASE" />
                </span>
              </div>
              <SplitHeading text="A Legacy of Craftsmanship" className="text-3xl md:text-5xl" />
            </Reveal3D>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                slug: "kitchens",
                defaultImg: svcKitchen,
                defaultTitle: "Modular Kitchens",
                defaultSub: "Walnut & Marble Craftsmanship",
                link: "/services/kitchens",
              },
              {
                slug: "wardrobes",
                defaultImg: svcWardrobe,
                defaultTitle: "Bespoke Wardrobes",
                defaultSub: "Glass & Leather Walk-In Closets",
                link: "/services/wardrobes",
              },
              {
                slug: "living-spaces",
                defaultImg: svcLiving,
                defaultTitle: "Living Spaces",
                defaultSub: "Acoustic-calibrated Lounges",
                link: "/services/living-spaces",
              },
              {
                slug: "interiors",
                defaultImg: svcComplete,
                defaultTitle: "Turnkey Interiors",
                defaultSub: "Complete Residential Masterpieces",
                link: "/services/interiors",
              },
            ]
              .map((def) => {
                const dbSvc = dbServices.find(
                  (s) =>
                    s.slug === def.slug ||
                    s.slug === `/${def.slug}` ||
                    s.slug === `/services/${def.slug}`,
                );
                return {
                  img: dbSvc?.image_url || def.defaultImg,
                  title: dbSvc?.title || def.defaultTitle,
                  subtitle: dbSvc?.short_desc || def.defaultSub,
                  link: def.link,
                };
              })
              .map((item, idx) => (
                <Reveal3D key={item.title} delay={idx * 0.06} rotateX={6}>
                  <Link
                    to={item.link}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-charcoal shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end">
                      <span className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2">
                        0{idx + 1}
                      </span>
                      <h4 className="font-display text-xl text-white md:text-2xl font-normal leading-tight group-hover:text-gold transition-colors duration-300">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/60 max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-2">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                </Reveal3D>
              ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="bg-charcoal py-24 text-cream md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
          <Reveal3D rotateX={12}>
            <SplitHeading
              text="Let's design something that lasts."
              className="mx-auto max-w-3xl text-4xl text-cream md:text-6xl"
            />
            <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-cream/70">
              Every project begins with a conversation. Tell us about your space, and we'll take it
              from there.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Magnetic>
                <Link
                  to="/"
                  hash="contact"
                  className="group relative inline-flex items-center gap-3 overflow-hidden bg-white px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-charcoal w-full sm:w-auto justify-center"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <span className="relative">Book a Consultation</span>
                  <span className="relative transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href={siteConfig.services_brochure_url || "/young-designs-brochure.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 overflow-hidden border border-cream/25 hover:border-gold px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-cream w-full sm:w-auto justify-center transition-colors duration-300"
                >
                  <Download
                    size={14}
                    className="text-gold group-hover:scale-110 transition-transform duration-300"
                  />
                  <span>Download Brochure</span>
                </a>
              </Magnetic>
            </div>
          </Reveal3D>
        </div>
      </section>
    </PageWrapper>
  );
}
