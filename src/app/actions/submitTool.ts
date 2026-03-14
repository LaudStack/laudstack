"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getUserBySupabaseId } from "@/server/db";
import { db } from "@/server/db";
import { toolSubmissions, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export interface ToolFormData {
  name: string;
  tagline: string;
  website: string;
  description: string;
  logo: string;
  launchDate: string;
  category: string;
  tags: string[];
  pricingModel: string;
  plans: Array<{ name: string; price: string; period: string; features: string }>;
  screenshots: string[];
  demoVideo: string;
  verifyMethod: string;
  verifyEmail: string;
  verifyCode: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderLinkedin: string;
  agreedToTerms: boolean;
}

export interface SubmitToolResult {
  success: boolean;
  submissionId?: number;
  verificationToken?: string;
  error?: string;
}

/**
 * Server action: submit a new tool listing.
 * - Saves all form data to the product_submissions table
 * - Updates the user's founderStatus to 'pending'
 * - Generates a verification token for ownership proof
 * - Returns the submission ID and verification token
 */
export async function submitTool(formData: ToolFormData): Promise<SubmitToolResult> {
  // 1. Authenticate the user
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) {
    return { success: false, error: "You must be signed in to submit a product." };
  }

  // 2. Get the DB user record
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  if (!dbUser) {
    return { success: false, error: "User account not found. Please try signing out and back in." };
  }

  // 3. Validate required fields server-side
  if (!formData.name?.trim()) return { success: false, error: "Tool name is required." };
  if (!formData.tagline?.trim()) return { success: false, error: "Tagline is required." };
  if (!formData.website?.trim()) return { success: false, error: "Website URL is required." };
  if (!formData.description?.trim() || formData.description.length < 50) {
    return { success: false, error: "Description must be at least 50 characters." };
  }
  if (!formData.agreedToTerms) {
    return { success: false, error: "You must agree to the Terms of Service." };
  }

  // 4. Generate a unique verification token for ownership proof
  const verificationToken = `laudstack-verify-${crypto.randomBytes(16).toString("hex")}`;

  try {
    // 5. Insert the product submission record
    const [submission] = await db
      .insert(toolSubmissions)
      .values({
        userId: dbUser.id,
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        website: formData.website.trim(),
        description: formData.description.trim(),
        logoUrl: formData.logo?.trim() || null,
        launchDate: formData.launchDate ? new Date(formData.launchDate) : null,
        category: formData.category || null,
        tags: formData.tags?.length ? JSON.stringify(formData.tags) : null,
        pricingModel: formData.pricingModel || null,
        pricingPlans: formData.plans?.length ? JSON.stringify(formData.plans) : null,
        screenshots: formData.screenshots?.filter(Boolean).length
          ? JSON.stringify(formData.screenshots.filter(Boolean))
          : null,
        demoVideoUrl: formData.demoVideo?.trim() || null,
        verifyMethod: formData.verifyMethod || "meta",
        verifyEmail: formData.verifyEmail?.trim() || null,
        verificationToken,
        founderName: formData.founderName?.trim() || null,
        founderRole: formData.founderRole?.trim() || null,
        founderBio: formData.founderBio?.trim() || null,
        founderLinkedin: formData.founderLinkedin?.trim() || null,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: toolSubmissions.id });

    // 6. Update the user's founderStatus to 'pending'
    await db
      .update(users)
      .set({
        founderStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));

    return {
      success: true,
      submissionId: submission.id,
      verificationToken,
    };
  } catch (err) {
    console.error("[submitTool] DB error:", err);
    return {
      success: false,
      error: "Failed to save your submission. Please try again.",
    };
  }
}
