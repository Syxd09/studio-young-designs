import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Loader2,
  Plus,
  X,
  Upload,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  PenTool,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { AdminSelect } from "@/components/ui/admin-select";

export const Route = createFileRoute("/admin/journal")({
  component: JournalComponent,
});

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  read_time: string;
  category: string;
  tags?: string[] | string;
  is_visible: boolean;
  published_date: string;
}

function JournalComponent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Design Theory");
  const [readTime, setReadTime] = useState("5 min read");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      toast.error("Failed to load journal articles");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPost) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file is too large (max 10MB).");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCategory(post.category);
    setReadTime(post.read_time);
    setTagsInput(
      post.tags ? (Array.isArray(post.tags) ? post.tags.join(", ") : String(post.tags)) : "",
    );
    setPreviewUrl(post.image_url);
    setIsModalOpen(true);
  };

  const uploadCoverFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `journal-${Math.random()}.${fileExt}`;
    const filePath = `journal/${fileName}`;

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
      let finalImageUrl = editingPost ? editingPost.image_url : "";

      if (imageFile) {
        finalImageUrl = await uploadCoverFile(imageFile);
      }

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingPost) {
        const updatePayload: any = {
          title,
          slug,
          excerpt,
          content,
          category,
          read_time: readTime,
          image_url: finalImageUrl,
        };
        if (tagsInput.trim()) {
          updatePayload.tags = tagsArray;
        }

        const { error } = await supabase
          .from("journal_posts")
          .update(updatePayload)
          .eq("id", editingPost.id);

        if (
          error &&
          (error.message?.includes("tags") ||
            error.code === "PGRST204" ||
            error.code === "42703" ||
            error.message?.includes("column"))
        ) {
          delete updatePayload.tags;
          const retry = await supabase
            .from("journal_posts")
            .update(updatePayload)
            .eq("id", editingPost.id);
          if (retry.error) throw retry.error;
          toast.warning(
            "Article updated! (Tip: Run 'ALTER TABLE journal_posts ADD COLUMN tags TEXT[];' in Supabase SQL editor to persist tags).",
          );
        } else if (error) {
          throw error;
        } else {
          toast.success("Journal article updated successfully");
        }
      } else {
        const insertPayload: any = {
          title,
          slug,
          excerpt,
          content,
          category,
          read_time: readTime,
          image_url: finalImageUrl,
          is_visible: true,
          published_date: new Date().toISOString(),
        };
        if (tagsInput.trim()) {
          insertPayload.tags = tagsArray;
        }

        const { error } = await supabase.from("journal_posts").insert([insertPayload]);

        if (
          error &&
          (error.message?.includes("tags") ||
            error.code === "PGRST204" ||
            error.code === "42703" ||
            error.message?.includes("column"))
        ) {
          delete insertPayload.tags;
          const retry = await supabase.from("journal_posts").insert([insertPayload]);
          if (retry.error) throw retry.error;
          toast.warning(
            "New article published! (Tip: Run 'ALTER TABLE journal_posts ADD COLUMN tags TEXT[];' in Supabase SQL editor to persist tags).",
          );
        } else if (error) {
          throw error;
        } else {
          toast.success("New journal article published successfully!");
        }
      }

      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (post: Post) => {
    try {
      const { error } = await supabase
        .from("journal_posts")
        .update({ is_visible: !post.is_visible })
        .eq("id", post.id);

      if (error) throw error;
      toast.success(
        post.is_visible ? "Article unpublished (hidden)." : "Article published (visible).",
      );
      fetchPosts();
    } catch (err: any) {
      toast.error("Failed to toggle visibility.");
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm("Are you sure you want to permanently delete this journal post?")) return;

    try {
      if (post.image_url.includes("studio-young-assets")) {
        const urlParts = post.image_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `journal/${fileName}`;
        await supabase.storage.from("studio-young-assets").remove([filePath]);
      }

      const { error } = await supabase.from("journal_posts").delete().eq("id", post.id);
      if (error) throw error;

      toast.success("Journal post deleted successfully.");
      fetchPosts();
    } catch (err: any) {
      toast.error("Failed to delete post.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("Design Theory");
    setReadTime("5 min read");
    setTagsInput("");
    setImageFile(null);
    setPreviewUrl(null);
    setEditingPost(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Journal Editor
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Manage blog posts, insights, and design articles published on the website.
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
          <span>Create Article</span>
        </button>
      </header>

      {/* Articles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl overflow-hidden flex flex-col sm:flex-row group shadow-sm transition-all ${
              !post.is_visible ? "opacity-50" : ""
            }`}
          >
            {/* Visual Cover */}
            <div className="aspect-video sm:aspect-square w-full sm:w-44 overflow-hidden relative bg-stone-100 dark:bg-stone-900 shrink-0">
              <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex gap-1">
                <button
                  onClick={() => toggleVisibility(post)}
                  className="p-1.5 rounded bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 shadow border border-stone-200/50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-950 transition-all cursor-pointer"
                  title={post.is_visible ? "Hide from website" : "Show on website"}
                >
                  {post.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>
            </div>

            {/* Post Information */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-[#cb2026] font-bold">
                  <span>{post.category}</span>
                  <span className="text-stone-400 dark:text-stone-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {format(new Date(post.published_date), "MMM dd, yyyy")}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-stone-900 dark:text-white line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                {post.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(post.tags) ? post.tags : String(post.tags).split(",")).map(
                      (t, idx) => (
                        <span
                          key={idx}
                          className="bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-400 text-[9px] px-1.5 py-0.5 rounded font-medium"
                        >
                          #{t.trim()}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Action Operations */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center text-xs">
                <span className="text-stone-400 dark:text-stone-500 text-[10px]">
                  {post.read_time}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-1 text-stone-400 hover:text-[#cb2026] transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="p-1 text-stone-400 hover:text-red-650 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
              className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] p-6 text-stone-900 dark:text-white shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cb2026]/50 to-transparent" />

              <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3 mb-5">
                <h3 className="font-display font-semibold text-md text-stone-900 dark:text-white">
                  {editingPost ? "Edit Article Specs" : "Publish New Article"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 dark:text-stone-550 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-2 flex-1 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Article Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <AdminSelect
                      label="Category"
                      value={category}
                      onChange={(val) => setCategory(val)}
                      options={["Guides & Manuals", "Material Studies", "Design Philosophy"]}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                      Read Time
                    </label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="e.g. 5 min read"
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Article Tags (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. Woodcraft, Joinery, Walnut, Bangalore"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                  />
                  <p className="text-[10px] text-stone-400 dark:text-stone-550 italic">
                    Enter tags separated by commas.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Cover Image
                  </label>
                  {previewUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 group max-h-48">
                      <img
                        src={previewUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded text-red-400 hover:text-red-300 transition-all cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 hover:border-[#cb2026] hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-all cursor-pointer text-xs font-bold gap-2 text-stone-500">
                      <Upload size={20} className="text-[#cb2026]" />
                      <span>Choose Cover Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required={!editingPost}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Article Excerpt (Short Summary)
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent leading-relaxed resize-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                    Article Body Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    placeholder="Write article details here..."
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent leading-relaxed font-mono"
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-[#141416] border-t border-stone-100 dark:border-stone-850">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-850 text-stone-850 dark:text-stone-200 rounded py-2.5 text-xs font-bold border border-stone-200 dark:border-stone-800 transition-all cursor-pointer"
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
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <span>Publish Article</span>
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
