/**
 * Category & Tag Audit Migration Script
 * 
 * Fixes:
 * 1. Category misclassifications (Descript → AI Video)
 * 2. Duplicate entries (hide Jasper id:41, HubSpot id:42)
 * 3. Add accurate, specific tags to ALL 44 tools
 */

const SUPABASE_URL = 'https://ehnlovnzpfvaxwwmgppj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmxvdm56cGZ2YXh3d21ncHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI1NDE2OCwiZXhwIjoyMDg4ODMwMTY4fQ.aCOyOrFHgQ2r25KdYN9xhMbuwR3-M-HeK0maqRl5-xo';

// ─── All tag + category corrections ─────────────────────────────────────────
// Each entry: { id, changes: { category?, tags?, is_visible? } }
const CORRECTIONS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY FIXES
  // ═══════════════════════════════════════════════════════════════════════════

  // Descript: "AI Audio" → "AI Video" (primarily video+podcast editing)
  {
    id: 27,
    name: "Descript",
    changes: {
      category: "AI Video",
      tags: ["video editing", "podcast editing", "transcription", "screen recording", "AI editing", "audio editing", "content creation"],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DUPLICATE FIXES — hide the duplicate entries
  // ═══════════════════════════════════════════════════════════════════════════

  // Jasper (id:41) is a duplicate of Jasper AI (id:1) — hide id:41
  {
    id: 41,
    name: "Jasper (DUPLICATE)",
    changes: {
      is_visible: false,
    },
  },

  // HubSpot (id:42) in Marketing is a duplicate of HubSpot CRM (id:14) — hide id:42
  {
    id: 42,
    name: "HubSpot (DUPLICATE)",
    changes: {
      is_visible: false,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAG ADDITIONS — accurate, specific tags for every tool
  // ═══════════════════════════════════════════════════════════════════════════

  // --- AI Analytics ---
  {
    id: 18,
    name: "Amplitude",
    changes: {
      tags: ["product analytics", "user behavior", "data analytics", "A/B testing", "cohort analysis", "event tracking", "digital analytics"],
    },
  },
  {
    id: 17,
    name: "Mixpanel",
    changes: {
      tags: ["product analytics", "event tracking", "user engagement", "funnel analysis", "retention analysis", "data visualization", "behavioral analytics"],
    },
  },

  // --- AI Audio ---
  {
    id: 26,
    name: "ElevenLabs",
    changes: {
      tags: ["voice synthesis", "text to speech", "voice cloning", "AI voice", "audio generation", "dubbing", "speech AI"],
    },
  },

  // --- AI Code ---
  {
    id: 11,
    name: "Cursor",
    changes: {
      tags: ["AI code editor", "code completion", "pair programming", "VS Code", "code generation", "developer productivity", "IDE"],
    },
  },
  {
    id: 10,
    name: "GitHub Copilot",
    changes: {
      tags: ["AI pair programmer", "code completion", "code suggestions", "GitHub", "developer tools", "code generation", "IDE extension"],
    },
  },

  // --- AI Image ---
  {
    id: 7,
    name: "Leonardo AI",
    changes: {
      tags: ["AI image generation", "game assets", "concept art", "image editing", "creative AI", "art generation", "visual design"],
    },
  },
  {
    id: 6,
    name: "Midjourney",
    changes: {
      tags: ["AI image generation", "text to image", "digital art", "creative AI", "art generation", "illustration", "visual design"],
    },
  },

  // --- AI Productivity ---
  {
    id: 39,
    name: "ChatGPT",
    changes: {
      tags: ["AI chatbot", "conversational AI", "text generation", "code generation", "writing assistant", "question answering", "OpenAI"],
    },
  },
  {
    id: 38,
    name: "Claude by Anthropic",
    changes: {
      tags: ["AI chatbot", "conversational AI", "text analysis", "code generation", "writing assistant", "research assistant", "Anthropic"],
    },
  },
  {
    id: 36,
    name: "Loom",
    changes: {
      tags: ["video messaging", "screen recording", "async communication", "team collaboration", "video sharing", "remote work", "presentations"],
    },
  },
  {
    id: 40,
    name: "Notion",
    changes: {
      tags: ["workspace", "notes", "wiki", "project management", "documentation", "knowledge base", "team collaboration", "AI writing"],
    },
  },
  {
    id: 12,
    name: "Notion AI",
    changes: {
      tags: ["AI writing", "workspace", "note-taking", "AI assistant", "content generation", "summarization", "brainstorming"],
    },
  },
  {
    id: 34,
    name: "Perplexity AI",
    changes: {
      tags: ["AI search", "answer engine", "research assistant", "web search", "citation", "question answering", "knowledge discovery"],
    },
  },

  // --- AI Video ---
  {
    id: 8,
    name: "Runway ML",
    changes: {
      tags: ["AI video generation", "video editing", "text to video", "motion graphics", "visual effects", "creative AI", "film production"],
    },
  },
  {
    id: 9,
    name: "Synthesia",
    changes: {
      tags: ["AI video generation", "text to video", "AI avatars", "training videos", "corporate video", "video presentations", "multilingual"],
    },
  },

  // --- AI Writing ---
  {
    id: 2,
    name: "Copy.ai",
    changes: {
      tags: ["AI writing", "marketing copy", "content generation", "copywriting", "social media", "email marketing", "ad copy"],
    },
  },
  {
    id: 4,
    name: "Grammarly",
    changes: {
      tags: ["grammar checker", "writing assistant", "proofreading", "spell check", "tone detection", "plagiarism detection", "business writing"],
    },
  },
  {
    id: 1,
    name: "Jasper AI",
    changes: {
      tags: ["AI content creation", "marketing copy", "blog writing", "ad copy", "brand voice", "enterprise content", "SEO writing"],
    },
  },
  {
    id: 5,
    name: "Sudowrite",
    changes: {
      tags: ["fiction writing", "creative writing", "AI storytelling", "novel writing", "brainstorming", "scene expansion", "writing partner"],
    },
  },
  {
    id: 3,
    name: "Writesonic",
    changes: {
      tags: ["AI writing", "SEO content", "blog posts", "ad copy", "product descriptions", "landing pages", "content marketing"],
    },
  },

  // --- CRM ---
  {
    id: 14,
    name: "HubSpot CRM",
    changes: {
      tags: ["CRM", "sales automation", "contact management", "deal tracking", "email tracking", "marketing automation", "pipeline management"],
    },
  },
  {
    id: 43,
    name: "Pipedrive",
    changes: {
      tags: ["CRM", "sales pipeline", "deal management", "sales automation", "lead management", "activity tracking", "sales forecasting"],
    },
  },

  // --- Customer Support ---
  {
    id: 19,
    name: "Intercom",
    changes: {
      tags: ["customer support", "live chat", "AI chatbot", "help desk", "customer engagement", "in-app messaging", "knowledge base"],
    },
  },
  {
    id: 20,
    name: "Zendesk",
    changes: {
      tags: ["customer support", "help desk", "ticketing system", "live chat", "knowledge base", "customer service", "AI support"],
    },
  },

  // --- Design ---
  {
    id: 15,
    name: "Canva",
    changes: {
      tags: ["graphic design", "social media design", "presentations", "templates", "photo editing", "brand kit", "visual content"],
    },
  },
  {
    id: 16,
    name: "Figma",
    changes: {
      tags: ["UI design", "UX design", "prototyping", "collaborative design", "design system", "wireframing", "interface design"],
    },
  },

  // --- Developer Tools ---
  {
    id: 37,
    name: "Datadog",
    changes: {
      tags: ["cloud monitoring", "APM", "log management", "infrastructure monitoring", "observability", "security monitoring", "DevOps"],
    },
  },
  {
    id: 24,
    name: "Supabase",
    changes: {
      tags: ["backend as a service", "PostgreSQL", "authentication", "real-time database", "edge functions", "open source", "Firebase alternative"],
    },
  },
  {
    id: 23,
    name: "Vercel",
    changes: {
      tags: ["frontend hosting", "serverless", "edge computing", "CI/CD", "Next.js", "web deployment", "developer platform"],
    },
  },

  // --- E-commerce ---
  {
    id: 25,
    name: "Shopify",
    changes: {
      tags: ["e-commerce platform", "online store", "payment processing", "inventory management", "dropshipping", "POS", "retail"],
    },
  },

  // --- Education ---
  {
    id: 33,
    name: "Coursera",
    changes: {
      tags: ["online learning", "courses", "certifications", "university courses", "professional development", "AI courses", "data science"],
    },
  },

  // --- Finance ---
  {
    id: 21,
    name: "Stripe",
    changes: {
      tags: ["payment processing", "billing", "subscriptions", "financial infrastructure", "payment gateway", "invoicing", "fintech"],
    },
  },

  // --- HR & Recruiting ---
  {
    id: 30,
    name: "Rippling",
    changes: {
      tags: ["HR management", "payroll", "benefits administration", "IT management", "employee onboarding", "workforce management", "compliance"],
    },
  },

  // --- Marketing ---
  {
    id: 28,
    name: "Mailchimp",
    changes: {
      tags: ["email marketing", "marketing automation", "email campaigns", "audience management", "landing pages", "newsletters", "small business"],
    },
  },
  {
    id: 29,
    name: "Semrush",
    changes: {
      tags: ["SEO tools", "keyword research", "competitive analysis", "content marketing", "PPC", "backlink analysis", "site audit"],
    },
  },

  // --- Project Management ---
  {
    id: 35,
    name: "Airtable",
    changes: {
      tags: ["low-code platform", "spreadsheet database", "project tracking", "workflow automation", "team collaboration", "app builder", "data management"],
    },
  },
  {
    id: 13,
    name: "ClickUp",
    changes: {
      tags: ["project management", "task management", "team collaboration", "docs", "goals tracking", "time tracking", "agile"],
    },
  },
  {
    id: 22,
    name: "Linear",
    changes: {
      tags: ["issue tracking", "bug tracking", "sprint planning", "software development", "agile", "roadmap", "engineering teams"],
    },
  },

  // --- Sales ---
  {
    id: 31,
    name: "Gong",
    changes: {
      tags: ["revenue intelligence", "conversation analytics", "sales coaching", "deal intelligence", "call recording", "sales forecasting", "AI sales"],
    },
  },

  // --- Security ---
  {
    id: 32,
    name: "1Password",
    changes: {
      tags: ["password manager", "credential management", "team security", "single sign-on", "secrets management", "enterprise security", "identity"],
    },
  },
  {
    id: 44,
    name: "Snyk",
    changes: {
      tags: ["developer security", "vulnerability scanning", "open source security", "container security", "SAST", "DevSecOps", "code security"],
    },
  },
];

// ─── Execute migrations ─────────────────────────────────────────────────────
async function updateTool(id, changes, name) {
  const body = {};
  if (changes.category !== undefined) body.category = changes.category;
  if (changes.tags !== undefined) body.tags = changes.tags;
  if (changes.is_visible !== undefined) body.is_visible = changes.is_visible;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/tools?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  ❌ FAILED [${id}] ${name}: ${res.status} ${text}`);
    return false;
  }
  
  const changeDesc = [];
  if (changes.category) changeDesc.push(`category→${changes.category}`);
  if (changes.tags) changeDesc.push(`tags(${changes.tags.length})`);
  if (changes.is_visible === false) changeDesc.push("HIDDEN (duplicate)");
  
  console.log(`  ✅ [${id}] ${name}: ${changeDesc.join(", ")}`);
  return true;
}

async function main() {
  console.log(`\n🔧 Category & Tag Audit Migration`);
  console.log(`   ${CORRECTIONS.length} tools to update\n`);

  let success = 0;
  let failed = 0;

  for (const { id, name, changes } of CORRECTIONS) {
    const ok = await updateTool(id, changes, name);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n📊 Results: ${success} succeeded, ${failed} failed out of ${CORRECTIONS.length}`);

  // Verify by fetching a few corrected tools
  console.log("\n🔍 Verification — spot-checking corrected tools:\n");
  const spotChecks = [27, 21, 39, 41, 42]; // Descript, Stripe, ChatGPT, Jasper dup, HubSpot dup
  for (const id of spotChecks) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tools?id=eq.${id}&select=id,name,category,tags,is_visible`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const [tool] = await res.json();
    if (tool) {
      const tags = Array.isArray(tool.tags) ? tool.tags.join(", ") : "(none)";
      console.log(`  [${tool.id}] ${tool.name} | ${tool.category} | visible:${tool.is_visible}`);
      console.log(`      Tags: ${tags}`);
    }
  }
}

main().catch(console.error);
