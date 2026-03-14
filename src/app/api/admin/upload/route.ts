import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { db, getUserBySupabaseId } from "@/server/db";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload
 * Admin-only file upload for tool logos and screenshots.
 * Accepts multipart form data with:
 *   - "file": the image file
 *   - "type": "logo" | "screenshot"
 *   - "toolSlug": the tool's slug (for organizing files)
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check — must be admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserBySupabaseId(user.id);
    if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = formData.get("type") as string | null; // "logo" | "screenshot"
    const toolSlug = formData.get("toolSlug") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for screenshots, 5MB for logos)
    const maxSize = uploadType === "screenshot" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${uploadType === "screenshot" ? "10MB" : "5MB"}.` },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine extension and path
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1] === "svg+xml" ? "svg" : file.type.split("/")[1];
    const suffix = Math.random().toString(36).substring(2, 10);
    const folder = uploadType === "screenshot" ? "screenshots" : "logos";
    const slugPart = toolSlug ? `${toolSlug}-` : "";
    const key = `tools/${folder}/${slugPart}${suffix}.${ext}`;

    // Upload to Supabase Storage using service role key
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Ensure bucket exists
    const bucketName = "tool-assets";
    const { data: buckets } = await serviceClient.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);
    if (!bucketExists) {
      await serviceClient.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
      });
    }

    const { error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = serviceClient.storage
      .from(bucketName)
      .getPublicUrl(key);

    const url = publicUrlData.publicUrl;

    return NextResponse.json({ url, key, type: uploadType });
  } catch (error) {
    console.error("Admin upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
