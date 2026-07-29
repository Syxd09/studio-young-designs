/**
 * Page Hero Banners Manager — /admin/banners
 * Allows admin to upload and customize hero background images for About Us, Services, Portfolio, Journal & Home.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { Upload, Save, Image as ImageIcon, Loader2, RefreshCw, Eye } from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about.jpg";
import svcKitchen from "@/assets/service-kitchen.jpg";
import svcWardrobe from "@/assets/service-wardrobe.jpg";

export const Route = createFileRoute("/admin/banners")({
  component: PageBannersComponent,
});

interface BannerConfig {
  key: string;
  pageName: string;
  pagePath: string;
  subtitle: string;
  defaultImage: string;
  keysToUpdate: string[];
}

const PAGES_CONFIG: BannerConfig[] = [
  {
    key: "about_hero",
    pageName: "About Us Page Hero",
    pagePath: "/about",
    subtitle: "Hero header banner displayed at the top of the About Us page.",
    defaultImage: aboutImg,
    keysToUpdate: ["about_hero_bg", "about_img"],
  },
  {
    key: "services_hero",
    pageName: "Services Page Hero",
    pagePath: "/services",
    subtitle: "Hero header banner displayed at the top of the Services page.",
    defaultImage: heroImg,
    keysToUpdate: ["services_hero_bg", "services_img"],
  },
  {
    key: "portfolio_hero",
    pageName: "Portfolio Page Hero",
    pagePath: "/portfolio",
    subtitle: "Hero header banner displayed at the top of the Portfolio page.",
    defaultImage: svcKitchen,
    keysToUpdate: ["portfolio_hero_bg", "portfolio_img"],
  },
  {
    key: "journal_hero",
    pageName: "Journal Page Hero",
    pagePath: "/journal",
    subtitle: "Hero header banner displayed at the top of the Journal page.",
    defaultImage: svcWardrobe,
    keysToUpdate: ["journal_hero_bg", "journal_img"],
  },
  {
    key: "home_hero",
    pageName: "Home Page Hero",
    pagePath: "/",
    subtitle: "Main hero background displayed at the top of the Home page.",
    defaultImage: heroImg,
    keysToUpdate: ["hero_bg", "home_hero_bg"],
  },
];

function PageBannersComponent() {
  const queryClient = useQueryClient();

  const { data: layoutImages = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["layout_images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("layout_images").select("key, image_url");
      if (error) throw error;
      return (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.image_url }), {});
    },
  });

  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (layoutImages) {
      setImageMap(layoutImages);
    }
  }, [layoutImages]);

  const handleFileChange = async (file: File, banner: BannerConfig) => {
    if (!file) return;
    setUploadingKey(banner.key);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `banner_${banner.key}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("layout-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        // Try fallback bucket if layout-images doesn't exist
        const { error: fallbackError } = await supabase.storage
          .from("site-assets")
          .upload(fileName, file, { upsert: true });
        if (fallbackError) throw uploadError;

        const { data: publicData } = supabase.storage.from("site-assets").getPublicUrl(fileName);
        updateLocalImage(banner, publicData.publicUrl);
      } else {
        const { data: publicData } = supabase.storage.from("layout-images").getPublicUrl(fileName);
        updateLocalImage(banner, publicData.publicUrl);
      }

      toast.success(`Image uploaded for ${banner.pageName}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to upload image. You can also paste an image URL.");
    } finally {
      setUploadingKey(null);
    }
  };

  const updateLocalImage = (banner: BannerConfig, url: string) => {
    setImageMap((prev) => {
      const next = { ...prev };
      banner.keysToUpdate.forEach((k) => {
        next[k] = url;
      });
      return next;
    });
  };

  const handleSaveBanner = async (banner: BannerConfig) => {
    const url = imageMap[banner.keysToUpdate[0]] || imageMap[banner.keysToUpdate[1]];

    if (!url) {
      toast.error("Please upload or enter an image URL first.");
      return;
    }

    setSavingKey(banner.key);

    try {
      const payload = banner.keysToUpdate.map((k) => ({
        key: k,
        image_url: url,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("layout_images").upsert(payload, { onConflict: "key" });

      if (error) throw error;

      toast.success(`${banner.pageName} background updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["layout_images"] });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to save banner image.");
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#cb2026]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#cb2026]">
            <ImageIcon size={14} />
            <span>Page Banner Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-stone-900 dark:text-white mt-1">
            Page Hero Banners
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
            Upload and customize the background hero images displayed at the top of About Us,
            Services, Portfolio, Journal, and Home pages.
          </p>
        </div>

        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["layout_images"] })}
          className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid of Page Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PAGES_CONFIG.map((banner) => {
          const currentUrl =
            imageMap[banner.keysToUpdate[0]] ||
            imageMap[banner.keysToUpdate[1]] ||
            banner.defaultImage;

          const isUploading = uploadingKey === banner.key;
          const isSaving = savingKey === banner.key;

          return (
            <div
              key={banner.key}
              className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141416] rounded-xl p-6 shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <span>{banner.pageName}</span>
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {banner.subtitle}
                    </p>
                  </div>
                  <a
                    href={banner.pagePath}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#cb2026] hover:underline"
                  >
                    <Eye size={12} />
                    <span>View Page</span>
                  </a>
                </div>

                {/* Banner Preview Frame */}
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-900 group">
                  <img
                    src={currentUrl}
                    alt={banner.pageName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Hero Banner Preview
                    </span>
                  </div>
                </div>

                {/* File Upload & URL Input */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1.5">
                      Upload New Image File
                    </label>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:border-[#cb2026] dark:hover:border-[#cb2026] p-3 rounded-lg cursor-pointer transition-colors text-xs text-stone-600 dark:text-stone-300 font-medium">
                      {isUploading ? (
                        <>
                          <Loader2 size={15} className="animate-spin text-[#cb2026]" />
                          <span>Uploading Image...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={15} className="text-[#cb2026]" />
                          <span>Choose image file from computer</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(file, banner);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
                      Or Image Direct URL
                    </label>
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => updateLocalImage(banner, e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#cb2026]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-850">
                <button
                  type="button"
                  disabled={isSaving || isUploading}
                  onClick={() => handleSaveBanner(banner)}
                  className="w-full flex items-center justify-center gap-2 bg-[#cb2026] hover:bg-[#df383e] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Banner...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Banner Background</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
