/**
 * Cloudinary Upload Helper
 * Handles direct browser upload to Cloudinary.
 * If Cloudinary keys are not yet configured in .env.local, provides an
 * instant client-side compressed Data URL fallback that saves directly to Firebase.
 */

export async function uploadImageToCloudinary(file: File): Promise<{
  url: string;
  source: "cloudinary" | "local_fallback";
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hackintime";

  if (cloudName && cloudName.trim()) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset.trim());

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          return { url: data.secure_url, source: "cloudinary" };
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn("Cloudinary upload returned non-200, falling back:", err);
      }
    } catch (err) {
      console.warn("Direct Cloudinary upload failed, using fallback:", err);
    }
  }

  // Fallback: Compress image to small square web-ready data-URL
  const dataUrl = await compressImageToDataUrl(file, 400, 400, 0.82);
  return { url: dataUrl, source: "local_fallback" };
}

/**
 * Client-side canvas compression helper for instant responsive avatars
 */
function compressImageToDataUrl(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
