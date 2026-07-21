import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Loader2,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSelect } from "@/components/ui/admin-select";

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryComponent,
});

const CATEGORIES = ["kitchens", "wardrobes", "living", "interiors"];

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image_url: string;
  span: string;
  display_order: number;
  is_visible: boolean;
  is_featured?: boolean;
}

function GalleryComponent() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const [categories, setCategories] = useState<{ slug: string; title: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("");
  const [span, setSpan] = useState("standard");
  const [isFeatured, setIsFeatured] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("slug, title")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const [galleryRes, configRes] = await Promise.all([
        supabase.from("gallery").select("*").order("display_order", { ascending: true }),
        supabase.from("site_config").select("value").eq("key", "homepage_selected_gallery_ids").maybeSingle(),
      ]);

      if (galleryRes.error) throw galleryRes.error;

      const rawConfigVal = configRes.data?.value || "";
      const selectedIds = rawConfigVal.split(",").map((s: string) => s.trim()).filter(Boolean);

      const itemsWithFeatured = (galleryRes.data || []).map((item: any) => ({
        ...item,
        is_featured: selectedIds.includes(String(item.id)) || item.is_featured === true,
      }));

      setItems(itemsWithFeatured);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load gallery items.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Image file is too large (max limit is 15MB).");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setCategory(item.category);
    setSpan(item.span);
    setIsFeatured(item.is_featured !== false);
    setPreviewUrl(item.image_url);
    setIsModalOpen(true);
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${Math.random()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("studio-young-assets")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("studio-young-assets").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingItem) {
        let finalUrl = editingItem.image_url;

        if (imageFile) {
          finalUrl = await uploadImageFile(imageFile);
        }

        const updatePayload: any = {
          title,
          subtitle,
          category,
          span,
          image_url: finalUrl,
        };

        const { error } = await supabase
          .from("gallery")
          .update(updatePayload)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast.success("Gallery item updated successfully");
      } else {
        if (!imageFile) {
          toast.error("Please choose a portfolio image file.");
          setUploading(false);
          return;
        }

        const uploadedUrl = await uploadImageFile(imageFile);
        const insertPayload: any = {
          title,
          subtitle,
          category,
          span,
          image_url: uploadedUrl,
          display_order: items.length,
          is_visible: true,
        };

        const { error } = await supabase.from("gallery").insert([insertPayload]);
        if (error) throw error;

        toast.success("New gallery item uploaded successfully.");
      }

      setIsModalOpen(false);
      resetForm();
      fetchGallery();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save gallery item.");
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (item: GalleryItem) => {
    try {
      const { error } = await supabase
        .from("gallery")
        .update({ is_visible: !item.is_visible })
        .eq("id", item.id);

      if (error) throw error;
      toast.success(item.is_visible ? "Item hidden from website." : "Item visible on website.");
      fetchGallery();
    } catch (err: any) {
      toast.error("Failed to update visibility.");
    }
  };

  const toggleFeatured = async (item: GalleryItem) => {
    try {
      const currentFeaturedIds = items.filter((i) => i.is_featured).map((i) => String(i.id));
      const targetId = String(item.id);

      let nextIds: string[];
      let isNowFeatured: boolean;

      if (currentFeaturedIds.includes(targetId)) {
        nextIds = currentFeaturedIds.filter((id) => id !== targetId);
        isNowFeatured = false;
      } else {
        nextIds = [...currentFeaturedIds, targetId];
        isNowFeatured = true;
      }

      // Optimistically update local state so UI buttons respond immediately
      setItems((prev) =>
        prev.map((i) => (String(i.id) === targetId ? { ...i, is_featured: isNowFeatured } : i))
      );

      // Save to site_config (guaranteed fail-proof)
      const { error: configError } = await supabase
        .from("site_config")
        .upsert({ key: "homepage_selected_gallery_ids", value: nextIds.join(",") }, { onConflict: "key" });

      if (configError) throw configError;

      // Also try updating is_featured column if present in table schema
      supabase.from("gallery").update({ is_featured: isNowFeatured }).eq("id", item.id).then();

      toast.success(
        isNowFeatured
          ? "Pinned to Selected Works on Homepage!"
          : "Unpinned from Homepage Selected Works.",
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update homepage featured status.");
      fetchGallery(); // rollback
    }
  };

  const updateCardSpan = async (item: GalleryItem, newSpan: "standard" | "tall" | "wide") => {
    try {
      // Optimistically update local state for instant feedback
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, span: newSpan } : i))
      );

      const { error } = await supabase
        .from("gallery")
        .update({ span: newSpan })
        .eq("id", item.id);

      if (error) throw error;
      toast.success(`Photo layout size updated to ${newSpan.toUpperCase()}!`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update card size.");
      fetchGallery(); // rollback
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!window.confirm("Are you sure you want to permanently delete this gallery item?")) return;

    try {
      if (item.image_url.includes("studio-young-assets")) {
        const urlParts = item.image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `gallery/${fileName}`;
        await supabase.storage.from("studio-young-assets").remove([filePath]);
      }

      const { error } = await supabase.from("gallery").delete().eq("id", item.id);
      if (error) throw error;

      toast.success("Gallery item deleted successfully.");
      fetchGallery();
    } catch (err: any) {
      toast.error("Failed to delete gallery item.");
    }
  };

  const handleMove = async (item: GalleryItem, direction: "up" | "down") => {
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const otherItem = items[targetIndex];

    try {
      const tempOrder = item.display_order;

      await Promise.all([
        supabase
          .from("gallery")
          .update({ display_order: otherItem.display_order })
          .eq("id", item.id),
        supabase.from("gallery").update({ display_order: tempOrder }).eq("id", otherItem.id),
      ]);

      toast.success("Reordered successfully");
      fetchGallery();
    } catch (err: any) {
      toast.error("Failed to reorder items.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setCategory(CATEGORIES[0]);
    setSpan("standard");
    setIsFeatured(true);
    setImageFile(null);
    setPreviewUrl(null);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    if (activeFilter === "featured") return item.is_featured === true;
    if (activeFilter !== "all") return item.category.toLowerCase() === activeFilter.toLowerCase();
    return true;
  });

  const featuredCount = items.filter((i) => i.is_featured === true).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Gallery Portfolio Manager
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Add, edit, reorder, and select which images display in Selected Works on the Homepage.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Gallery Image</span>
        </button>
      </header>

      {/* Top Metrics & Homepage Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-5 rounded-xl shadow-sm">
          <div className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
            Total Portfolio Projects
          </div>
          <div className="text-2xl font-display font-semibold text-stone-900 dark:text-white mt-1">
            {items.length} Images
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              Homepage Selected Works
            </span>
            <Star size={14} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-display font-semibold text-amber-600 dark:text-amber-400 mt-1">
            {featuredCount} Items Pinned
          </div>
        </div>
        <div className="bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-5 rounded-xl shadow-sm">
          <div className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
            Live Website Status
          </div>
          <div className="text-2xl font-display font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {items.filter((i) => i.is_visible).length} Visible
          </div>
        </div>
      </div>

      {/* Luxury Segmented Category & Homepage Selection Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-2.5 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-stone-900 dark:bg-white text-white dark:text-stone-950 shadow-sm"
              : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850"
          }`}
        >
          All Projects ({items.length})
        </button>
        <button
          onClick={() => setActiveFilter("featured")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeFilter === "featured"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
          }`}
        >
          <Star size={13} className="fill-current" />
          <span>Homepage Selected ({featuredCount})</span>
        </button>

        <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === cat
                ? "bg-[#cb2026] text-white shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Portfolio Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            className={`border bg-white dark:bg-[#141416] rounded-xl overflow-hidden flex flex-col group relative shadow-sm transition-all ${
              item.is_featured === true
                ? "border-amber-500/50 shadow-amber-500/5 dark:border-amber-500/40"
                : "border-stone-200 dark:border-stone-850"
            } ${!item.is_visible ? "opacity-50" : ""}`}
          >
            {/* Visual Preview */}
            <div className="aspect-video w-full overflow-hidden relative bg-stone-100 dark:bg-stone-900">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => toggleVisibility(item)}
                  className="p-1.5 rounded bg-white/95 dark:bg-[#1C1C1F]/90 text-stone-800 dark:text-stone-200 shadow-sm border border-stone-200/50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 transition-all cursor-pointer"
                  title={item.is_visible ? "Hide from website" : "Show on website"}
                >
                  {item.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-stone-900/90 dark:bg-stone-950/90 text-[9px] uppercase tracking-wider text-[#cb2026] font-bold">
                {item.category} · {item.span}
              </div>
            </div>

            {/* Content info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-150 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-stone-400 dark:text-stone-550 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>

              {/* 1-Click Card Layout Size Selector */}
              <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900/60 p-1 rounded-lg border border-stone-200/70 dark:border-stone-800">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold px-1">
                  Size:
                </span>
                <button
                  type="button"
                  onClick={() => updateCardSpan(item, "standard")}
                  className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                    item.span === "standard" || !item.span
                      ? "bg-[#cb2026] text-white shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Square (1:1 aspect)"
                >
                  Square
                </button>
                <button
                  type="button"
                  onClick={() => updateCardSpan(item, "tall")}
                  className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                    item.span === "tall"
                      ? "bg-[#cb2026] text-white shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Tall (3:4 aspect)"
                >
                  Tall
                </button>
                <button
                  type="button"
                  onClick={() => updateCardSpan(item, "wide")}
                  className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                    item.span === "wide"
                      ? "bg-[#cb2026] text-white shadow-xs"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Wide (16:9 banner aspect)"
                >
                  Wide
                </button>
              </div>

              {/* Homepage Pin Toggle Switch Button */}
              <button
                type="button"
                onClick={() => toggleFeatured(item)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  item.is_featured === true
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                    : "bg-stone-50 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-500/60 hover:text-amber-600 dark:hover:text-amber-400"
                }`}
              >
                <Star size={13} className={item.is_featured === true ? "fill-white" : ""} />
                <span>
                  {item.is_featured === true ? "Featured on Homepage" : "+ Add to Homepage"}
                </span>
              </button>

              {/* Order & Edit action buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMove(item, "up")}
                    disabled={idx === 0}
                    className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-850 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 rounded disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMove(item, "down")}
                    disabled={idx === items.length - 1}
                    className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-850 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 rounded disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-[#cb2026] hover:bg-[#cb2026]/10 rounded transition-all cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-6 text-stone-900 dark:text-white shadow-2xl"
            >
              {/* Modal top border */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cb2026]/50 to-transparent" />

              <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3 mb-5">
                <h3 className="font-display font-semibold text-md text-stone-900 dark:text-white">
                  {editingItem ? "Edit Gallery Item" : "Add New Gallery Image"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Image File
                  </label>

                  {previewUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-[#cb2026] hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-all cursor-pointer text-xs font-bold gap-2 text-stone-500">
                      <Upload size={20} className="text-[#cb2026]" />
                      <span>Choose Portfolio Image</span>
                      <span className="text-[9px] text-stone-400 dark:text-stone-550 font-medium">
                        Limit: 15MB (.jpg, .png, .webp)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required={!editingItem}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Walnut Modular Kitchen"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Dining · Bangalore"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <AdminSelect
                      label="Category"
                      value={category}
                      onChange={(val) => setCategory(val)}
                      options={(categories.length > 0
                        ? categories
                        : [
                            { slug: "kitchens", title: "Kitchens" },
                            { slug: "wardrobes", title: "Wardrobes" },
                            { slug: "living", title: "Living Spaces" },
                            { slug: "interiors", title: "Turnkey Interiors" },
                          ]
                      ).map((cat) => ({
                        value: cat.slug,
                        label: cat.title.toUpperCase(),
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <AdminSelect
                      label="Grid Aspect Span"
                      value={span}
                      onChange={(val) => setSpan(val)}
                      options={[
                        { value: "standard", label: "Standard Square" },
                        { value: "tall", label: "Tall Card" },
                        { value: "wide", label: "Wide Card" },
                      ]}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-[#cb2026] focus:ring-[#cb2026] cursor-pointer"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer"
                  >
                    Feature in Homepage "Selected Work" Section
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 rounded py-2.5 text-xs font-bold transition-all border border-stone-200 dark:border-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#cb2026] text-white hover:bg-[#df383e] rounded py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Item</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
