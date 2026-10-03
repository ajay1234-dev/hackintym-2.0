import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = url.substring(uploadIndex + 8);
    const parts = pathAfterUpload.split("/");
    const cleanParts: string[] = [];
    let pastVersionOrTransform = false;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!pastVersionOrTransform) {
        if (/^v\d+$/.test(part)) {
          pastVersionOrTransform = true;
          continue;
        }
        if (
          part.includes(",") ||
          part.startsWith("c_") ||
          part.startsWith("w_") ||
          part.startsWith("h_") ||
          part.startsWith("q_")
        ) {
          continue;
        }
        pastVersionOrTransform = true;
        cleanParts.push(part);
      } else {
        cleanParts.push(part);
      }
    }

    const fullPublicIdWithExt = cleanParts.join("/");
    const lastDotIndex = fullPublicIdWithExt.lastIndexOf(".");
    if (lastDotIndex > 0) {
      return fullPublicIdWithExt.substring(0, lastDotIndex);
    }
    return fullPublicIdWithExt || null;
  } catch (err) {
    console.error("Error extracting public_id:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { success: true, message: "No photo URL provided to delete." },
        { status: 200 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = (
      process.env.CLOUDINARY_API_KEY ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    )?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    let cloudDeleted = false;
    let cloudMessage = "Photo removed.";

    const publicId = extractCloudinaryPublicId(avatarUrl);

    if (publicId && cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

        const formData = new URLSearchParams();
        formData.append("public_id", publicId);
        formData.append("timestamp", String(timestamp));
        formData.append("api_key", apiKey);
        formData.append("signature", signature);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          {
            method: "POST",
            body: formData,
          }
        );

        const cloudData = await cloudRes.json();
        if (cloudRes.ok && (cloudData.result === "ok" || cloudData.result === "not found")) {
          cloudDeleted = true;
          cloudMessage = "Photo removed and deleted from cloud storage.";
        } else {
          console.warn("Cloudinary destroy response:", cloudData);
          cloudMessage = `Photo removed from profile (${cloudData.result || "cloud response recorded"}).`;
        }
      } catch (cloudErr) {
        console.error("Error communicating with Cloudinary destroy API:", cloudErr);
        cloudMessage = "Photo removed from team profile.";
      }
    } else if (publicId && (!apiKey || !apiSecret)) {
      cloudMessage = "Photo removed from team profile. (Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local to also auto-destroy in cloud storage).";
    }

    return NextResponse.json({
      success: true,
      cloudDeleted,
      publicId,
      message: cloudMessage,
    });
  } catch (err: any) {
    console.error("API remove-photo error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
