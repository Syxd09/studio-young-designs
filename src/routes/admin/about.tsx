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
  const [marqueeItems, setMarqueeItems] = useState<string[]>([
    "Handcrafted Joinery",
    "Bangalore Atelier",
    "Bespoke Walnut & Marble",
    "Since 1981",
    "Turnkey Excellence",
  ]);
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
    "story" | "video" | "founders" | "marquee" | "ethos" | "milestones"
  >("story");
  const [newMarqueeInput, setNewMarqueeInput] = useState("");

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const [configRes, imagesRes] = await Promise.all([
        supabase.from("site_config").select("key, value"),
        supabase
          .from("layout_images")
          .select("key, image_url")
          .eq("key", "about_img")
          .maybeSingle(),
      ]);

      if (configRes.error) throw configRes.error;

      const configMap = (configRes.data || []).reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: curr.value,
        }),
        {} as Record<string, string>,
      );

      setConfig(configMap);

      if (imagesRes.data?.image_url) {
        setAboutImage(imagesRes.data.image_url);
      }

      // Parse Marquee Items
      if (configMap.about_marquee_items) {
        try {
          const parsed = JSON.parse(configMap.about_marquee_items);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMarqueeItems(parsed);
          }
        } catch {
          const split = configMap.about_marquee_items
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (split.length > 0) setMarqueeItems(split);
        }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large. Limit is 10MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `about_img-${Date.now()}.${fileExt}`;
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
        .upsert({ key: "about_img", image_url: publicUrl }, { onConflict: "key" });

      if (dbError) throw dbError;

      setAboutImage(publicUrl);
      toast.success("About banner image updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFounderImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "founder_img_1" | "founder_img_2",
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size limit is 10MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `founders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-young-assets")
        .upload(filePath, file, { contentType: file.type, upsert: true });

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
        about_marquee_items: JSON.stringify(marqueeItems),
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

  // Marquee handlers
  const handleAddMarqueeItem = () => {
    if (!newMarqueeInput.trim()) return;
    setMarqueeItems((prev) => [...prev, newMarqueeInput.trim()]);
    setNewMarqueeInput("");
  };

  const handleDeleteMarqueeItem = (index: number) => {
    setMarqueeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMarqueeItem = (index: number, val: string) => {
    setMarqueeItems((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
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
                {/* About Banner Upload */}
                <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/35 p-5 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                      About Page Banner Image
                    </span>
                    {uploadingImage && (
                      <Loader2 size={14} className="animate-spin text-[#cb2026]" />
                    )}
                  </div>
                  {aboutImage && (
                    <div className="relative rounded overflow-hidden h-48 w-full border border-stone-200 dark:border-stone-800">
                      <img
                        src={aboutImage}
                        alt="About page banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#cb2026] bg-white dark:bg-stone-900 transition-colors rounded py-3 text-xs font-semibold cursor-pointer text-stone-700 dark:text-stone-300">
                    <Upload size={14} />
                    <span>Upload New About Banner Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={config.about_heading || ""}
                    onChange={(e) => handleConfigChange("about_heading", e.target.value)}
                    placeholder="Four decades. One quiet obsession — space that lasts."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Story Paragraph 1
                  </label>
                  <textarea
                    value={config.about_desc_1 || ""}
                    onChange={(e) => handleConfigChange("about_desc_1", e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Story Paragraph 2
                  </label>
                  <textarea
                    value={config.about_desc_2 || ""}
                    onChange={(e) => handleConfigChange("about_desc_2", e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Featured Atelier Quote / Tagline
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
                    Manage the featured video showcase section displayed right after &quot;Our Ethos&quot; on the About Us page.
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

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold">
                    Video Cover / Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={config.about_video_poster_url || ""}
                    onChange={(e) => handleConfigChange("about_video_poster_url", e.target.value)}
                    placeholder="https://images.unsplash.com/... or custom thumbnail image URL"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:border-[#cb2026] outline-none text-sm font-semibold"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-550 italic">
                    The background preview image shown before clicking Play on the About page video.
                  </p>
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
