export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, "application/zip", "application/x-zip-compressed"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for product files

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "image" or "file"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isProductFile = type === "file";
    const allowedTypes = isProductFile ? ALLOWED_FILE_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isProductFile ? MAX_FILE_SIZE : MAX_IMAGE_SIZE;
    const bucketName = "marketplace";

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const suffix = Math.random().toString(36).substring(2, 10);
    const folder = isProductFile ? "files" : "images";
    const key = `${folder}/${user.id}-${Date.now()}-${suffix}.${ext}`;

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Ensure bucket exists
    const { data: buckets } = await serviceClient.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);
    if (!bucketExists) {
      await serviceClient.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
      });
    }

    const { error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Marketplace upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed: " + uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = serviceClient.storage
      .from(bucketName)
      .getPublicUrl(key);

    return NextResponse.json({ url: publicUrlData.publicUrl, key });
  } catch (error) {
    console.error("Marketplace upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
