import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  Briefcase,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/services")({
  component: ServicesComponent,
});

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  short_desc: string;
  description: string;
  image_url: string;
  benefits: string[];
  features: string[];
  is_visible: boolean;
  display_order?: number;
}

interface FeatureItem {
  title: string;
  description: string;
}

function ServicesComponent() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Edit Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);

  const [newBenefit, setNewBenefit] = useState("");
  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  const [visible, setVisible] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  // Add New Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newShortDesc, setNewShortDesc] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState(
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
  );

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async (preserveId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setServices(data || []);

      // Get the ID to preserve: either the passed ID or currently selected ID
      const targetId = preserveId || selectedService?.id;

      // Select the correct service
      if (data && data.length > 0) {
        const found = targetId ? data.find((s) => s.id === targetId) : null;
        if (found) {
          selectService(found);
        } else if (!isAddingNew) {
          selectService(data[0]);
        }
      }
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const selectService = (service: ServiceItem) => {
    setIsAddingNew(false);
    setSelectedService(service);
    setTitle(service.title);
    setSlug(service.slug);
    setShortDesc(service.short_desc);
    setDescription(service.description);
    setBenefits(service.benefits || []);

    // Parse features from serialized "Title:Description" format
    const parsedFeatures = (service.features || []).map((f: string) => {
      const idx = f.indexOf(":");
      if (idx === -1) {
        return { title: f, description: f };
      }
      return {
        title: f.substring(0, idx),
        description: f.substring(idx + 1),
      };
    });
    setFeatures(parsedFeatures);

    setVisible(service.is_visible);
    setImageUrl(service.image_url);
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits((prev) => [...prev, newBenefit.trim()]);
    setNewBenefit("");
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim()) {
      toast.error("Please enter a feature title.");
      return;
    }
    const titleVal = newFeatureTitle.trim();
    const descVal = newFeatureDesc.trim() || titleVal;

    setFeatures((prev) => [...prev, { title: titleVal, description: descVal }]);
    setNewFeatureTitle("");
    setNewFeatureDesc("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setSaving(true);

    // Serialize features into "Title:Description" format for database
    const serializedFeatures = features.map((f) => `${f.title}:${f.description}`);

    try {
      const { error } = await supabase
        .from("services")
        .update({
          title,
          slug,
          short_desc: shortDesc,
          description,
          benefits,
          features: serializedFeatures,
          is_visible: visible,
          image_url: imageUrl,
        })
        .eq("id", selectedService.id);

      if (error) throw error;
      toast.success("Service updated successfully");
      fetchServices(selectedService.id);
    } catch (err: any) {
      toast.error("Failed to save service: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newShortDesc.trim() || !newDescription.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const finalSlug =
      newSlug.trim() ||
      newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check if slug is unique
    if (services.some((s) => s.slug === finalSlug)) {
      toast.error("A service with this URL slug already exists. Please choose a unique slug.");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([
          {
            title: newTitle,
            slug: finalSlug,
            short_desc: newShortDesc,
            description: newDescription,
            image_url: newImageUrl,
            benefits: [],
            features: [],
            display_order: services.length,
            is_visible: true,
          },
        ])
        .select();

      if (error) throw error;
      toast.success("New service added successfully!");

      // Clear forms
      setNewTitle("");
      setNewSlug("");
      setNewShortDesc("");
      setNewDescription("");
      setIsAddingNew(false);

      if (data && data.length > 0) {
        await fetchServices(data[0].id);
      } else {
        await fetchServices();
      }
    } catch (err: any) {
      toast.error("Failed to add service: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this service? All details will be lost.",
      )
    )
      return;

    setSaving(true);
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;
      toast.success("Service successfully deleted");

      const remaining = services.filter((s) => s.id !== id);
      setServices(remaining);

      if (remaining.length > 0) {
        selectService(remaining[0]);
      } else {
        setSelectedService(null);
      }
    } catch (err: any) {
      toast.error("Failed to delete service: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isNewForm = false) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large (max 10MB).");
      return;
    }

    const currentSlug = isNewForm ? "new-service" : selectedService?.slug || "service";
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `service-${currentSlug}-${Math.random()}.${fileExt}`;
      const filePath = `services/${fileName}`;

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

      if (isNewForm) {
        setNewImageUrl(publicUrl);
        toast.success("New service illustration uploaded successfully.");
      } else if (selectedService) {
        const { error: dbError } = await supabase
          .from("services")
          .update({ image_url: publicUrl })
          .eq("id", selectedService.id);

        if (dbError) throw dbError;

        setImageUrl(publicUrl);
        setSelectedService((prev) => (prev ? { ...prev, image_url: publicUrl } : null));
        toast.success("Service image replaced successfully.");
        fetchServices(selectedService.id);
      }
    } catch (err: any) {
      toast.error("Failed to upload service image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (service: ServiceItem) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_visible: !service.is_visible })
        .eq("id", service.id);

      if (error) throw error;
      toast.success(
        service.is_visible ? "Service hidden from website." : "Service visible on website.",
      );
      fetchServices(service.id);
      if (selectedService?.id === service.id) {
        setVisible(!service.is_visible);
      }
    } catch (err: any) {
      toast.error("Failed to toggle visibility.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
          <p className="font-display text-xs tracking-widest uppercase text-stone-400">
            Loading Atelier Services
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Service Pages Manager
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Add, remove, or edit detailed specifications, checklists, and illustrations for core
            disciplines.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddingNew(true);
            setSelectedService(null);
          }}
          className="flex items-center gap-1.5 bg-[#cb2026] text-white px-4 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-20">
        {/* SERVICES SELECTOR SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-4 space-y-2 shadow-sm">
            <span className="text-[9px] uppercase tracking-widest text-[#cb2026] font-bold block mb-2 px-2">
              Core Services
            </span>
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => selectService(svc)}
                className={`w-full flex justify-between items-center text-left px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                  selectedService?.id === svc.id && !isAddingNew
                    ? "bg-[#cb2026]/10 border-[#cb2026]/30 text-stone-950 dark:text-white"
                    : "bg-transparent border-transparent text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900/50 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase
                    size={14}
                    className={
                      selectedService?.id === svc.id && !isAddingNew
                        ? "text-[#cb2026]"
                        : "text-stone-400"
                    }
                  />
                  <span>{svc.title}</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(svc);
                  }}
                  className={`text-[8px] px-2 py-0.5 rounded border transition-colors ${
                    svc.is_visible
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400"
                  }`}
                >
                  {svc.is_visible ? "Active" : "Hidden"}
                </span>
              </button>
            ))}
            {services.length === 0 && (
              <div className="py-6 text-center text-stone-400 dark:text-stone-600 text-xs">
                No services configured yet.
              </div>
            )}
          </div>

          {selectedService && !isAddingNew && (
            <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 space-y-4 shadow-sm">
              <span className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                Service Illustration
              </span>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 group">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 cursor-pointer text-xs font-bold text-white">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin text-[#cb2026]" />
                  ) : (
                    <>
                      <Upload size={16} className="text-[#cb2026]" />
                      <span>Replace Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Paste Image URL Fallback */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-850">
                <label className="text-[8px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                  Or paste custom image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={async (e) => {
                    const newUrl = e.target.value;
                    setImageUrl(newUrl);
                    setSelectedService((prev) => (prev ? { ...prev, image_url: newUrl } : null));

                    // Auto-update to DB
                    await supabase
                      .from("services")
                      .update({ image_url: newUrl })
                      .eq("id", selectedService.id);
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-2.5 py-1.5 text-[10px] text-stone-900 dark:text-white placeholder-stone-405 outline-none focus:border-[#cb2026]"
                />
              </div>
            </div>
          )}
        </div>

        {/* SERVICE FORM EDITOR */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* ADD NEW SERVICE VIEW */}
            {isAddingNew && (
              <motion.form
                key="new-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleCreateService}
                className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] shadow-sm rounded-xl p-6 space-y-6 text-stone-900 dark:text-white"
              >
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-4 mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-white">
                      Add New Service
                    </h3>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-0.5">
                      Design a new business discipline module
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        if (services.length > 0) selectService(services[0]);
                      }}
                      className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-750 dark:text-stone-250 px-4 py-2.5 rounded text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      <span>Create Service</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                      Service Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Modular Kitchens"
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        setNewSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, ""),
                        );
                      }}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                      URL Slug (URL identifier)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. kitchens"
                      value={newSlug}
                      onChange={(e) =>
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                      }
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                    Intro summary (Short description)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief 1-sentence tagline shown on lists."
                    value={newShortDesc}
                    onChange={(e) => setNewShortDesc(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                    Detailed Story Description
                  </label>
                  <textarea
                    placeholder="Enter detailed description block about this service discipline..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none leading-relaxed"
                    required
                  />
                </div>

                <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 p-5 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-stone-455 dark:text-stone-500 font-bold">
                      Upload Showcase Illustration
                    </span>
                    {uploading && <Loader2 size={12} className="animate-spin text-[#cb2026]" />}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={newImageUrl}
                      alt="New service placeholder"
                      className="w-32 h-20 object-cover rounded border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900"
                    />
                    <div className="flex-1 space-y-3 w-full">
                      <label className="w-full flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-800 hover:border-[#cb2026] bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 transition-colors rounded py-2.5 text-xs font-semibold cursor-pointer text-stone-700 dark:text-stone-300">
                        <Upload size={14} className="text-stone-400" />
                        <span>Select Banner Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                        />
                      </label>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-stone-400 text-[10px] uppercase font-bold">
                            URL:
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste direct image URL here..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full pl-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-[10px] text-stone-900 dark:text-white placeholder-stone-450 outline-none focus:border-[#cb2026]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.form>
            )}

            {/* EDIT ACTIVE SERVICE VIEW */}
            {selectedService && !isAddingNew && (
              <motion.form
                key={selectedService.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleSave}
                className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] shadow-sm rounded-xl p-6 space-y-6 text-stone-900 dark:text-white"
              >
                <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-850 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="font-display font-semibold text-lg text-stone-900 dark:text-white bg-transparent border-b border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-[#cb2026] outline-none py-0.5 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(selectedService)}
                        className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                        title={visible ? "Hide from website" : "Show on website"}
                      >
                        {visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-bold">
                        URL Slug:
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) =>
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                        }
                        className="bg-stone-50 dark:bg-stone-900 text-[9px] font-mono text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-800 outline-none focus:border-[#cb2026]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteService(selectedService.id)}
                      className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-600 dark:hover:bg-red-900 text-red-600 hover:text-white border border-red-200 dark:border-red-900/50 px-3 py-2.5 rounded text-xs font-bold transition-all cursor-pointer"
                      title="Permanently Delete Service"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>Save Specifications</span>
                    </button>
                  </div>
                </div>

                {/* Short description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                    Intro Summary (Short Desc)
                  </label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                    required
                  />
                </div>

                {/* Detailed Description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                    Detailed Story Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none leading-relaxed"
                    required
                  />
                </div>

                {/* Split list fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 dark:border-stone-850">
                  {/* Benefits List */}
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase tracking-widest text-[#cb2026] font-bold block">
                      Atelier Marquee Items
                    </span>

                    {/* Add Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Blum hardware sync"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-3 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent"
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), handleAddBenefit())
                        }
                      />
                      <button
                        type="button"
                        onClick={handleAddBenefit}
                        className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-800 px-3 py-2 rounded text-xs text-stone-850 dark:text-stone-200 font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* List View */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {benefits.map((ben, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center gap-4 bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded border border-stone-200 dark:border-stone-800"
                        >
                          <span className="text-xs text-stone-700 dark:text-stone-300 line-clamp-1">
                            {ben}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(idx)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {benefits.length === 0 && (
                        <div className="text-center py-6 text-stone-350 dark:text-stone-600 text-[10px] uppercase tracking-widest font-bold">
                          No marquee items added
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase tracking-widest text-[#cb2026] font-bold block">
                      What We Offer Cards
                    </span>

                    {/* Add Input */}
                    <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1E1E21]/50 p-3 rounded space-y-2 shadow-sm">
                      <input
                        type="text"
                        placeholder="Card Title (e.g., In-house project managers)"
                        value={newFeatureTitle}
                        onChange={(e) => setNewFeatureTitle(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-3 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#cb2026]"
                      />
                      <textarea
                        placeholder="Card Description (explanatory summary text)"
                        value={newFeatureDesc}
                        onChange={(e) => setNewFeatureDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-3 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#cb2026] resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="w-full flex items-center justify-center gap-1.5 bg-[#cb2026] hover:bg-[#df383e] text-white py-2 rounded text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Offer Card</span>
                      </button>
                    </div>

                    {/* List View */}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-50 dark:bg-[#1E1E21]/50 p-3 rounded border border-stone-200 dark:border-stone-800 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-[#cb2026] font-bold uppercase tracking-wider">
                              Offer Card 0{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(idx)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={feat.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFeatures((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, title: val } : f)),
                                );
                              }}
                              placeholder="Offer Card Title"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-205 dark:border-stone-800 rounded px-2.5 py-1 text-xs text-stone-900 dark:text-white outline-none focus:border-[#cb2026]/45 font-semibold"
                            />
                            <textarea
                              value={feat.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFeatures((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, description: val } : f)),
                                );
                              }}
                              placeholder="Offer Card Description"
                              rows={2}
                              className="w-full bg-white dark:bg-stone-900 border border-stone-205 dark:border-stone-800 rounded px-2.5 py-1 text-xs text-stone-850 dark:text-stone-300 outline-none focus:border-[#cb2026]/45 resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                      {features.length === 0 && (
                        <div className="text-center py-6 text-stone-350 dark:text-stone-600 text-[10px] uppercase tracking-widest font-bold">
                          No offer cards configured
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.form>
            )}

            {!selectedService && !isAddingNew && (
              <div className="border border-dashed border-stone-200 dark:border-stone-850 p-8 rounded-xl text-center text-stone-400 dark:text-stone-600 text-xs py-20 font-display uppercase tracking-widest bg-white dark:bg-[#141416] shadow-sm">
                Please select a service from the sidebar or click "Add New Service" to start.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
