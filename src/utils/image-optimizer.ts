/**
 * Automatically compress and optimize images in the browser before uploading to Supabase.
 * Reduces 5MB-15MB raw images down to ~150KB-250KB while maintaining crisp retina quality.
 * Prevents Supabase Storage bandwidth / egress quotas from being exceeded.
 */
export async function optimizeImageBeforeUpload(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85
): Promise<File> {
  // If not an image (e.g. PDF), return original
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Scale down if dimensions exceed maximum
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = height;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format (prefer WebP)
      const outputType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compressed blob is somehow larger, keep original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const optimizedFile = new File([blob], `${baseName}.webp`, {
            type: outputType,
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
