import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

// Screenshot URL updates
const updates = [
  {
    slug: "cursor",
    screenshot_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/cursor-screenshot_3363c4be.jpeg",
  },
  {
    slug: "perplexity-ai",
    screenshot_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/perplexity-screenshot_8d34c5c4.png",
  },
];

async function updateScreenshot(slug, screenshot_url) {
  const url = `${SUPABASE_URL}/rest/v1/tools?slug=eq.${slug}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ screenshot_url }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  ✗ Failed to update ${slug}: ${res.status} ${text}`);
    return false;
  }

  const data = await res.json();
  if (data.length === 0) {
    console.log(`  ⚠ No tool found with slug "${slug}" — skipping`);
    return false;
  }

  console.log(`  ✓ Updated ${slug} screenshot_url`);
  return true;
}

async function listAllTools() {
  const url = `${SUPABASE_URL}/rest/v1/tools?select=id,slug,name,screenshot_url&order=name.asc`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) {
    console.error("Failed to list tools:", res.status);
    return [];
  }
  return res.json();
}

async function main() {
  console.log("=== LaudStack Screenshot URL Updater ===\n");
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  // First, list all tools to see current state
  console.log("\n--- Current tools in database ---");
  const tools = await listAllTools();
  if (tools.length === 0) {
    console.log("No tools found in database!");
  } else {
    for (const t of tools) {
      const hasScreenshot = t.screenshot_url ? "✓" : "✗";
      console.log(`  [${hasScreenshot}] ${t.name} (${t.slug}) — ${t.screenshot_url || "null"}`);
    }
  }

  // Now apply updates
  console.log("\n--- Applying screenshot updates ---");
  let successCount = 0;
  for (const { slug, screenshot_url } of updates) {
    const ok = await updateScreenshot(slug, screenshot_url);
    if (ok) successCount++;
  }

  console.log(`\nDone! ${successCount}/${updates.length} updates applied.`);

  // Verify
  console.log("\n--- Verification ---");
  const toolsAfter = await listAllTools();
  for (const { slug } of updates) {
    const tool = toolsAfter.find((t) => t.slug === slug);
    if (tool) {
      console.log(`  ${tool.name}: ${tool.screenshot_url || "null"}`);
    } else {
      console.log(`  ${slug}: NOT FOUND in database`);
    }
  }
}

main().catch(console.error);
