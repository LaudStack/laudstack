"use server";
import { db } from "@/server/db";
import { toolSubmissions, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendToolSubmissionEmail, sendAdminNewSubmissionAlert } from "@/server/email";
import { notifyAdmins } from "@/app/actions/notifications";
import { requireAuth } from "@/lib/admin-auth";

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
  let dbUser;
  try {
    dbUser = await requireAuth();
  } catch {
    return { success: false, error: "You must be signed in to submit a product." };
  }

  // 2. Require email verification for launching a stack
  if (!dbUser.emailVerified) {
    return { success: false, error: "EMAIL_NOT_VERIFIED", message: "Please verify your email to launch a stack." } as any;
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

    // N6: Send confirmation email to the founder
    if (dbUser.email) {
      const tempSlug = formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      sendToolSubmissionEmail(
        dbUser.email,
        formData.name.trim(),
        tempSlug
      ).catch((e) => console.error("[submitTool] email error:", e));
    }

    // Admin notification: new tool submission (email + in-app)
    sendAdminNewSubmissionAlert({
      toolName: formData.name.trim(),
      founderName: formData.founderName?.trim() || dbUser.name || "",
      founderEmail: dbUser.email || "",
      category: formData.category || "Uncategorized",
      submissionId: submission.id,
    }).catch((e) => console.error("[submitTool] admin alert error:", e));

    notifyAdmins({
      type: "new_submission",
      title: "New tool submission",
      message: `${dbUser.name || dbUser.email || "A user"} submitted "${formData.name.trim()}" for review.`,
      link: "/ops-console/stacks/launches",
      actorId: dbUser.id,
    }).catch((e) => console.error("[submitTool] admin in-app notification error:", e));

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
