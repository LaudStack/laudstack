import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── R2 client (lazy singleton) ──────────────────────────────────────────────

let _r2: S3Client | null = null;

function getR2(): S3Client {
  if (!_r2) {
    _r2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return _r2;
}

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "laudstack";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Upload a file to Cloudflare R2.
 * Returns the public URL of the uploaded file.
 */
export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await getR2().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  const url = `${PUBLIC_URL}/${key}`;
  return { key, url };
}

/**
 * Get a presigned URL for private file access.
 * Use this for private buckets. For public buckets, use the PUBLIC_URL directly.
 */
export async function storageGet(
  key: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const url = await getSignedUrl(
    getR2(),
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
  return { key, url };
}

/**
 * Delete a file from Cloudflare R2.
 */
export async function storageDelete(key: string): Promise<void> {
  await getR2().send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Generate a random suffix for file keys to prevent enumeration.
 */
export function randomSuffix(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
