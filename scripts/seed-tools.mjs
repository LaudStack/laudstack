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

async function supabaseQuery(table, method, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const opts = {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${table}: ${res.status} ${text}`);
  }
  return res.json();
}

async function checkExisting(slug) {
  const url = `${SUPABASE_URL}/rest/v1/tools?slug=eq.${slug}&select=id`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const data = await res.json();
  return data.length > 0;
}

const tools = [
  {
    slug: "notion",
    name: "Notion",
    tagline: "The connected workspace for docs, wikis, and projects",
    description: "Notion is an all-in-one workspace that combines notes, docs, wikis, project management, and AI-powered writing assistance. Teams use Notion to centralize knowledge, manage projects with Kanban boards and timelines, and collaborate in real time. Notion AI helps draft content, summarize meeting notes, and extract action items — all within the same tool you already work in.",
    logo_url: "https://logo.clearbit.com/notion.so",
    screenshot_url: null,
    website_url: "https://www.notion.so",
    category: "AI Productivity",
    pricing_model: "Freemium",
    tags: ["productivity", "notes", "wiki", "project management", "AI writing"],
    badges: ["Editor's Pick", "Top Rated"],
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_pro: false,
    upvote_count: 342,
    review_count: 87,
    average_rating: 4.7,
    rank_score: 95.2,
    weekly_rank_change: 3,
    launched_at: "2024-06-15T00:00:00Z",
  },
  {
    slug: "clickup",
    name: "ClickUp",
    tagline: "One app to replace them all — tasks, docs, goals, and chat",
    description: "ClickUp is a productivity platform that consolidates tasks, documents, goals, chat, and whiteboards into a single application. With built-in AI features for writing, summarization, and task automation, ClickUp helps teams of all sizes streamline workflows. Its flexible views (list, board, Gantt, calendar) and 1,000+ integrations make it adaptable to any team's process.",
    logo_url: "https://logo.clearbit.com/clickup.com",
    screenshot_url: null,
    website_url: "https://clickup.com",
    category: "AI Productivity",
    pricing_model: "Freemium",
    tags: ["project management", "tasks", "docs", "collaboration", "AI"],
    badges: ["Trending"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 218,
    review_count: 54,
    average_rating: 4.5,
    rank_score: 88.1,
    weekly_rank_change: 7,
    launched_at: "2024-03-20T00:00:00Z",
  },
  {
    slug: "jasper",
    name: "Jasper",
    tagline: "AI copilot for enterprise marketing teams",
    description: "Jasper is an AI marketing platform built for enterprise teams. It generates on-brand content across channels — blog posts, social media, ads, emails, and landing pages — while maintaining your brand voice and style guidelines. With campaign workflows, team collaboration, and analytics built in, Jasper accelerates content production without sacrificing quality or consistency.",
    logo_url: "https://logo.clearbit.com/jasper.ai",
    screenshot_url: null,
    website_url: "https://www.jasper.ai",
    category: "AI Writing",
    pricing_model: "Paid",
    tags: ["AI writing", "marketing", "content generation", "copywriting"],
    badges: ["Top Rated"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 189,
    review_count: 63,
    average_rating: 4.4,
    rank_score: 85.3,
    weekly_rank_change: -2,
    launched_at: "2024-01-10T00:00:00Z",
  },
  {
    slug: "grammarly",
    name: "Grammarly",
    tagline: "AI writing assistance that goes beyond grammar",
    description: "Grammarly is an AI-powered writing assistant used by over 30 million people daily. Beyond grammar and spelling, it offers tone detection, clarity improvements, plagiarism checking, and full-text rewriting. Grammarly works across 500,000+ apps and websites via browser extensions, desktop apps, and API integrations. Enterprise teams use it to maintain consistent communication quality.",
    logo_url: "https://logo.clearbit.com/grammarly.com",
    screenshot_url: null,
    website_url: "https://www.grammarly.com",
    category: "AI Writing",
    pricing_model: "Freemium",
    tags: ["grammar", "writing assistant", "AI", "proofreading", "tone"],
    badges: ["Editor's Pick", "Most Popular"],
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_pro: false,
    upvote_count: 412,
    review_count: 128,
    average_rating: 4.6,
    rank_score: 96.8,
    weekly_rank_change: 1,
    launched_at: "2023-11-05T00:00:00Z",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    tagline: "AI image generation that turns text into stunning visuals",
    description: "Midjourney is a leading AI image generation platform that creates photorealistic and artistic images from text prompts. Used by designers, marketers, and creative professionals, it produces high-quality visuals for branding, concept art, product mockups, and social media content. Its latest model delivers exceptional detail, coherent compositions, and precise text rendering.",
    logo_url: "https://logo.clearbit.com/midjourney.com",
    screenshot_url: null,
    website_url: "https://www.midjourney.com",
    category: "AI Image",
    pricing_model: "Paid",
    tags: ["image generation", "AI art", "design", "creative", "text-to-image"],
    badges: ["Editor's Pick", "Trending"],
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_pro: false,
    upvote_count: 523,
    review_count: 156,
    average_rating: 4.8,
    rank_score: 98.5,
    weekly_rank_change: 5,
    launched_at: "2024-02-14T00:00:00Z",
  },
  {
    slug: "canva",
    name: "Canva",
    tagline: "Design anything, publish anywhere — with AI-powered tools",
    description: "Canva is a visual design platform used by over 190 million people worldwide. Its Magic Studio AI features include text-to-image generation, background removal, Magic Eraser, and AI-powered design suggestions. With thousands of templates for social media, presentations, videos, and print materials, Canva makes professional design accessible to everyone — from students to Fortune 500 marketing teams.",
    logo_url: "https://logo.clearbit.com/canva.com",
    screenshot_url: null,
    website_url: "https://www.canva.com",
    category: "AI Image",
    pricing_model: "Freemium",
    tags: ["design", "graphics", "templates", "AI", "social media"],
    badges: ["Most Popular", "Top Rated"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 387,
    review_count: 142,
    average_rating: 4.7,
    rank_score: 97.1,
    weekly_rank_change: 2,
    launched_at: "2023-09-22T00:00:00Z",
  },
  {
    slug: "synthesia",
    name: "Synthesia",
    tagline: "Create professional AI videos from text in minutes",
    description: "Synthesia is an AI video generation platform that turns text scripts into professional videos with realistic AI avatars. Used by over 50,000 companies including Xerox, Reuters, and Zoom, it supports 140+ languages and 230+ diverse avatars. Teams use it for training videos, product demos, sales enablement, and internal communications — eliminating the need for cameras, studios, or actors.",
    logo_url: "https://logo.clearbit.com/synthesia.io",
    screenshot_url: null,
    website_url: "https://www.synthesia.io",
    category: "AI Video",
    pricing_model: "Paid",
    tags: ["video generation", "AI avatars", "training", "enterprise"],
    badges: ["Trending"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 176,
    review_count: 41,
    average_rating: 4.3,
    rank_score: 82.4,
    weekly_rank_change: 12,
    launched_at: "2024-08-01T00:00:00Z",
  },
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    tagline: "The most realistic AI voice generation and cloning platform",
    description: "ElevenLabs is an AI audio platform that generates human-quality speech in 32 languages. Its voice cloning technology can replicate any voice from a short sample, while its text-to-speech API powers audiobooks, podcasts, video narration, and accessibility features. Used by media companies, game studios, and content creators, ElevenLabs sets the standard for natural-sounding AI voices.",
    logo_url: "https://logo.clearbit.com/elevenlabs.io",
    screenshot_url: null,
    website_url: "https://elevenlabs.io",
    category: "AI Audio",
    pricing_model: "Freemium",
    tags: ["text-to-speech", "voice cloning", "AI audio", "podcasts"],
    badges: ["Editor's Pick", "Top Rated"],
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_pro: false,
    upvote_count: 298,
    review_count: 89,
    average_rating: 4.8,
    rank_score: 94.7,
    weekly_rank_change: 8,
    launched_at: "2024-04-18T00:00:00Z",
  },
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "The AI-first code editor built for pair programming with AI",
    description: "Cursor is an AI-powered code editor forked from VS Code that deeply integrates AI into every part of the development workflow. It offers intelligent code completion, multi-file editing, codebase-aware chat, and natural language code generation. Developers use Cursor to write, refactor, debug, and understand code faster — with context from their entire project, documentation, and git history.",
    logo_url: "https://logo.clearbit.com/cursor.com",
    screenshot_url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/cursor-screenshot_3363c4be.jpeg",
    website_url: "https://www.cursor.com",
    category: "AI Code",
    pricing_model: "Freemium",
    tags: ["code editor", "AI coding", "developer tools", "pair programming"],
    badges: ["Editor's Pick", "Trending", "Top Rated"],
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_pro: false,
    upvote_count: 567,
    review_count: 203,
    average_rating: 4.9,
    rank_score: 99.1,
    weekly_rank_change: 4,
    launched_at: "2024-05-10T00:00:00Z",
  },
  {
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "Your AI pair programmer — code suggestions in real time",
    description: "GitHub Copilot is an AI coding assistant that provides real-time code suggestions directly in your editor. Powered by OpenAI models and trained on billions of lines of code, it autocompletes functions, generates boilerplate, writes tests, and explains complex code. Available in VS Code, JetBrains, Neovim, and GitHub.com, Copilot is used by over 1.8 million developers and 77,000 organizations.",
    logo_url: "https://logo.clearbit.com/github.com",
    screenshot_url: null,
    website_url: "https://github.com/features/copilot",
    category: "AI Code",
    pricing_model: "Paid",
    tags: ["AI coding", "code completion", "developer tools", "GitHub"],
    badges: ["Most Popular"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 445,
    review_count: 167,
    average_rating: 4.6,
    rank_score: 95.8,
    weekly_rank_change: -1,
    launched_at: "2023-07-15T00:00:00Z",
  },
  {
    slug: "amplitude",
    name: "Amplitude",
    tagline: "Digital analytics platform with AI-powered product insights",
    description: "Amplitude is a digital analytics platform that helps product and growth teams understand user behavior. Its AI features automatically surface anomalies, predict churn, recommend experiments, and generate natural-language insights from complex data. With behavioral cohorts, funnel analysis, and A/B testing built in, Amplitude powers data-driven decisions at companies like Walmart, NBC, and Burger King.",
    logo_url: "https://logo.clearbit.com/amplitude.com",
    screenshot_url: null,
    website_url: "https://amplitude.com",
    category: "AI Analytics",
    pricing_model: "Freemium",
    tags: ["analytics", "product analytics", "AI insights", "user behavior"],
    badges: [],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 134,
    review_count: 38,
    average_rating: 4.4,
    rank_score: 80.2,
    weekly_rank_change: 0,
    launched_at: "2024-01-25T00:00:00Z",
  },
  {
    slug: "figma",
    name: "Figma",
    tagline: "Collaborative interface design tool with AI-powered features",
    description: "Figma is the industry-standard collaborative design tool for UI/UX teams. Its AI features include auto-layout suggestions, design-to-code generation, and intelligent component recommendations. With real-time multiplayer editing, a robust component system, prototyping, and developer handoff, Figma streamlines the entire design workflow from ideation to production. Used by teams at Google, Microsoft, and Airbnb.",
    logo_url: "https://logo.clearbit.com/figma.com",
    screenshot_url: null,
    website_url: "https://www.figma.com",
    category: "Design",
    pricing_model: "Freemium",
    tags: ["UI design", "UX", "prototyping", "collaboration", "design system"],
    badges: ["Editor's Pick", "Most Popular"],
    status: "approved",
    is_featured: true,
    is_verified: true,
    is_pro: false,
    upvote_count: 489,
    review_count: 178,
    average_rating: 4.8,
    rank_score: 98.2,
    weekly_rank_change: 1,
    launched_at: "2023-10-01T00:00:00Z",
  },
  {
    slug: "semrush",
    name: "Semrush",
    tagline: "All-in-one marketing toolkit with AI-powered SEO and content",
    description: "Semrush is a comprehensive digital marketing platform used by over 10 million marketers. It combines SEO, content marketing, competitor analysis, PPC, and social media management in one toolkit. AI features include keyword clustering, content optimization scoring, automated site audits, and AI writing assistance. Trusted by 30% of Fortune 500 companies for search visibility and competitive intelligence.",
    logo_url: "https://logo.clearbit.com/semrush.com",
    screenshot_url: null,
    website_url: "https://www.semrush.com",
    category: "Marketing",
    pricing_model: "Paid",
    tags: ["SEO", "marketing", "content", "competitor analysis", "PPC"],
    badges: ["Top Rated"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 267,
    review_count: 94,
    average_rating: 4.5,
    rank_score: 91.3,
    weekly_rank_change: -3,
    launched_at: "2023-12-01T00:00:00Z",
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    tagline: "AI-powered CRM platform for marketing, sales, and service",
    description: "HubSpot is an all-in-one CRM platform that unifies marketing, sales, customer service, and content management. Its AI features include predictive lead scoring, email optimization, chatbot builders, content generation, and conversation intelligence. With a free CRM tier and scalable hubs, HubSpot serves over 228,000 customers — from startups to enterprises like Trello, Soundcloud, and Subaru.",
    logo_url: "https://logo.clearbit.com/hubspot.com",
    screenshot_url: null,
    website_url: "https://www.hubspot.com",
    category: "Marketing",
    pricing_model: "Freemium",
    tags: ["CRM", "marketing automation", "sales", "AI", "inbound"],
    badges: ["Most Popular"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 312,
    review_count: 112,
    average_rating: 4.5,
    rank_score: 93.6,
    weekly_rank_change: 0,
    launched_at: "2023-08-15T00:00:00Z",
  },
  {
    slug: "vercel",
    name: "Vercel",
    tagline: "The frontend cloud — build, deploy, and scale web applications",
    description: "Vercel is the platform for frontend developers, providing the best developer experience for building and deploying web applications. As the creators of Next.js, Vercel offers zero-config deployments, edge functions, image optimization, and AI-powered features like v0 for generating UI components from text. Used by companies like Washington Post, Loom, and HashiCorp for production-grade web infrastructure.",
    logo_url: "https://logo.clearbit.com/vercel.com",
    screenshot_url: null,
    website_url: "https://vercel.com",
    category: "Developer Tools",
    pricing_model: "Freemium",
    tags: ["deployment", "hosting", "Next.js", "edge", "frontend"],
    badges: ["Editor's Pick"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 356,
    review_count: 98,
    average_rating: 4.7,
    rank_score: 94.1,
    weekly_rank_change: 2,
    launched_at: "2024-01-05T00:00:00Z",
  },
  {
    slug: "supabase",
    name: "Supabase",
    tagline: "The open-source Firebase alternative with Postgres at its core",
    description: "Supabase is an open-source backend-as-a-service built on PostgreSQL. It provides authentication, real-time subscriptions, edge functions, vector embeddings for AI, file storage, and auto-generated APIs — all from your Postgres database. With a generous free tier and instant setup, Supabase is the go-to backend for startups and indie developers building modern web and mobile applications.",
    logo_url: "https://logo.clearbit.com/supabase.com",
    screenshot_url: null,
    website_url: "https://supabase.com",
    category: "Developer Tools",
    pricing_model: "Freemium",
    tags: ["database", "backend", "Postgres", "auth", "open source"],
    badges: ["Trending", "Top Rated"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 423,
    review_count: 131,
    average_rating: 4.8,
    rank_score: 96.4,
    weekly_rank_change: 6,
    launched_at: "2024-03-01T00:00:00Z",
  },
  {
    slug: "linear",
    name: "Linear",
    tagline: "The issue tracker built for modern software teams",
    description: "Linear is a streamlined project management tool designed specifically for software development teams. Known for its speed, keyboard-first design, and beautiful interface, Linear offers issue tracking, sprint planning, roadmaps, and project insights. AI features auto-triage issues, suggest labels, and generate sub-tasks. Used by teams at Vercel, Ramp, and Cash App for fast-paced product development.",
    logo_url: "https://logo.clearbit.com/linear.app",
    screenshot_url: null,
    website_url: "https://linear.app",
    category: "Project Management",
    pricing_model: "Freemium",
    tags: ["issue tracking", "project management", "sprints", "roadmaps"],
    badges: ["Editor's Pick"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 278,
    review_count: 72,
    average_rating: 4.7,
    rank_score: 90.5,
    weekly_rank_change: 4,
    launched_at: "2024-02-20T00:00:00Z",
  },
  {
    slug: "intercom",
    name: "Intercom",
    tagline: "AI-first customer service platform with Fin AI Agent",
    description: "Intercom is a customer service platform that puts AI at the center of every interaction. Its Fin AI Agent resolves up to 50% of support conversations instantly, while human agents get AI-powered suggestions, summaries, and workflow automation. With a unified inbox, help center, product tours, and proactive messaging, Intercom helps teams deliver fast, personalized support at scale.",
    logo_url: "https://logo.clearbit.com/intercom.com",
    screenshot_url: null,
    website_url: "https://www.intercom.com",
    category: "Customer Support",
    pricing_model: "Paid",
    tags: ["customer support", "AI chatbot", "help desk", "live chat"],
    badges: ["Top Rated"],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 198,
    review_count: 67,
    average_rating: 4.5,
    rank_score: 87.9,
    weekly_rank_change: -1,
    launched_at: "2024-04-01T00:00:00Z",
  },
  {
    slug: "pipedrive",
    name: "Pipedrive",
    tagline: "Sales CRM designed by salespeople, powered by AI",
    description: "Pipedrive is a sales-focused CRM platform used by over 100,000 companies in 179 countries. Its visual pipeline management, AI-powered deal predictions, and automated workflows help sales teams close more deals with less manual work. Features include email tracking, meeting scheduling, lead scoring, and customizable reporting. Pipedrive's AI Sales Assistant proactively suggests actions to improve win rates.",
    logo_url: "https://logo.clearbit.com/pipedrive.com",
    screenshot_url: null,
    website_url: "https://www.pipedrive.com",
    category: "CRM",
    pricing_model: "Paid",
    tags: ["CRM", "sales", "pipeline", "AI", "automation"],
    badges: [],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 156,
    review_count: 48,
    average_rating: 4.3,
    rank_score: 79.8,
    weekly_rank_change: 1,
    launched_at: "2024-05-20T00:00:00Z",
  },
  {
    slug: "snyk",
    name: "Snyk",
    tagline: "Developer-first security platform for code, dependencies, and cloud",
    description: "Snyk is a developer security platform that finds and fixes vulnerabilities in code, open-source dependencies, containers, and cloud infrastructure. Its AI-powered DeepCode engine analyzes code for security issues with near-zero false positives. Integrated directly into IDEs, Git repos, and CI/CD pipelines, Snyk makes security part of the development workflow — not an afterthought. Trusted by Google, Salesforce, and Atlassian.",
    logo_url: "https://logo.clearbit.com/snyk.io",
    screenshot_url: null,
    website_url: "https://snyk.io",
    category: "Security",
    pricing_model: "Freemium",
    tags: ["security", "DevSecOps", "vulnerability scanning", "open source"],
    badges: [],
    status: "approved",
    is_featured: false,
    is_verified: true,
    is_pro: false,
    upvote_count: 145,
    review_count: 36,
    average_rating: 4.4,
    rank_score: 78.3,
    weekly_rank_change: 0,
    launched_at: "2024-06-01T00:00:00Z",
  },
];

async function seed() {
  console.log("🌱 Seeding 20 real AI & SaaS tools via Supabase REST API...\n");

  // Check existing tools
  const existingUrl = `${SUPABASE_URL}/rest/v1/tools?select=slug`;
  const existingRes = await fetch(existingUrl, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const existingTools = await existingRes.json();
  const existingSlugs = new Set(existingTools.map((t) => t.slug));
  console.log(`  Existing tools in DB: ${existingTools.length}`);

  let inserted = 0;
  let skipped = 0;

  for (const tool of tools) {
    if (existingSlugs.has(tool.slug)) {
      console.log(`  ⏭  Skipping "${tool.name}" (slug already exists)`);
      skipped++;
      continue;
    }

    try {
      await supabaseQuery("tools", "POST", tool);
      console.log(`  ✅ Inserted "${tool.name}" (${tool.category})`);
      inserted++;
    } catch (err) {
      console.error(`  ❌ Failed to insert "${tool.name}":`, err.message);
    }
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);

  // Show category distribution
  const catUrl = `${SUPABASE_URL}/rest/v1/tools?select=category&status=eq.approved`;
  const catRes = await fetch(catUrl, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const catData = await catRes.json();
  const catCounts = {};
  for (const row of catData) {
    catCounts[row.category] = (catCounts[row.category] || 0) + 1;
  }
  console.log("\n📊 Category distribution:");
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count} tools`);
  }
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
