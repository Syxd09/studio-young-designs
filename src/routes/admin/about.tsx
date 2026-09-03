/**
 * Admin Dedicated About Page Manager — /admin/about
 * Manage About page imagery, story text, marquee ticker items, ethos pillars, and milestones timeline.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Save,
  Loader2,
  Upload,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  Type,
  FileText,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { optimizeImageBeforeUpload } from "@/utils/image-optimizer";

export const Route = createFileRoute("/admin/about")({
  component: AdminAboutComponent,
});

interface EthosPillar {
  num: string;
  title: string;
  desc: string;
}

interface MilestoneItem {
  year: string;
  title: string;
  text: string;
}

function AdminAboutComponent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [config, setConfig] = useState<Record<string, string>>({});
  const [aboutImage, setAboutImage] = useState<string>("");
  const [heritageImage, setHeritageImage] = useState<string>("");
  const [heroImage, setHeroImage] = useState<string>("");

  const [ethosPillars, setEthosPillars] = useState<EthosPillar[]>([
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
  ]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      year: "1981",
      title: "Founding of Atelier",
      text: "Established in Bangalore with a single workbench and a quiet devotion to fine teak and rosewood joinery.",
    },
    {
      year: "1998",
      title: "Residential Architecture Expansion",
      text: "Graduated into end-to-end residential interiors, designing whole living environments for families.",
    },
    {
      year: "2010",
      title: "Modular Kitchens & Wardrobes Atelier",
      text: "Launched precision modular manufacturing integrating concealed German hardware with handcrafted wood veneers.",
    },
    {
      year: "2018",
      title: "500+ Homes Milestone",
      text: "Delivered over 500 bespoke residences across South India, maintaining in-house master artisan execution.",
    },
    {
      year: "2024",
      title: "Four Decades of Excellence",
      text: "700+ completed projects across Bangalore, Chennai & Hyderabad built to last generations.",
    },
  ]);

  const [activeTab, setActiveTab] = useState<
    "story" | "video" | "founders" | "ethos" | "milestones"
  >("story");

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const [configRes, imagesRes] = await Promise.all([
        supabase.from("site_config").select("key, value"),
        supabase.from("layout_images").select("key, image_url"),
      ]);

      if (configRes.error) throw configRes.error;
      if (imagesRes.error) throw imagesRes.error;

      const configMap = (configRes.data || []).reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.value,
        }),
        {} as Record<string, string>,
      );

      const defaults: Record<string, string> = {
        about_heading:
          "A quiet devotion to material, proportion and light — carried through four decades.",
        about_homepage_heading: "Crafted with Purpose. Built to Endure.",
        about_homepage_desc_1:
          "For more than 45 years, Studio Young Designs has been shaping extraordinary homes through timeless design, precision engineering, and master craftsmanship. Every detail is thoughtfully considered, every material carefully selected, and every project executed with uncompromising standards.",
        about_homepage_desc_2:
          "Our integrated design, manufacturing, and execution model allows us to deliver bespoke interiors with exceptional quality and complete accountability. From luxury kitchens and custom wardrobes to handcrafted furniture and complete home interiors, we create spaces that embody elegance, functionality, and enduring value.",
        about_heritage_title: "Crafted with Purpose. Perfected Through Experience.",
        about_heritage_p1:
          "For over 45 years, Studio Young Designs has been creating bespoke interiors that combine timeless design, exceptional craftsmanship, and uncompromising quality. Since 1981, we have transformed residences into refined living spaces where every detail is thoughtfully designed, micticulously crafted, and built to stand the test of time.",
        about_heritage_p2:
          "Our strength lies in complete in-house execution. From premium modular kitchens, custom wardrobes, and handcrafted furniture to full-home interiors, every project is managed by our own team of designers, master craftsmen, and installation specialists. This integrated approach ensures complete quality control, seamless coordination, and precision at every stage of the journey.",
        about_heritage_p3:
          "At Studio Young Designs, we believe true luxury is measured not by extravagance, but by flawless execution, enduring materials, and spaces that enrich everyday living. Every home we create reflects our commitment to craftsmanship, innovation, and trust—delivering timeless interiors that families will cherish for generations.",
        about_quote:
          "We remain a small studio by choice. It lets us stay close to the drawing, to the wood, to the client...",
        about_ethos_eyebrow: "Our Ethos",
        about_ethos_heading: "The four pillars behind every Studio Young interior.",
      };

      const finalConfig = {
        ...defaults,
        ...configMap,
      };

      setConfig(finalConfig);

      const imagesMap = (imagesRes.data || []).reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.image_url,
        }),
        {} as Record<string, string>,
      );

      if (imagesMap.about_img) {
        setAboutImage(imagesMap.about_img);
      }
      if (imagesMap.about_heritage_img) {
        setHeritageImage(imagesMap.about_heritage_img);
      }
      if (imagesMap.about_hero_bg) {
        setHeroImage(imagesMap.about_hero_bg);
      }

      // Parse Ethos Pillars
      if (configMap.about_ethos_data) {
        try {
          const parsed = JSON.parse(configMap.about_ethos_data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEthosPillars(parsed);
          }
        } catch (e) {
          console.error("Failed to parse about_ethos_data", e);
        }
      }

      // Parse Milestones
      if (configMap.milestones_data) {
        try {
          const parsed = JSON.parse(configMap.milestones_data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMilestones(parsed);
          }
        } catch (e) {
          console.error("Failed to parse milestones_data", e);
        }
      }
    } catch (err: any) {
      toast.error("Failed to load About page configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (
    key: "about_img" | "about_heritage_img" | "about_hero_bg",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const rawFile = e.target.files[0];
    if (rawFile.size > 15 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 15MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const file = await optimizeImageBeforeUpload(rawFile);
      const fileExt = file.name.split(".").pop();
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `layout/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, { contentType: file.type, cacheControl: "31536000", upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("layout_images")
        .upsert({ key, image_url: publicUrl }, { onConflict: "key" });

      if (dbError) throw dbError;

      if (key === "about_img") {
        setAboutImage(publicUrl);
      } else if (key === "about_heritage_img") {
        setHeritageImage(publicUrl);
      } else {
        setHeroImage(publicUrl);
      }
      toast.success(
        `${
          key === "about_img"
            ? "Homepage About"
            : key === "about_heritage_img"
              ? "Heritage"
              : "Hero Banner"
        } image updated!`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const [uploadingVideoKey, setUploadingVideoKey] = useState<string | null>(null);

  const handleVideoPosterUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const rawFile = e.target.files[0];

    if (rawFile.size > 15 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 15MB.");
      return;
    }

    setUploadingVideoKey(key);
    try {
      const file = await optimizeImageBeforeUpload(rawFile);
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${key}_${Date.now()}.${fileExt}`;
      const filePath = `video_posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: "31536000",
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
      setUploadingVideoKey(null);
    }
  };

  const handleFounderImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "founder_img_1" | "founder_img_2",
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const rawFile = e.target.files[0];
    if (rawFile.size > 15 * 1024 * 1024) {
      toast.error("File size limit is 15MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const file = await optimizeImageBeforeUpload(rawFile, 1200, 1200, 0.85);
      const fileExt = file.name.split(".").pop();
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `founders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, { contentType: file.type, cacheControl: "31536000", upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

      handleConfigChange(key, publicUrl);
      toast.success("Founder photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload founder image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const mergedConfig = {
        ...config,
        about_ethos_data: JSON.stringify(ethosPillars),
        milestones_data: JSON.stringify(milestones),
      };

      const updates = Object.entries(mergedConfig).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase.from("site_config").upsert(updates, { onConflict: "key" });

      if (error) throw error;
      toast.success("About page configuration saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save configurations");
    } finally {
      setSaving(false);
    }
  };

  // Ethos handlers
  const handleAddEthos = () => {
    const nextNum = `0${ethosPillars.length + 1}`;
    setEthosPillars((prev) => [
      ...prev,
      { num: nextNum, title: "New Ethos Pillar", desc: "Pillar description..." },
    ]);
  };

  const handleUpdateEthos = (index: number, field: keyof EthosPillar, val: string) => {
    setEthosPillars((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDeleteEthos = (index: number) => {
    setEthosPillars((prev) => prev.filter((_, i) => i !== index));
  };

  // Milestone handlers
  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { year: "2024", title: "New Milestone", text: "Milestone detail description..." },
    ]);
  };

  const handleUpdateMilestone = (index: number, field: keyof MilestoneItem, val: string) => {
    setMilestones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDeleteMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
          <p className="font-display text-xs tracking-widest uppercase text-stone-400">
            Loading About Architecture
          </p>
        </div>
      </div>
    );
  }

  const sections: Array<{
    id: "story" | "video" | "founders" | "ethos" | "milestones";
    label: string;
    icon: any;
  }> = [
    { id: "story", label: "Story & Copy", icon: FileText },
    { id: "video", label: "Atelier Video Showcase", icon: Video },
    { id: "founders", label: "Founders & Leadership", icon: Users },
    { id: "ethos", label: "Our Ethos (Pillars)", icon: Layers },
    { id: "milestones", label: "Milestones Timeline", icon: Clock },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 text-stone-850 dark:text-white font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="text-[#cb2026]" size={22} />
            <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
              About Page Manager
            </h1>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Manage your brand story, banner image, marquee text, ethos pillars, and historical
            milestones.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save About Configuration</span>
        </button>
      </header>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-850 pb-2">
        {sections.map((tab) => {
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

      {/* Form Area */}
      <div className="bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSaveAll} className="space-y-8">
          <AnimatePresence mode="wait">
            {/* 1. STORY & COPY */}
            {activeTab === "story" && (
              <motion.div
                key="story"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl"
              >
                {/* SECTION 1: ABOUT US PAGE HERO BANNER */}
                <div className="space-y-4 pb-6 border-b border-stone-250 dark:border-stone-800">
                  <h3 className="text-xs font-bold text-[#cb2026] uppercase tracking-wider">
                    About Us Page Hero Banner
                  </h3>

                  {/* Hero Subtitle */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Hero Subtitle / Description
                    </label>
                    <input
                      type="text"
                      value={config.about_heading || ""}
                      onChange={(e) => handleConfigChange("about_heading", e.target.value)}
                      placeholder="A quiet devotion to material, proportion and light — carried through four decades."
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                    />
                  </div>

                  {/* Hero Banner Image */}
                  <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/35 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
                        Hero Banner Image
                      </span>
                      {uploadingImage && (
                        <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                      )}
                    </div>
                    {heroImage && (
                      <div className="relative rounded overflow-hidden h-48 w-full border border-stone-200 dark:border-stone-800">
                        <img
                          src={heroImage}
                          alt="About page hero banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#cb2026] bg-white dark:bg-stone-900 transition-colors rounded py-3 text-xs font-semibold cursor-pointer text-stone-700 dark:text-stone-300">
                      <Upload size={14} />
                      <span>Upload New Hero Banner Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("about_hero_bg", e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* SECTION 2: HOMEPAGE ABOUT BLOCK */}
                <div className="space-y-4 pb-6 border-b border-stone-250 dark:border-stone-800">
                  <h3 className="text-xs font-bold text-[#cb2026] uppercase tracking-wider">
                    Homepage About Us Section
                  </h3>

                  {/* Homepage Headline */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Homepage Main Headline
                    </label>
                    <input
                      type="text"
                      value={config.about_homepage_heading || ""}
                      onChange={(e) => handleConfigChange("about_homepage_heading", e.target.value)}
                      placeholder="Four decades. One quiet obsession — space that lasts."
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                    />
                  </div>

                  {/* Homepage Description 1 */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Homepage Description Paragraph 1
                    </label>
                    <textarea
                      value={config.about_homepage_desc_1 || ""}
                      onChange={(e) => handleConfigChange("about_homepage_desc_1", e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                    />
                  </div>

                  {/* Homepage Description 2 */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Homepage Description Paragraph 2
                    </label>
                    <textarea
                      value={config.about_homepage_desc_2 || ""}
                      onChange={(e) => handleConfigChange("about_homepage_desc_2", e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                    />
                  </div>

                  {/* Homepage About Section Image */}
                  <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/35 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
                        Homepage About Image
                      </span>
                      {uploadingImage && (
                        <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                      )}
                    </div>
                    {aboutImage && (
                      <div className="relative rounded overflow-hidden h-48 w-full border border-stone-200 dark:border-stone-800">
                        <img
                          src={aboutImage}
                          alt="Homepage about section image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#cb2026] bg-white dark:bg-stone-900 transition-colors rounded py-3 text-xs font-semibold cursor-pointer text-stone-700 dark:text-stone-300">
                      <Upload size={14} />
                      <span>Upload New Homepage About Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("about_img", e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* SECTION 3: ABOUT US PAGE HERITAGE SECTION */}
                <div className="space-y-4 pb-6 border-b border-stone-250 dark:border-stone-800">
                  <h3 className="text-xs font-bold text-[#cb2026] uppercase tracking-wider">
                    About Us Page: The Heritage Section
                  </h3>

                  {/* Heritage Section Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Heritage Section Title
                    </label>
                    <input
                      type="text"
                      value={config.about_heritage_title || ""}
                      onChange={(e) => handleConfigChange("about_heritage_title", e.target.value)}
                      placeholder="Crafted with Purpose. Perfected Through Experience."
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                    />
                  </div>

                  {/* Heritage Paragraph 1 */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Heritage Story Paragraph 1
                    </label>
                    <textarea
                      value={config.about_heritage_p1 || ""}
                      onChange={(e) => handleConfigChange("about_heritage_p1", e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                    />
                  </div>

                  {/* Heritage Paragraph 2 */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Heritage Story Paragraph 2
                    </label>
                    <textarea
                      value={config.about_heritage_p2 || ""}
                      onChange={(e) => handleConfigChange("about_heritage_p2", e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                    />
                  </div>

                  {/* Heritage Paragraph 3 */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                      Heritage Story Paragraph 3
                    </label>
                    <textarea
                      value={config.about_heritage_p3 || ""}
                      onChange={(e) => handleConfigChange("about_heritage_p3", e.target.value)}
                      rows={4}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                    />
                  </div>

                  {/* Heritage Image */}
                  <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/35 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
                        Heritage Section Image
                      </span>
                      {uploadingImage && (
                        <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                      )}
                    </div>
                    {heritageImage && (
                      <div className="relative rounded overflow-hidden h-48 w-full border border-stone-200 dark:border-stone-800">
                        <img
                          src={heritageImage}
                          alt="Heritage section image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#cb2026] bg-white dark:bg-stone-900 transition-colors rounded py-3 text-xs font-semibold cursor-pointer text-stone-700 dark:text-stone-300">
                      <Upload size={14} />
                      <span>Upload New Heritage Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("about_heritage_img", e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Tagline */}
                <div className="space-y-2 pt-4">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block mb-1">
                    Featured Atelier Quote / Tagline (Optional)
                  </label>
                  <textarea
                    value={config.about_quote || ""}
                    onChange={(e) => handleConfigChange("about_quote", e.target.value)}
                    rows={2}
                    placeholder="We remain a small studio by choice..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed italic"
                  />
                </div>
              </motion.div>
            )}

            {/* ATELIER VIDEO SHOWCASE */}
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
                    About Page Atelier Video Showcase
                  </span>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    Manage the featured video showcase section displayed right after &quot;Our
                    Ethos&quot; on the About Us page.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    YouTube Video Link / URL
                  </label>
                  <input
                    type="text"
                    value={config.about_video_url || ""}
                    onChange={(e) => handleConfigChange("about_video_url", e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Video Section Title
                  </label>
                  <input
                    type="text"
                    value={config.about_video_title || ""}
                    onChange={(e) => handleConfigChange("about_video_title", e.target.value)}
                    placeholder="e.g. Inside Our Atelier"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Video Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={config.about_video_subtitle || ""}
                    onChange={(e) => handleConfigChange("about_video_subtitle", e.target.value)}
                    placeholder="e.g. Step inside our Bangalore manufacturing facility..."
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
                      value={config.about_video_poster_url || ""}
                      onChange={(e) => handleConfigChange("about_video_poster_url", e.target.value)}
                      placeholder="Image URL or upload from device below..."
                      className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-stone-900 dark:text-white outline-none focus:border-[#cb2026] text-xs font-semibold"
                    />
                    <label className="bg-[#cb2026] hover:bg-[#df383e] text-white px-4 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
                      {uploadingVideoKey === "about_video_poster_url" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleVideoPosterUpload("about_video_poster_url", e)}
                      />
                    </label>
                  </div>

                  {config.about_video_poster_url && (
                    <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 mt-2">
                      <img
                        src={config.about_video_poster_url}
                        alt="About Video Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        Current Video Cover Preview
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. FOUNDERS & LEADERSHIP */}
            {activeTab === "founders" && (
              <motion.div
                key="founders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 max-w-3xl"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Founders & Leadership Profiles
                  </span>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    Manage the names, roles, bios, and portraits for Dhanesh Samant & Geeta Samant.
                  </p>
                </div>

                {/* Founder 1 */}
                <div className="bg-stone-50 dark:bg-stone-900/35 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
                  <span className="text-xs font-bold text-[#cb2026] uppercase tracking-wider block">
                    Founder 1 Profile
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={config.founder_name_1 ?? "DHANESH SAMANT"}
                        onChange={(e) => handleConfigChange("founder_name_1", e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                        Title / Role
                      </label>
                      <input
                        type="text"
                        value={config.founder_role_1 ?? "Founder"}
                        onChange={(e) => handleConfigChange("founder_role_1", e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                      Bio Description
                    </label>
                    <textarea
                      rows={3}
                      value={
                        config.founder_bio_1 ??
                        "Studio Young Designs has been a brain child of the brilliantly assiduous Dhanesh Samant, who has nurtured it for over four decades. His state of the art designs are crafted with novelty to create homes that exhibits elegant grandeur."
                      }
                      onChange={(e) => handleConfigChange("founder_bio_1", e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                      Founder Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-100">
                        <img
                          src={config.founder_img_1 || "/images/founders/dhanesh-samant.webp"}
                          alt="Founder 1"
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <label className="flex items-center gap-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer">
                        <Upload size={14} />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFounderImageUpload(e, "founder_img_1")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Founder 2 */}
                <div className="bg-stone-50 dark:bg-stone-900/35 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
                  <span className="text-xs font-bold text-[#cb2026] uppercase tracking-wider block">
                    Founder 2 Profile
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={config.founder_name_2 ?? "GEETA SAMANT"}
                        onChange={(e) => handleConfigChange("founder_name_2", e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                        Title / Role
                      </label>
                      <input
                        type="text"
                        value={config.founder_role_2 ?? "Co-Founder"}
                        onChange={(e) => handleConfigChange("founder_role_2", e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                      Bio Description
                    </label>
                    <textarea
                      rows={3}
                      value={
                        config.founder_bio_2 ??
                        "Geeta Samant who excels in her unique preciosity and redefined class and style has taken Studio Young Designs to its pinnacle of glory in the last four decades with her expertise in management and leadership skills."
                      }
                      onChange={(e) => handleConfigChange("founder_bio_2", e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
                      Co-Founder Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-100">
                        <img
                          src={config.founder_img_2 || "/images/founders/geeta-samant.webp"}
                          alt="Founder 2"
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <label className="flex items-center gap-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer">
                        <Upload size={14} />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFounderImageUpload(e, "founder_img_2")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. OUR ETHOS (FOUR PILLARS) */}
            {activeTab === "ethos" && (
              <motion.div
                key="ethos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                      Our Ethos (Craft Pillars)
                    </span>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                      Manage the core pillars displayed in the 3D dark section on the About page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEthos}
                    className="flex items-center gap-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#cb2026] dark:hover:bg-[#cb2026] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Pillar</span>
                  </button>
                </div>

                {/* Ethos Header Controls */}
                <div className="space-y-4 p-4 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 rounded-lg">
                  <h4 className="text-xs font-bold text-[#cb2026] uppercase tracking-wider">
                    Ethos Section Header Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                        Section Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={config.about_ethos_eyebrow || ""}
                        onChange={(e) => handleConfigChange("about_ethos_eyebrow", e.target.value)}
                        placeholder="Our Ethos"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                        Section Main Heading
                      </label>
                      <input
                        type="text"
                        value={config.about_ethos_heading || ""}
                        onChange={(e) => handleConfigChange("about_ethos_heading", e.target.value)}
                        placeholder="The four pillars behind every Studio Young interior."
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {ethosPillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-4 rounded-lg space-y-3 relative group"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 w-1/4">
                          <span className="text-xs font-bold text-stone-400">Pillar</span>
                          <input
                            type="text"
                            value={pillar.num}
                            onChange={(e) => handleUpdateEthos(idx, "num", e.target.value)}
                            placeholder="01"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 text-stone-900 dark:text-white font-display text-sm font-bold focus:border-[#cb2026] outline-none"
                          />
                        </div>
                        <div className="w-3/4 flex items-center gap-2">
                          <input
                            type="text"
                            value={pillar.title}
                            onChange={(e) => handleUpdateEthos(idx, "title", e.target.value)}
                            placeholder="Title (e.g. In-House Woodcraft Atelier)"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteEthos(idx)}
                            className="text-stone-400 hover:text-red-600 p-1.5 rounded transition-colors cursor-pointer"
                            title="Delete pillar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <textarea
                          value={pillar.desc}
                          onChange={(e) => handleUpdateEthos(idx, "desc", e.target.value)}
                          rows={3}
                          placeholder="Pillar description..."
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-stone-900 dark:text-white text-xs leading-relaxed focus:border-[#cb2026] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. MILESTONES TIMELINE */}
            {activeTab === "milestones" && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-3xl"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                      Historical Milestones Timeline
                    </span>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                      Add, edit or remove milestone years displayed on the About page and homepage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="flex items-center gap-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#cb2026] dark:hover:bg-[#cb2026] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {milestones.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-4 rounded-lg space-y-3 relative group"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 w-1/3">
                          <span className="text-xs font-bold text-stone-400">#{idx + 1}</span>
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => handleUpdateMilestone(idx, "year", e.target.value)}
                            placeholder="Year (e.g. 1981, 40+)"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 text-stone-900 dark:text-white font-display text-sm font-bold focus:border-[#cb2026] outline-none"
                          />
                        </div>
                        <div className="w-2/3 flex items-center gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                            placeholder="Title (e.g. Studio Founded)"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 text-stone-900 dark:text-white text-xs font-semibold focus:border-[#cb2026] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteMilestone(idx)}
                            className="text-stone-400 hover:text-red-600 p-1.5 rounded transition-colors cursor-pointer"
                            title="Delete milestone"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <textarea
                          value={item.text}
                          onChange={(e) => handleUpdateMilestone(idx, "text", e.target.value)}
                          rows={2}
                          placeholder="Milestone description..."
                          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-stone-900 dark:text-white text-xs leading-relaxed focus:border-[#cb2026] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
