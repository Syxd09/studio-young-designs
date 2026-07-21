import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Loader2, Plus, X, Upload, Trash2, Edit3, Eye, EyeOff, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/testimonials")({
  component: TestimonialsComponent,
});

interface Testimonial {
  id: string;
  customer_name: string;
  company_name: string;
  rating: number;
  content: string;
  profile_image_url: string;
  display_order: number;
  is_approved: boolean;
}

function TestimonialsComponent() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar image size limit is 5MB.");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setCustomerName(item.customer_name);
    setCompanyName(item.company_name || "");
    setRating(item.rating);
    setContent(item.content);
    setPreviewUrl(item.profile_image_url);
    setIsModalOpen(true);
  };

  const uploadAvatarFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

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
    setSaving(true);

    try {
      let finalImageUrl = editingItem ? editingItem.profile_image_url : "";

      if (imageFile) {
        finalImageUrl = await uploadAvatarFile(imageFile);
      }

      if (editingItem) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            customer_name: customerName,
            company_name: companyName,
            rating,
            content,
            profile_image_url: finalImageUrl,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Review specs updated successfully");
      } else {
        const { error } = await supabase.from("testimonials").insert([
          {
            customer_name: customerName,
            company_name: companyName,
            rating,
            content,
            profile_image_url: finalImageUrl,
            display_order: items.length,
            is_approved: true,
          },
        ]);

        if (error) throw error;
        toast.success("Client review added successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message || "Failed to save client review.");
    } finally {
      setSaving(false);
    }
  };

  const toggleApproval = async (item: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: !item.is_approved })
        .eq("id", item.id);

      if (error) throw error;
      toast.success(
        item.is_approved ? "Review hidden from frontpage." : "Review approved for live show.",
      );
      fetchTestimonials();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (item: Testimonial) => {
    if (!window.confirm("Are you sure you want to permanently delete this testimonial?")) return;

    try {
      if (item.profile_image_url && item.profile_image_url.includes("studio-young-assets")) {
        const urlParts = item.profile_image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `avatars/${fileName}`;
        await supabase.storage.from("studio-young-assets").remove([filePath]);
      }

      const { error } = await supabase.from("testimonials").delete().eq("id", item.id);
      if (error) throw error;

      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (err: any) {
      toast.error("Failed to delete review");
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCompanyName("");
    setRating(5);
    setContent("");
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
    if (activeFilter === "approved") return item.is_approved === true;
    if (activeFilter === "pending") return item.is_approved === false;
    return true;
  });

  const pendingCount = items.filter((i) => !i.is_approved).length;
  const approvedCount = items.filter((i) => i.is_approved).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Testimonials Manager
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Verify, edit, approve, or hide customer testimonies on the main homepage.
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
          <span>Add Client Review</span>
        </button>
      </header>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-2.5 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-stone-900 dark:bg-white text-white dark:text-stone-950 shadow-sm"
              : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850"
          }`}
        >
          All Reviews ({items.length})
        </button>
        <button
          onClick={() => setActiveFilter("approved")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeFilter === "approved"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
          }`}
        >
          Approved Live ({approvedCount})
        </button>
        <button
          onClick={() => setActiveFilter("pending")}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeFilter === "pending"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
          }`}
        >
          Pending Approval ({pendingCount})
        </button>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 flex flex-col justify-between space-y-4 relative shadow-sm transition-all ${
              !item.is_approved ? "opacity-50" : ""
            }`}
          >
            {/* Top info */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {item.profile_image_url ? (
                    <img
                      src={item.profile_image_url}
                      alt={item.customer_name}
                      className="h-10 w-10 rounded-full object-cover border border-stone-200 dark:border-stone-800"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-[#cb2026] font-bold text-xs uppercase">
                      {item.customer_name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-xs text-stone-950 dark:text-white uppercase tracking-wider">
                      {item.customer_name}
                    </h4>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">
                      {item.company_name || "Client"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < item.rating
                          ? "text-amber-550 fill-amber-550"
                          : "text-stone-200 dark:text-stone-800"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-stone-650 dark:text-stone-300 leading-relaxed italic">
                "{item.content}"
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center text-xs">
              <button
                onClick={() => toggleApproval(item)}
                className={`flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  item.is_approved
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-705 dark:text-red-400"
                }`}
              >
                {item.is_approved ? <Eye size={10} /> : <EyeOff size={10} />}
                <span>{item.is_approved ? "Approved" : "Hidden"}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 text-stone-400 hover:text-[#cb2026] transition-colors cursor-pointer"
                  title="Edit Review"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-6 text-stone-900 dark:text-white shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cb2026]/50 to-transparent" />

              <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3 mb-5">
                <h3 className="font-display font-semibold text-md text-stone-900 dark:text-white">
                  {editingItem ? "Edit Review Specs" : "Add New Client Review"}
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
                    Client Avatar (Optional)
                  </label>
                  {previewUrl ? (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 group mx-auto">
                      <img
                        src={previewUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 cursor-pointer"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-16 w-full rounded-lg border border-dashed border-stone-250 dark:border-stone-800 hover:border-[#cb2026] hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-all cursor-pointer text-xs font-bold gap-1 text-stone-500">
                      <Upload size={14} className="text-[#cb2026]" />
                      <span className="text-[10px]">Select Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Anand Rao"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Designation / Company
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Whitefield Villa Owner"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className="p-1 text-stone-400 hover:text-[#cb2026] transition-colors cursor-pointer"
                      >
                        <Star
                          size={20}
                          className={
                            val <= rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-stone-200 dark:text-stone-800"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Review Content (Max 220 Chars)
                    </label>
                    <span
                      className={`text-[10px] ${content.length >= 200 ? "text-[#cb2026] font-bold" : "text-stone-400"}`}
                    >
                      {content.length} / 220
                    </span>
                  </div>
                  <textarea
                    value={content}
                    maxLength={220}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Describe their experience (max 220 characters for uniform card size)..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent leading-relaxed resize-none"
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-850 dark:text-stone-200 rounded py-2.5 text-xs font-bold border border-stone-200 dark:border-stone-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#cb2026] text-white hover:bg-[#df383e] rounded py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Review</span>
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
