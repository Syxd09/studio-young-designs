import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { Download, FileText, ArrowRight } from "lucide-react";
import { Reveal3D, SplitHeading, TextScramble, Magnetic, TiltCard } from "./shared-animations";

interface BrochureProps {
  config?: Record<string, string>;
}

export function Brochure({ config = {} }: BrochureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  const heading = config.brochure_heading || "Download Our Signature Brochure";
  const subheading =
    config.brochure_subheading ||
    "Explore our design philosophy, premium materials, and curated spatial portfolios in a single elegant document.";
  const buttonText = config.brochure_button_text || "Download Brochure";
  const pdfUrl = config.brochure_url || "#";
  const previewImg =
    config.brochure_preview_img ||
    "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80";

  const previewBadge = config.brochure_badge || "2026 EDITION";
  const previewSubtitle = config.brochure_preview_subtitle || "STUDIO YOUNG DESIGNS";
  const previewTitle = config.brochure_preview_title || "Signature Spatial Realizations";
  const previewLink = config.brochure_preview_link || "";

  const renderCardContent = () => (
    <TiltCard intensity={6}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-gold/20 bg-charcoal-light shadow-2xl group/preview">
        <img
          src={previewImg}
          alt="Studio Young Designs Signature Brochure Cover"
          className="h-full w-full object-cover brightness-90 group-hover/preview:brightness-100 group-hover/preview:scale-[1.03] transition-all duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Floating Elegant Badge */}
        <div className="absolute top-4 right-4 bg-charcoal/95 border border-gold/30 text-gold text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm font-semibold backdrop-blur-md">
          {previewBadge}
        </div>

        {/* Brochure Overlay Details */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white pointer-events-none">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
              {previewSubtitle}
            </span>
            <h4 className="font-display text-lg tracking-wide">{previewTitle}</h4>
          </div>

          {previewLink && (
            <motion.div
              className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center bg-black/40 backdrop-blur-md text-white group-hover/preview:bg-gold group-hover/preview:text-charcoal group-hover/preview:border-gold transition-colors duration-500"
              animate={inView ? { scale: [0.9, 1.05, 1] } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ArrowRight size={16} />
            </motion.div>
          )}
        </div>
      </div>
    </TiltCard>
  );

  return (
    <section
      id="brochure"
      ref={containerRef}
      className="relative bg-charcoal text-cream overflow-hidden py-28 md:py-36 border-t border-b border-gold/15"
    >
      {/* Premium subtle background glow */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-gold/5 blur-[100px]" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text & Action Column */}
          <div className="lg:col-span-6 space-y-8">
            <Reveal3D rotateX={10}>
              <div className="flex items-center gap-3">
                <span className="gold-rule" />
                <span className="eyebrow text-cream/60">
                  <TextScramble text="ATELIER CATALOGUE" className="eyebrow text-cream/60" />
                </span>
              </div>
            </Reveal3D>

            <SplitHeading
              text={heading}
              className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight text-cream leading-tight"
            />

            <Reveal3D delay={0.2} rotateX={6}>
              <p className="text-base md:text-lg leading-relaxed text-cream/70 font-sans max-w-xl">
                {subheading}
              </p>
            </Reveal3D>

            <Reveal3D delay={0.3} rotateX={6}>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {pdfUrl !== "#" ? (
                  <Magnetic>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-3 overflow-hidden bg-gold px-8 py-4.5 text-[11px] uppercase tracking-[0.28em] text-charcoal font-bold rounded-sm shadow-xl hover:shadow-gold/25 transition-all duration-300"
                    >
                      <Download size={14} className="group-hover:scale-110 transition-transform" />
                      <span>{buttonText}</span>
                    </a>
                  </Magnetic>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-3 bg-stone-700 text-stone-400 px-8 py-4.5 text-[11px] uppercase tracking-[0.28em] rounded-sm cursor-not-allowed"
                  >
                    <FileText size={14} />
                    <span>Brochure Coming Soon</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs text-cream/50 font-sans">
                  <span>PDF Format</span>
                  <span>•</span>
                  <span>Approx. 8.4 MB</span>
                </div>
              </div>
            </Reveal3D>
          </div>

          {/* Premium Brochure Preview Frame Column */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <Reveal3D delay={0.15} rotateY={-8} className="w-full max-w-lg">
              {previewLink ? (
                previewLink.startsWith("http") ? (
                  <a
                    href={previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer group/link w-full"
                  >
                    {renderCardContent()}
                  </a>
                ) : (
                  <Link to={previewLink} className="block cursor-pointer group/link w-full">
                    {renderCardContent()}
                  </Link>
                )
              ) : (
                <div className="block w-full">{renderCardContent()}</div>
              )}
            </Reveal3D>
          </div>
        </div>
      </div>
    </section>
  );
}
