"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { tools, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ─── submitTool ───────────────────────────────────────────────────────────────

export interface SubmitToolInput {
  name: string;
  tagline: string;
  websiteUrl: string;
  description: string;
  category: string;
  pricingModel: "Free" | "Freemium" | "Paid" | "Free Trial" | "Open Source";
  tags?: string[];
}

export async function submitTool(
  input: SubmitToolInput
): Promise<{ success: boolean; error?: string; toolId?: number }> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "You must be signed in to launch a product." };
    }

    // Look up our internal user record
    const [dbUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.supabaseId, authUser.id))
      .limit(1);

    if (!dbUser) {
      return { success: false, error: "User account not found. Please try again." };
    }

    // Validate required fields
    if (!input.name?.trim()) return { success: false, error: "Tool name is required." };
    if (!input.tagline?.trim()) return { success: false, error: "Tagline is required." };
    if (!input.websiteUrl?.trim()) return { success: false, error: "Website URL is required." };
    if (!input.description?.trim()) return { success: false, error: "Description is required." };
    if (!input.category?.trim()) return { success: false, error: "Category is required." };

    // Generate a unique slug
    const baseSlug = toSlug(input.name);
    const suffix = Math.random().toString(36).slice(2, 7);
    const slug = `${baseSlug}-${suffix}`;

    // Insert into DB with status = "pending" (requires admin approval)
    const [inserted] = await db
      .insert(tools)
      .values({
        slug,
        name: input.name.trim(),
        tagline: input.tagline.trim(),
        description: input.description.trim(),
        websiteUrl: input.websiteUrl.trim(),
        category: input.category,
        pricingModel: input.pricingModel,
        tags: input.tags ?? [],
        submittedBy: dbUser.id,
        status: "pending",
      })
      .returning({ id: tools.id });

    return { success: true, toolId: inserted.id };
  } catch (err) {
    console.error("[submitTool]", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
