import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Save,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Upload,
  Image as ImageIcon,
  Hash,
  Globe,
  Share2,
  Youtube,
  Facebook,
  Instagram,
  Trash2,
  Plus,
  BookOpen,
  Star,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/config")({
  component: ConfigComponent,
});

type TabType = "media" | "copy" | "video" | "stats" | "contact" | "social" | "brochure";

function ConfigComponent() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("media");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [heroSlides, setHeroSlides] = useState<Array<{ key: string; url: string }>>([]);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const [configRes, imagesRes] = await Promise.all([
        supabase.from("site_config").select("key, value"),
        supabase.from("layout_images").select("key, image_url"),
      ]);

      if (configRes.error) throw configRes.error;
      if (imagesRes.error) throw imagesRes.error;

      const defaults: Record<string, string> = {
        // Social links
        social_youtube: "https://www.youtube.com/channel/UCckX_6Fd6Cd7RG0eWkLyKYQ",
        social_facebook: "https://www.facebook.com/youngdesign9",
        social_pinterest: "https://pin.it/2NG2wbjJE",
        social_instagram: "https://www.instagram.com/studioyoungdesigns",
        social_whatsapp: "https://wa.me/919902599515",
        // Hero copy
        hero_title: "Interiors shaped by forty years of craft.",
        hero_subtitle:
          "For over four decades, Studio Young Designs has transformed homes and commercial spaces through timeless design, premium craftsmanship, and bespoke interiors.",
        // About copy
        about_heading: "A quiet devotion to material, proportion & light.",
        about_desc_1:
          "Studio Young Designs was founded in 1981 in Bangalore with a single conviction: that every home deserves an interior conceived and built to endure — in structure, in beauty, in daily use.",
        about_desc_2:
          "Four decades later, that founding principle remains. We design modular kitchens, custom wardrobes, living spaces and complete interiors — each one drawn, refined and handcrafted in our own atelier.",
        // Services copy
        services_heading: "Four disciplines. One studio.",
        services_subtitle: "Four disciplines. One studio. Forty years of quiet excellence.",
        // Why choose us copy
        why_heading: "Considered work, without compromise.",
        why_subtitle:
          "We are a small studio by choice. It lets us stay close to the drawing, to the wood, to the client — and to the standards we set ourselves in 1981.",
        // Stats
        stat_years: "40+",
        stat_years_label: "Years of Experience",
        stat_spaces: "700+",
        stat_spaces_label: "Projects Completed",
        stat_artisans: "35+",
        stat_artisans_label: "Master Craftsmen",
        stat_ontime: "On-Time",
        stat_ontime_label: "PROJECT\nDELIVERY",
        stat_inhouse: "In-House",
        stat_inhouse_label: "MANUFACTURING\nEXCELLENCE",
        // Contact
        contact_phone: "+91-9902599515",
        contact_email: "info@studioyoungdesigns.com",
        contact_address:
          "No.105, Parvathi Plaza, Richmond Rd, Richmond Town, Bengaluru, Karnataka 560025",
        contact_hours: "Mon–Sat · 10:30 AM – 8:00 PM",
        // Brochure
        brochure_heading: "Download Our Signature Brochure",
        brochure_subheading:
          "Explore our design philosophy, premium materials, and curated spatial portfolios in a single elegant document.",
        brochure_button_text: "Download Brochure",
        brochure_url: "",
        brochure_preview_img: "",
        brochure_badge: "2026 EDITION",
        brochure_preview_subtitle: "STUDIO YOUNG DESIGNS",
        brochure_preview_title: "Signature Spatial Realizations",
        brochure_preview_link: "",
      };

      const configMap = (configRes.data || []).reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.value,
        }),
        {},
      );

      const finalConfig = {
        ...defaults,
        ...configMap,
      };

      const imagesMap = (imagesRes.data || []).reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.image_url,
        }),
        {} as Record<string, string>,
      );

      // Extract hero slides from layout_images (hero_slide_*)
      const slideKeys = Object.keys(imagesMap)
        .filter((k) => k.startsWith("hero_slide_"))
        .sort((a, b) => {
          const numA = parseInt(a.replace("hero_slide_", ""), 10) || 0;
          const numB = parseInt(b.replace("hero_slide_", ""), 10) || 0;
          return numA - numB;
        });

      const slides: Array<{ key: string; url: string }> = slideKeys
        .map((k) => ({ key: k, url: imagesMap[k] }))
        .filter((s) => Boolean(s.url));

      // Fallback: if no slides exist but hero_bg does, use that as slide 0
      if (slides.length === 0 && imagesMap.hero_bg) {
        slides.push({ key: "hero_bg", url: imagesMap.hero_bg });
      }
      setHeroSlides(slides);

      setConfig(finalConfig);
      setImages(imagesMap);
    } catch (err: any) {
      toast.error("Failed to load layout configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase.from("site_config").upsert(updates, { onConflict: "key" });

      if (error) throw error;
      toast.success("Configurations saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save configurations");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 10MB.");
      return;
    }

    setUploadingKey(key);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${key}-${Math.random()}.${fileExt}`;
      const filePath = `layout/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("layout_images")
        .upsert({ key, image_url: publicUrl }, { onConflict: "key" });

      if (dbError) throw dbError;

      setImages((prev) => ({ ...prev, [key]: publicUrl }));
      toast.success("Image updated successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleVideoPosterUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 10MB.");
      return;
    }

    setUploadingKey(key);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${key}_${Date.now()}.${fileExt}`;
      const filePath = `video_posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("site_config")
        .upsert({ key, value: publicUrl }, { onConflict: "key" });

      if (dbError) throw dbError;

      setConfig((prev) => ({ ...prev, [key]: publicUrl }));
      toast.success("Video thumbnail uploaded from device successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload video thumbnail.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleConfigFileUpload = async (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
    fileTypeLabel: string,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 20MB.");
      return;
    }

    setUploadingKey(key);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      const fileName = `${key}_${Date.now()}.${fileExt}`;
      const filePath = `brochure/${fileName}`;

      // Enforce correct application/pdf MIME type for PDF uploads
      const contentType = fileExt === "pdf" ? "application/pdf" : file.type;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("site_config")
        .upsert({ key, value: publicUrl }, { onConflict: "key" });

      if (dbError) throw dbError;

      setConfig((prev) => ({ ...prev, [key]: publicUrl }));
      toast.success(`${fileTypeLabel} uploaded successfully!`);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || `Failed to upload ${fileTypeLabel.toLowerCase()}.`;
      if (
        errMsg.toLowerCase().includes("mime") ||
        errMsg.toLowerCase().includes("not allowed") ||
        errMsg.toLowerCase().includes("not supported")
      ) {
        errMsg = `Supabase Storage error: The "studio-young-assets" bucket settings restrict uploads of type application/pdf. Please update the bucket configuration in your Supabase Dashboard to allow PDFs, or clear MIME type restrictions.`;
      }
      toast.error(errMsg, { duration: 8000 });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleHeroSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 10MB.");
      return;
    }
    const timestamp = Date.now();
    const slideKey = `hero_slide_${timestamp}`;
    setUploadingKey(slideKey);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-slide-${timestamp}.${fileExt}`;
      const filePath = `layout/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("layout_images")
        .upsert({ key: slideKey, image_url: publicUrl }, { onConflict: "key" });
      if (dbError) throw dbError;

      setHeroSlides((prev) => [...prev, { key: slideKey, url: publicUrl }]);
      toast.success("Hero slide added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload hero slide.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDeleteHeroSlide = async (keyToDelete: string) => {
    try {
      const { error } = await supabase.from("layout_images").delete().eq("key", keyToDelete);
      if (error) throw error;

      setHeroSlides((prev) => prev.filter((s) => s.key !== keyToDelete));
      toast.success("Hero slide removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete slide.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
          <p className="font-display text-xs tracking-widest uppercase text-stone-400">
            Loading Layout Architectures
          </p>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: "media", label: "Branding & Media", icon: ImageIcon },
    { id: "copy", label: "Landing & Copy", icon: Globe },
    { id: "video", label: "YouTube Showcase Video", icon: Youtube },
    { id: "stats", label: "Stats & Numbers", icon: Hash },
    { id: "contact", label: "Contact Details", icon: Mail },
    { id: "social", label: "Social Links", icon: Share2 },
    { id: "brochure", label: "Brochure Download", icon: BookOpen },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 text-stone-850 dark:text-white font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Layout & Copywriter Config
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Configure layout imagery, branding details, landing headlines, and metrics.
          </p>
        </div>
        <button
          onClick={handleSaveTexts}
          disabled={saving}
          className="flex items-center gap-2 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save Text Changes</span>
        </button>
      </header>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-850 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#cb2026]/10 text-stone-950 dark:text-white border border-[#cb2026]/30"
                  : "text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form content with animated transitions */}
      <div className="bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSaveTexts} className="space-y-8 text-stone-900 dark:text-white">
          <AnimatePresence mode="wait">
            {/* 1. BRANDING & MEDIA */}
            {activeTab === "media" && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Hero Slideshow Images */}
                <div className="md:col-span-2 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/35 p-5 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                        Hero Slideshow Images
                      </span>
                      <p className="text-[10px] text-stone-400 dark:text-stone-550 mt-1">
                        Images rotate every 10 seconds with a crossfade. Add up to 10 slides.
                      </p>
                    </div>
                    {uploadingKey?.startsWith("hero_slide") && (
                      <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                    )}
                  </div>

                  {heroSlides.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {heroSlides.map((slide, i) => (
                        <div
                          key={slide.key}
                          className="relative group rounded overflow-hidden border border-stone-200 dark:border-stone-800"
                        >
                          <img
                            src={slide.url}
                            alt={`Hero slide ${i + 1}`}
                            className="w-full h-28 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteHeroSlide(slide.key)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {heroSlides.length < 10 && (
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#cb2026] bg-stone-100/50 dark:bg-stone-900/50 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors rounded py-4 text-xs font-semibold cursor-pointer text-stone-500 dark:text-stone-400">
                      <Plus size={16} />
                      <span>
                        Add Hero Slide {heroSlides.length > 0 ? `(${heroSlides.length}/10)` : ""}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroSlideUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. LANDING & COPY */}
            {activeTab === "copy" && (
              <motion.div
                key="copy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl text-stone-900 dark:text-white"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                      Hero Title (Headline)
                    </label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">
                      Click any word below to toggle gold highlight
                    </span>
                  </div>
                  <textarea
                    value={config.hero_title || ""}
                    onChange={(e) => handleTextChange("hero_title", e.target.value)}
                    rows={2}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-sm font-semibold"
                  />

                  {/* Interactive Word Click Highlight Picker */}
                  <div className="p-3.5 bg-stone-100/70 dark:bg-stone-900/60 rounded-lg border border-stone-200/80 dark:border-stone-800 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      Interactive Word Highlight Selector:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(config.hero_title || "Bespoke spaces, crafted over *45+ years*.")
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((w, idx, arr) => {
                          const cleanWord = w.replace(/\*/g, "");
                          const isHighlighted =
                            (w.startsWith("*") && w.endsWith("*")) ||
                            cleanWord.toLowerCase().includes("forty") ||
                            cleanWord.includes("40") ||
                            cleanWord.toLowerCase().includes("years") ||
                            cleanWord.includes("45");

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const newWords = arr.map((item, i) => {
                                  if (i === idx) {
                                    if (item.startsWith("*") && item.endsWith("*")) {
                                      return item.slice(1, -1);
                                    } else {
                                      return `*${item.replace(/\*/g, "")}*`;
                                    }
                                  }
                                  return item;
                                });
                                handleTextChange("hero_title", newWords.join(" "));
                              }}
                              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                isHighlighted
                                  ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                  : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400"
                              }`}
                            >
                              {isHighlighted && (
                                <Star size={11} className="fill-current text-white" />
                              )}
                              <span>{cleanWord}</span>
                            </button>
                          );
                        })}
                    </div>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 italic">
                      💡 Tip: Click any word above to toggle gold highlight on the homepage hero
                      title, or type asterisks manually in the box (e.g.{" "}
                      <code className="text-amber-600 dark:text-amber-400 font-mono">
                        *45+ years*
                      </code>
                      ).
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Hero Sub-Headline Description
                  </label>
                  <textarea
                    value={config.hero_subtitle || ""}
                    onChange={(e) => handleTextChange("hero_subtitle", e.target.value)}
                    rows={3}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-xs leading-relaxed"
                  />
                </div>

                <div className="h-px bg-stone-100 dark:bg-stone-850 my-6" />

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Services Section Headline
                  </label>
                  <input
                    type="text"
                    value={config.services_heading || ""}
                    onChange={(e) => handleTextChange("services_heading", e.target.value)}
                    placeholder="Four disciplines. One studio."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-sm font-semibold"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-550 italic">
                    Shown on the homepage services section and the /services listing page hero.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Services Section Subtitle
                  </label>
                  <textarea
                    value={config.services_subtitle || ""}
                    onChange={(e) => handleTextChange("services_subtitle", e.target.value)}
                    rows={2}
                    placeholder="Four disciplines. One studio. Forty years of quiet excellence."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-xs leading-relaxed"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-550 italic">
                    Full subtitle shown in the /services page hero section.
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-200/50 dark:border-stone-800/50">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Signature Services Eyebrow
                  </label>
                  <input
                    type="text"
                    value={config.services_section_eyebrow || ""}
                    onChange={(e) => handleTextChange("services_section_eyebrow", e.target.value)}
                    placeholder="OUR SIGNATURE SERVICES"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Signature Services Main Heading
                  </label>
                  <input
                    type="text"
                    value={config.services_section_heading || ""}
                    onChange={(e) => handleTextChange("services_section_heading", e.target.value)}
                    placeholder="Thoughtfully designed. Expertly crafted. Flawlessly executed."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Signature Services Description
                  </label>
                  <textarea
                    value={config.services_section_desc || ""}
                    onChange={(e) => handleTextChange("services_section_desc", e.target.value)}
                    rows={3}
                    placeholder="For over 45 years, Studio Young Designs has created bespoke interiors..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Services Brochure PDF Link
                  </label>
                  <input
                    type="text"
                    value={config.services_brochure_url || ""}
                    onChange={(e) => handleTextChange("services_brochure_url", e.target.value)}
                    placeholder="e.g. /young-designs-brochure.pdf"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-sm font-semibold"
                  />
                </div>

                <div className="h-px bg-stone-100 dark:bg-stone-850 my-6" />

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Why Choose Us Heading
                  </label>
                  <input
                    type="text"
                    value={config.why_heading || ""}
                    onChange={(e) => handleTextChange("why_heading", e.target.value)}
                    placeholder="Considered work, without compromise."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Why Choose Us Subtitle
                  </label>
                  <textarea
                    value={config.why_subtitle || ""}
                    onChange={(e) => handleTextChange("why_subtitle", e.target.value)}
                    rows={3}
                    placeholder="We are a small studio by choice..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none text-xs leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {/* 3. YOUTUBE VIDEO SHOWCASE */}
            {activeTab === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Homepage YouTube Video Showcase
                  </span>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    Manage the featured YouTube studio film shown in 16:9 cinema view on the
                    homepage.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    YouTube Video Link / URL
                  </label>
                  <input
                    type="text"
                    value={config.youtube_video_url || ""}
                    onChange={(e) => handleTextChange("youtube_video_url", e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-550 italic">
                    Paste any standard YouTube link (e.g. youtube.com/watch?v=... or youtu.be/...).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Video Section Heading Title
                  </label>
                  <input
                    type="text"
                    value={config.video_title || ""}
                    onChange={(e) => handleTextChange("video_title", e.target.value)}
                    placeholder="e.g. Our Studio in Motion"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Video Section Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={config.video_subtitle || ""}
                    onChange={(e) => handleTextChange("video_subtitle", e.target.value)}
                    placeholder="e.g. Step inside our Bangalore atelier..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                  />
                </div>

                {/* Video Cover / Thumbnail Image Upload */}
                <div className="space-y-3 p-4 border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-900/60 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold block">
                      Video Cover / Thumbnail Image
                    </label>
                    <span className="text-[10px] text-stone-400">
                      Upload from device or paste URL
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={config.video_poster_url || ""}
                      onChange={(e) => handleTextChange("video_poster_url", e.target.value)}
                      placeholder="Image URL or upload from device..."
                      className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-stone-900 dark:text-white outline-none focus:border-[#cb2026] text-xs font-semibold"
                    />
                    <label className="bg-[#cb2026] hover:bg-[#df383e] text-white px-4 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
                      {uploadingKey === "video_poster_url" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleVideoPosterUpload("video_poster_url", e)}
                      />
                    </label>
                  </div>

                  {config.video_poster_url && (
                    <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 mt-2">
                      <img
                        src={config.video_poster_url}
                        alt="Video Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        Current Video Cover Preview
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-stone-100 dark:bg-stone-850 my-6" />

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    YouTube Channel & Handle Settings
                  </span>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    Details shown in the channel subscription banner below the featured video.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Channel Name
                    </label>
                    <input
                      type="text"
                      value={config.youtube_channel_name || "Studio Young Designs"}
                      onChange={(e) => handleTextChange("youtube_channel_name", e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Channel Handle
                    </label>
                    <input
                      type="text"
                      value={config.youtube_channel_handle || "@studioyoungdesigns2118"}
                      onChange={(e) => handleTextChange("youtube_channel_handle", e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    YouTube Channel Direct Link
                  </label>
                  <input
                    type="text"
                    value={
                      config.youtube_channel_url ||
                      "https://www.youtube.com/@studioyoungdesigns2118"
                    }
                    onChange={(e) => handleTextChange("youtube_channel_url", e.target.value)}
                    placeholder="https://www.youtube.com/@studioyoungdesigns2118"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs"
                  />
                </div>
              </motion.div>
            )}

            {/* 3. STATISTICS & NUMBERS */}
            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl text-stone-900 dark:text-white"
              >
                {/* Years Experience */}
                <div className="border border-stone-200 dark:border-stone-850 p-4 rounded bg-stone-50 dark:bg-stone-900/35 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Experience Count
                  </label>
                  <input
                    type="text"
                    value={config.stat_years || ""}
                    onChange={(e) => handleTextChange("stat_years", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.stat_years_label || ""}
                    onChange={(e) => handleTextChange("stat_years_label", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-500 dark:text-stone-400 focus:border-[#cb2026] outline-none text-[10px]"
                    placeholder="Label text"
                  />
                </div>

                {/* Spaces Delivered */}
                <div className="border border-stone-200 dark:border-stone-850 p-4 rounded bg-stone-50 dark:bg-stone-900/35 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Spaces Delivered
                  </label>
                  <input
                    type="text"
                    value={config.stat_spaces || ""}
                    onChange={(e) => handleTextChange("stat_spaces", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.stat_spaces_label || ""}
                    onChange={(e) => handleTextChange("stat_spaces_label", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-500 dark:text-stone-400 focus:border-[#cb2026] outline-none text-[10px]"
                    placeholder="Label text"
                  />
                </div>

                {/* Master Artisans */}
                <div className="border border-stone-200 dark:border-stone-850 p-4 rounded bg-stone-50 dark:bg-stone-900/35 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Master Artisans
                  </label>
                  <input
                    type="text"
                    value={config.stat_artisans || ""}
                    onChange={(e) => handleTextChange("stat_artisans", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.stat_artisans_label || ""}
                    onChange={(e) => handleTextChange("stat_artisans_label", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-500 dark:text-stone-400 focus:border-[#cb2026] outline-none text-[10px]"
                    placeholder="Label text"
                  />
                </div>

                {/* Quality Standard */}
                <div className="border border-stone-200 dark:border-stone-850 p-4 rounded bg-stone-50 dark:bg-stone-900/35 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Material Standard
                  </label>
                  <input
                    type="text"
                    value={config.stat_quality || "Premium"}
                    onChange={(e) => handleTextChange("stat_quality", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.stat_quality_label || "Quality Materials"}
                    onChange={(e) => handleTextChange("stat_quality_label", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-500 dark:text-stone-400 focus:border-[#cb2026] outline-none text-[10px]"
                    placeholder="Label text"
                  />
                </div>

                {/* Project Delivery Highlight */}
                <div className="border border-stone-200 dark:border-stone-850 p-4 rounded bg-stone-50 dark:bg-stone-900/35 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Project Delivery Highlight
                  </label>
                  <input
                    type="text"
                    value={config.stat_ontime || ""}
                    onChange={(e) => handleTextChange("stat_ontime", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.stat_ontime_label || ""}
                    onChange={(e) => handleTextChange("stat_ontime_label", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-500 dark:text-stone-400 focus:border-[#cb2026] outline-none text-[10px]"
                    placeholder="Label text"
                  />
                </div>

                {/* Manufacturing Highlight */}
                <div className="border border-stone-200 dark:border-stone-850 p-4 rounded bg-stone-50 dark:bg-stone-900/35 space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Manufacturing Highlight
                  </label>
                  <input
                    type="text"
                    value={config.stat_inhouse || ""}
                    onChange={(e) => handleTextChange("stat_inhouse", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.stat_inhouse_label || ""}
                    onChange={(e) => handleTextChange("stat_inhouse_label", e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-stone-500 dark:text-stone-400 focus:border-[#cb2026] outline-none text-[10px]"
                    placeholder="Label text"
                  />
                </div>
              </motion.div>
            )}

            {/* 4. CONTACT DETAILS */}
            {activeTab === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl text-stone-900 dark:text-white"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Mail size={12} />
                    <span>Direct Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={config.contact_email || ""}
                    onChange={(e) => handleTextChange("contact_email", e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Phone size={12} />
                    <span>Direct Contact Number</span>
                  </label>
                  <input
                    type="text"
                    value={config.contact_phone || ""}
                    onChange={(e) => handleTextChange("contact_phone", e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span>Studio Address Location</span>
                  </label>
                  <input
                    type="text"
                    value={config.contact_address || ""}
                    onChange={(e) => handleTextChange("contact_address", e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Studio Business Hours</span>
                  </label>
                  <input
                    type="text"
                    value={config.contact_hours || ""}
                    onChange={(e) => handleTextChange("contact_hours", e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl text-stone-900 dark:text-white"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Youtube size={12} />
                    <span>YouTube Channel Link</span>
                  </label>
                  <input
                    type="url"
                    value={config.social_youtube || ""}
                    onChange={(e) => handleTextChange("social_youtube", e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Facebook size={12} />
                    <span>Facebook Profile Link</span>
                  </label>
                  <input
                    type="url"
                    value={config.social_facebook || ""}
                    onChange={(e) => handleTextChange("social_facebook", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Share2 size={12} />
                    <span>Pinterest Board Link</span>
                  </label>
                  <input
                    type="url"
                    value={config.social_pinterest || ""}
                    onChange={(e) => handleTextChange("social_pinterest", e.target.value)}
                    placeholder="https://pinterest.com/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Instagram size={12} />
                    <span>Instagram Profile Link</span>
                  </label>
                  <input
                    type="url"
                    value={config.social_instagram || ""}
                    onChange={(e) => handleTextChange("social_instagram", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold flex items-center gap-1.5">
                    <Share2 size={12} />
                    <span>WhatsApp Click-to-Chat Link</span>
                  </label>
                  <input
                    type="url"
                    value={config.social_whatsapp || ""}
                    onChange={(e) => handleTextChange("social_whatsapp", e.target.value)}
                    placeholder="https://wa.me/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                  />
                </div>
              </motion.div>
            )}

            {/* 7. BROCHURE DOWNLOAD */}
            {activeTab === "brochure" && (
              <motion.div
                key="brochure"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl text-stone-900 dark:text-white"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Signature Brochure Configurations
                  </span>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    Manage the download link, titles, description and cover image for your brand
                    brochure.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    Section Heading / Title
                  </label>
                  <input
                    type="text"
                    value={config.brochure_heading || ""}
                    onChange={(e) => handleTextChange("brochure_heading", e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    Section Description / Sub-heading
                  </label>
                  <textarea
                    value={config.brochure_subheading || ""}
                    onChange={(e) => handleTextChange("brochure_subheading", e.target.value)}
                    rows={3}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs leading-relaxed focus:border-[#cb2026] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    Download Button Text
                  </label>
                  <input
                    type="text"
                    value={config.brochure_button_text || ""}
                    onChange={(e) => handleTextChange("brochure_button_text", e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Cover Badge / Year
                    </label>
                    <input
                      type="text"
                      value={config.brochure_badge || "2026 EDITION"}
                      onChange={(e) => handleTextChange("brochure_badge", e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Cover Subtitle / Brand
                    </label>
                    <input
                      type="text"
                      value={config.brochure_preview_subtitle || "STUDIO YOUNG DESIGNS"}
                      onChange={(e) =>
                        handleTextChange("brochure_preview_subtitle", e.target.value)
                      }
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Cover Title / Collection
                    </label>
                    <input
                      type="text"
                      value={config.brochure_preview_title || "Signature Spatial Realizations"}
                      onChange={(e) => handleTextChange("brochure_preview_title", e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    Cover Card Link Redirect (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.brochure_preview_link || ""}
                    onChange={(e) => handleTextChange("brochure_preview_link", e.target.value)}
                    placeholder="e.g. /portfolio or https://example.com (Leave blank to remove arrow/click redirection)"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white text-xs focus:border-[#cb2026] outline-none"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 italic">
                    💡 Note: Leaving this link empty will automatically remove the arrow icon and
                    click redirection from the cover image.
                  </p>
                </div>

                <div className="h-px bg-stone-100 dark:bg-stone-850 my-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* PDF Document Upload */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold block">
                      Brochure PDF Document
                    </label>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">
                      Upload the catalog PDF file directly to secure storage (max 20MB).
                    </p>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-[#cb2026] hover:bg-stone-50 dark:hover:bg-stone-800 px-4 py-2.5 rounded text-xs font-semibold cursor-pointer text-stone-600 dark:text-stone-300 transition-colors shadow-sm">
                        {uploadingKey === "brochure_url" ? (
                          <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                        ) : (
                          <Upload size={14} />
                        )}
                        <span>Upload PDF</span>
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleConfigFileUpload("brochure_url", e, "PDF Brochure")
                          }
                          disabled={uploadingKey !== null}
                        />
                      </label>
                    </div>

                    {config.brochure_url ? (
                      <div className="p-3.5 bg-stone-50 dark:bg-stone-900/60 rounded border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 max-w-sm">
                        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-350 min-w-0">
                          <FileText size={16} className="text-[#cb2026] flex-shrink-0" />
                          <a
                            href={config.brochure_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold hover:text-[#cb2026] hover:underline truncate"
                          >
                            Download Uploaded Brochure
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTextChange("brochure_url", "")}
                          className="text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0"
                          title="Remove PDF"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-medium">
                        ⚠️ No PDF document uploaded yet. The homepage download button will stay
                        disabled until a PDF is uploaded.
                      </p>
                    )}
                  </div>

                  {/* Brochure Preview Cover Image */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold block">
                      Brochure Cover / Preview Image
                    </label>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">
                      Upload a preview image to display alongside the brochure download section (max
                      10MB).
                    </p>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-[#cb2026] hover:bg-stone-50 dark:hover:bg-stone-800 px-4 py-2.5 rounded text-xs font-semibold cursor-pointer text-stone-600 dark:text-stone-300 transition-colors shadow-sm">
                        {uploadingKey === "brochure_preview_img" ? (
                          <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                        ) : (
                          <Upload size={14} />
                        )}
                        <span>Upload Cover Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleConfigFileUpload(
                              "brochure_preview_img",
                              e,
                              "Brochure Cover Image",
                            )
                          }
                          disabled={uploadingKey !== null}
                        />
                      </label>
                    </div>

                    {config.brochure_preview_img && (
                      <div className="relative aspect-[4/3] max-w-sm rounded border border-stone-200 dark:border-stone-800 bg-stone-900 mt-2 overflow-hidden group/cover">
                        <img
                          src={config.brochure_preview_img}
                          alt="Brochure Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/50 transition-colors flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleTextChange("brochure_preview_img", "")}
                            className="opacity-0 group-hover/cover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
