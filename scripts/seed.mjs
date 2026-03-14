/**
 * Seed script — populates the tools table from mockData.
 * Run: export DATABASE_URL="..." && node scripts/seed.mjs
 */
import postgres from "postgres";
import { readFileSync } from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require" });

// We'll parse the mock data from the TS file by extracting the JSON-like array
// Instead, let's just define the data inline since we need it in JS format

const MOCK_TOOLS = [
  {
    slug: "jasper-ai", name: "Jasper AI", tagline: "AI-powered content creation platform",
    description: "Jasper AI is the leading AI content creation platform trusted by 100,000+ teams worldwide. Create blog posts, marketing copy, social media content, and more with enterprise-grade AI that understands your brand voice.",
    logo_url: "https://www.google.com/s2/favicons?domain=jasper.ai&sz=64",
    website_url: "https://jasper.ai", category: "AI Writing", pricing_model: "Paid",
    tags: JSON.stringify(["content creation", "marketing", "AI", "copywriting"]),
    badges: JSON.stringify(["top_rated", "featured", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 2847, review_count: 1234, average_rating: 4.8, rank_score: 9500, weekly_rank_change: 12,
    launched_at: "2021-01-15",
  },
  {
    slug: "copy-ai", name: "Copy.ai", tagline: "AI-first GTM platform for marketing teams",
    description: "Copy.ai is an AI-first go-to-market platform that helps marketing teams create content, automate workflows, and drive revenue. From blog posts to ad copy, Copy.ai handles it all.",
    logo_url: "https://www.google.com/s2/favicons?domain=copy.ai&sz=64",
    website_url: "https://copy.ai", category: "AI Writing", pricing_model: "Freemium",
    tags: JSON.stringify(["marketing", "copywriting", "AI", "automation"]),
    badges: JSON.stringify(["trending", "verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 2103, review_count: 876, average_rating: 4.6, rank_score: 9200, weekly_rank_change: 8,
    launched_at: "2020-10-01",
  },
  {
    slug: "writesonic", name: "Writesonic", tagline: "AI writer for blogs, ads, and product descriptions",
    description: "Writesonic is an AI writing tool that helps you create SEO-optimized content for blogs, Facebook ads, Google ads, and Shopify product descriptions in seconds.",
    logo_url: "https://www.google.com/s2/favicons?domain=writesonic.com&sz=64",
    website_url: "https://writesonic.com", category: "AI Writing", pricing_model: "Freemium",
    tags: JSON.stringify(["SEO", "blog", "ads", "AI"]),
    badges: JSON.stringify(["best_value"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1567, review_count: 654, average_rating: 4.4, rank_score: 8800, weekly_rank_change: -3,
    launched_at: "2021-03-01",
  },
  {
    slug: "grammarly", name: "Grammarly", tagline: "AI writing assistant for clear communication",
    description: "Grammarly is an AI-powered writing assistant that helps millions of people communicate more effectively every day. Check grammar, spelling, tone, and clarity in real time.",
    logo_url: "https://www.google.com/s2/favicons?domain=grammarly.com&sz=64",
    website_url: "https://grammarly.com", category: "AI Writing", pricing_model: "Freemium",
    tags: JSON.stringify(["grammar", "writing", "AI", "communication"]),
    badges: JSON.stringify(["top_rated", "community_pick", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 4521, review_count: 2341, average_rating: 4.9, rank_score: 9800, weekly_rank_change: 5,
    launched_at: "2009-07-01",
  },
  {
    slug: "sudowrite", name: "Sudowrite", tagline: "AI writing partner for fiction authors",
    description: "Sudowrite is an AI writing tool designed specifically for fiction writers. Get help with brainstorming, expanding scenes, describing characters, and overcoming writer's block.",
    logo_url: "https://www.google.com/s2/favicons?domain=sudowrite.com&sz=64",
    website_url: "https://sudowrite.com", category: "AI Writing", pricing_model: "Paid",
    tags: JSON.stringify(["fiction", "creative writing", "AI", "novels"]),
    badges: JSON.stringify(["editors_pick"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 760, review_count: 198, average_rating: 4.5, rank_score: 8100, weekly_rank_change: 18,
    launched_at: "2020-11-01",
  },
  {
    slug: "midjourney", name: "Midjourney", tagline: "AI image generation for creatives",
    description: "Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species through AI image generation.",
    logo_url: "https://www.google.com/s2/favicons?domain=midjourney.com&sz=64",
    website_url: "https://midjourney.com", category: "AI Image", pricing_model: "Paid",
    tags: JSON.stringify(["image", "art", "creative", "AI"]),
    badges: JSON.stringify(["top_rated", "community_pick"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: false,
    upvote_count: 3421, review_count: 1204, average_rating: 4.9, rank_score: 9580, weekly_rank_change: 9,
    launched_at: "2022-07-12",
  },
  {
    slug: "leonardo-ai", name: "Leonardo AI", tagline: "AI image generation for game assets",
    description: "Leonardo AI is a powerful AI image generation platform with fine-tuned models for game assets, concept art, and creative projects.",
    logo_url: "https://www.google.com/s2/favicons?domain=leonardo.ai&sz=64",
    website_url: "https://leonardo.ai", category: "AI Image", pricing_model: "Freemium",
    tags: JSON.stringify(["image", "game assets", "AI", "art"]),
    badges: JSON.stringify(["trending", "new_launch"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1870, review_count: 543, average_rating: 4.6, rank_score: 9000, weekly_rank_change: 25,
    launched_at: "2022-11-01",
  },
  {
    slug: "runway-ml", name: "Runway ML", tagline: "AI video generation and editing",
    description: "Runway is an applied AI research company building the next era of art, entertainment and human creativity with AI video generation tools.",
    logo_url: "https://www.google.com/s2/favicons?domain=runwayml.com&sz=64",
    website_url: "https://runwayml.com", category: "AI Video", pricing_model: "Freemium",
    tags: JSON.stringify(["video", "editing", "AI", "creative"]),
    badges: JSON.stringify(["top_rated", "featured"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 2890, review_count: 987, average_rating: 4.7, rank_score: 9400, weekly_rank_change: 15,
    launched_at: "2018-06-01",
  },
  {
    slug: "synthesia", name: "Synthesia", tagline: "AI video generation from text",
    description: "Synthesia is the world's leading AI video generation platform. Create professional videos from text in minutes with AI avatars and voiceovers.",
    logo_url: "https://www.google.com/s2/favicons?domain=synthesia.io&sz=64",
    website_url: "https://synthesia.io", category: "AI Video", pricing_model: "Paid",
    tags: JSON.stringify(["video", "avatars", "AI", "training"]),
    badges: JSON.stringify(["verified", "editors_pick"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1654, review_count: 543, average_rating: 4.5, rank_score: 8900, weekly_rank_change: 7,
    launched_at: "2017-01-01",
  },
  {
    slug: "github-copilot", name: "GitHub Copilot", tagline: "AI pair programmer for developers",
    description: "GitHub Copilot is an AI pair programmer that helps you write code faster with less work. It draws context from comments and code to suggest individual lines and whole functions.",
    logo_url: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    website_url: "https://github.com/features/copilot", category: "AI Code", pricing_model: "Paid",
    tags: JSON.stringify(["code", "developer", "AI", "productivity"]),
    badges: JSON.stringify(["top_rated", "featured", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 5200, review_count: 2100, average_rating: 4.8, rank_score: 9700, weekly_rank_change: 3,
    launched_at: "2021-06-29",
  },
  {
    slug: "cursor", name: "Cursor", tagline: "AI-first code editor built for productivity",
    description: "Cursor is an AI-first code editor designed to make you extraordinarily productive. Built on top of VS Code with deep AI integration.",
    logo_url: "https://www.google.com/s2/favicons?domain=cursor.sh&sz=64",
    website_url: "https://cursor.sh", category: "AI Code", pricing_model: "Freemium",
    tags: JSON.stringify(["code editor", "AI", "developer", "productivity"]),
    badges: JSON.stringify(["trending", "community_pick"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: false,
    upvote_count: 4100, review_count: 1500, average_rating: 4.9, rank_score: 9600, weekly_rank_change: 30,
    launched_at: "2023-03-01",
  },
  {
    slug: "notion-ai", name: "Notion AI", tagline: "AI-powered workspace for notes and docs",
    description: "Notion AI brings the power of AI to your workspace. Write, brainstorm, edit, summarize, and more — all within the tool you already use for work.",
    logo_url: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
    website_url: "https://notion.so", category: "AI Productivity", pricing_model: "Freemium",
    tags: JSON.stringify(["productivity", "notes", "AI", "workspace"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 3800, review_count: 1800, average_rating: 4.7, rank_score: 9500, weekly_rank_change: 4,
    launched_at: "2023-02-22",
  },
  {
    slug: "clickup", name: "ClickUp", tagline: "All-in-one project management with AI",
    description: "ClickUp is the everything app for work. Manage projects, docs, and goals with built-in AI to boost productivity across your entire organization.",
    logo_url: "https://www.google.com/s2/favicons?domain=clickup.com&sz=64",
    website_url: "https://clickup.com", category: "Project Management", pricing_model: "Freemium",
    tags: JSON.stringify(["project management", "AI", "productivity", "teams"]),
    badges: JSON.stringify(["featured", "verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 2300, review_count: 900, average_rating: 4.5, rank_score: 9100, weekly_rank_change: 6,
    launched_at: "2017-01-01",
  },
  {
    slug: "hubspot-crm", name: "HubSpot CRM", tagline: "Free CRM with AI-powered sales tools",
    description: "HubSpot CRM is a free, AI-powered CRM platform that gives your whole team the tools to manage contacts, track deals, and grow your business.",
    logo_url: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=64",
    website_url: "https://hubspot.com", category: "CRM", pricing_model: "Freemium",
    tags: JSON.stringify(["CRM", "sales", "marketing", "AI"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 3100, review_count: 1400, average_rating: 4.6, rank_score: 9300, weekly_rank_change: 2,
    launched_at: "2014-01-01",
  },
  {
    slug: "canva", name: "Canva", tagline: "Visual design platform with AI tools",
    description: "Canva is a free-to-use online graphic design tool with AI-powered features. Create social media posts, presentations, posters, videos, logos and more.",
    logo_url: "https://www.google.com/s2/favicons?domain=canva.com&sz=64",
    website_url: "https://canva.com", category: "Design", pricing_model: "Freemium",
    tags: JSON.stringify(["design", "graphics", "AI", "templates"]),
    badges: JSON.stringify(["top_rated", "community_pick", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: false,
    upvote_count: 4800, review_count: 2200, average_rating: 4.8, rank_score: 9650, weekly_rank_change: 1,
    launched_at: "2013-01-01",
  },
  {
    slug: "figma", name: "Figma", tagline: "Collaborative interface design tool",
    description: "Figma is a collaborative web application for interface design with real-time collaboration, prototyping, and developer handoff features.",
    logo_url: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
    website_url: "https://figma.com", category: "Design", pricing_model: "Freemium",
    tags: JSON.stringify(["design", "UI/UX", "prototyping", "collaboration"]),
    badges: JSON.stringify(["top_rated", "featured"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 5100, review_count: 2400, average_rating: 4.9, rank_score: 9750, weekly_rank_change: 0,
    launched_at: "2016-09-01",
  },
  {
    slug: "mixpanel", name: "Mixpanel", tagline: "Product analytics for data-driven teams",
    description: "Mixpanel is a product analytics platform that helps teams understand how users engage with their products through event tracking and behavioral analysis.",
    logo_url: "https://www.google.com/s2/favicons?domain=mixpanel.com&sz=64",
    website_url: "https://mixpanel.com", category: "AI Analytics", pricing_model: "Freemium",
    tags: JSON.stringify(["analytics", "product", "data", "events"]),
    badges: JSON.stringify(["verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1200, review_count: 450, average_rating: 4.4, rank_score: 8500, weekly_rank_change: -2,
    launched_at: "2009-01-01",
  },
  {
    slug: "amplitude", name: "Amplitude", tagline: "Digital analytics for product teams",
    description: "Amplitude is the leading digital analytics platform that helps companies understand user behavior and build better products.",
    logo_url: "https://www.google.com/s2/favicons?domain=amplitude.com&sz=64",
    website_url: "https://amplitude.com", category: "AI Analytics", pricing_model: "Freemium",
    tags: JSON.stringify(["analytics", "product", "data", "growth"]),
    badges: JSON.stringify(["verified", "editors_pick"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1100, review_count: 380, average_rating: 4.3, rank_score: 8400, weekly_rank_change: 1,
    launched_at: "2012-01-01",
  },
  {
    slug: "intercom", name: "Intercom", tagline: "AI-first customer service platform",
    description: "Intercom is the complete AI-first customer service solution, providing instant support with an AI agent, AI copilot for agents, and AI insights for leaders.",
    logo_url: "https://www.google.com/s2/favicons?domain=intercom.com&sz=64",
    website_url: "https://intercom.com", category: "Customer Support", pricing_model: "Paid",
    tags: JSON.stringify(["customer support", "AI", "chat", "helpdesk"]),
    badges: JSON.stringify(["top_rated", "featured"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 2700, review_count: 1100, average_rating: 4.6, rank_score: 9200, weekly_rank_change: 5,
    launched_at: "2011-01-01",
  },
  {
    slug: "zendesk", name: "Zendesk", tagline: "Customer service software with AI",
    description: "Zendesk is a service-first CRM company that builds software designed to improve customer relationships with AI-powered support tools.",
    logo_url: "https://www.google.com/s2/favicons?domain=zendesk.com&sz=64",
    website_url: "https://zendesk.com", category: "Customer Support", pricing_model: "Paid",
    tags: JSON.stringify(["customer support", "helpdesk", "AI", "ticketing"]),
    badges: JSON.stringify(["verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1900, review_count: 800, average_rating: 4.3, rank_score: 8700, weekly_rank_change: -1,
    launched_at: "2007-01-01",
  },
  {
    slug: "stripe", name: "Stripe", tagline: "Financial infrastructure for the internet",
    description: "Stripe is a technology company that builds economic infrastructure for the internet. Businesses use Stripe to accept payments, manage subscriptions, and more.",
    logo_url: "https://www.google.com/s2/favicons?domain=stripe.com&sz=64",
    website_url: "https://stripe.com", category: "Finance", pricing_model: "Paid",
    tags: JSON.stringify(["payments", "finance", "API", "billing"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 5500, review_count: 2800, average_rating: 4.9, rank_score: 9900, weekly_rank_change: 0,
    launched_at: "2011-09-29",
  },
  {
    slug: "linear", name: "Linear", tagline: "Issue tracking for high-performance teams",
    description: "Linear is the issue tracking tool you'll enjoy using. Streamline software projects, sprints, tasks, and bug tracking with a beautiful, fast interface.",
    logo_url: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
    website_url: "https://linear.app", category: "Project Management", pricing_model: "Freemium",
    tags: JSON.stringify(["project management", "issue tracking", "agile", "teams"]),
    badges: JSON.stringify(["trending", "community_pick"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 2400, review_count: 700, average_rating: 4.8, rank_score: 9300, weekly_rank_change: 20,
    launched_at: "2019-11-01",
  },
  {
    slug: "vercel", name: "Vercel", tagline: "Frontend cloud platform for developers",
    description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
    logo_url: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
    website_url: "https://vercel.com", category: "Developer Tools", pricing_model: "Freemium",
    tags: JSON.stringify(["hosting", "frontend", "Next.js", "deployment"]),
    badges: JSON.stringify(["top_rated", "featured", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 4200, review_count: 1600, average_rating: 4.8, rank_score: 9600, weekly_rank_change: 2,
    launched_at: "2015-11-01",
  },
  {
    slug: "supabase", name: "Supabase", tagline: "Open source Firebase alternative",
    description: "Supabase is an open source Firebase alternative providing a Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, Storage, and Vector embeddings.",
    logo_url: "https://www.google.com/s2/favicons?domain=supabase.com&sz=64",
    website_url: "https://supabase.com", category: "Developer Tools", pricing_model: "Freemium",
    tags: JSON.stringify(["database", "backend", "auth", "open source"]),
    badges: JSON.stringify(["trending", "community_pick", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: false,
    upvote_count: 3800, review_count: 1200, average_rating: 4.7, rank_score: 9500, weekly_rank_change: 15,
    launched_at: "2020-01-01",
  },
  {
    slug: "shopify", name: "Shopify", tagline: "E-commerce platform for online stores",
    description: "Shopify is a complete commerce platform that lets you start, grow, and manage a business. Create an online store, manage sales, and market to customers.",
    logo_url: "https://www.google.com/s2/favicons?domain=shopify.com&sz=64",
    website_url: "https://shopify.com", category: "E-commerce", pricing_model: "Paid",
    tags: JSON.stringify(["e-commerce", "online store", "payments", "marketing"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 4900, review_count: 2500, average_rating: 4.7, rank_score: 9700, weekly_rank_change: 1,
    launched_at: "2006-06-01",
  },
  {
    slug: "elevenlabs", name: "ElevenLabs", tagline: "AI voice synthesis and cloning",
    description: "ElevenLabs is the most realistic and versatile AI speech software. Create natural-sounding voiceovers, clone voices, and generate speech in 29 languages.",
    logo_url: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=64",
    website_url: "https://elevenlabs.io", category: "AI Audio", pricing_model: "Freemium",
    tags: JSON.stringify(["voice", "audio", "AI", "text-to-speech"]),
    badges: JSON.stringify(["top_rated", "trending"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: false,
    upvote_count: 3200, review_count: 900, average_rating: 4.8, rank_score: 9400, weekly_rank_change: 22,
    launched_at: "2022-01-01",
  },
  {
    slug: "descript", name: "Descript", tagline: "AI-powered video and podcast editing",
    description: "Descript is an all-in-one video and podcast editing tool powered by AI. Edit media by editing text, with features like filler word removal and AI voice cloning.",
    logo_url: "https://www.google.com/s2/favicons?domain=descript.com&sz=64",
    website_url: "https://descript.com", category: "AI Audio", pricing_model: "Freemium",
    tags: JSON.stringify(["video", "podcast", "editing", "AI"]),
    badges: JSON.stringify(["editors_pick", "verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1800, review_count: 600, average_rating: 4.5, rank_score: 8800, weekly_rank_change: 8,
    launched_at: "2017-01-01",
  },
  {
    slug: "mailchimp", name: "Mailchimp", tagline: "Email marketing and automation platform",
    description: "Mailchimp is an all-in-one marketing platform that helps you manage and talk to your clients, customers, and other interested parties with AI-powered email campaigns.",
    logo_url: "https://www.google.com/s2/favicons?domain=mailchimp.com&sz=64",
    website_url: "https://mailchimp.com", category: "Marketing", pricing_model: "Freemium",
    tags: JSON.stringify(["email", "marketing", "automation", "campaigns"]),
    badges: JSON.stringify(["verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 2100, review_count: 900, average_rating: 4.3, rank_score: 8600, weekly_rank_change: -2,
    launched_at: "2001-01-01",
  },
  {
    slug: "semrush", name: "Semrush", tagline: "Online marketing and SEO toolkit",
    description: "Semrush is an all-in-one tool suite for improving online visibility and discovering marketing insights with AI-powered SEO, content, and competitive analysis.",
    logo_url: "https://www.google.com/s2/favicons?domain=semrush.com&sz=64",
    website_url: "https://semrush.com", category: "Marketing", pricing_model: "Paid",
    tags: JSON.stringify(["SEO", "marketing", "analytics", "content"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 2800, review_count: 1100, average_rating: 4.6, rank_score: 9100, weekly_rank_change: 3,
    launched_at: "2008-01-01",
  },
  {
    slug: "rippling", name: "Rippling", tagline: "Unified HR, IT, and Finance platform",
    description: "Rippling lets you manage your employees' Payroll, Benefits, Expenses, Devices, Apps, and more — all in one place with AI-powered automation.",
    logo_url: "https://www.google.com/s2/favicons?domain=rippling.com&sz=64",
    website_url: "https://rippling.com", category: "HR & Recruiting", pricing_model: "Paid",
    tags: JSON.stringify(["HR", "payroll", "benefits", "IT"]),
    badges: JSON.stringify(["featured", "verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1500, review_count: 500, average_rating: 4.4, rank_score: 8500, weekly_rank_change: 7,
    launched_at: "2016-01-01",
  },
  {
    slug: "gong", name: "Gong", tagline: "Revenue intelligence platform with AI",
    description: "Gong captures and analyzes every customer interaction to deliver insights that help revenue teams close more deals with AI-powered conversation intelligence.",
    logo_url: "https://www.google.com/s2/favicons?domain=gong.io&sz=64",
    website_url: "https://gong.io", category: "Sales", pricing_model: "Paid",
    tags: JSON.stringify(["sales", "AI", "conversation intelligence", "revenue"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 2200, review_count: 800, average_rating: 4.7, rank_score: 9200, weekly_rank_change: 4,
    launched_at: "2015-01-01",
  },
  {
    slug: "1password", name: "1Password", tagline: "Password manager for teams and families",
    description: "1Password is the world's most-loved password manager. Keep your credentials safe and secure with enterprise-grade encryption and seamless team sharing.",
    logo_url: "https://www.google.com/s2/favicons?domain=1password.com&sz=64",
    website_url: "https://1password.com", category: "Security", pricing_model: "Paid",
    tags: JSON.stringify(["security", "passwords", "encryption", "teams"]),
    badges: JSON.stringify(["top_rated", "verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 3000, review_count: 1300, average_rating: 4.8, rank_score: 9400, weekly_rank_change: 0,
    launched_at: "2006-06-01",
  },
  {
    slug: "coursera", name: "Coursera", tagline: "Online learning platform with AI courses",
    description: "Coursera partners with universities and organizations to offer online courses, degrees, and certificates in AI, data science, business, and more.",
    logo_url: "https://www.google.com/s2/favicons?domain=coursera.org&sz=64",
    website_url: "https://coursera.org", category: "Education", pricing_model: "Freemium",
    tags: JSON.stringify(["education", "courses", "AI", "learning"]),
    badges: JSON.stringify(["verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 2500, review_count: 1000, average_rating: 4.4, rank_score: 8800, weekly_rank_change: 1,
    launched_at: "2012-04-01",
  },
  // Additional tools to reach ~35 total
  {
    slug: "perplexity-ai", name: "Perplexity AI", tagline: "AI-powered answer engine",
    description: "Perplexity AI is an AI-powered search engine that provides accurate, cited answers to your questions by searching the web in real-time.",
    logo_url: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64",
    website_url: "https://perplexity.ai", category: "AI Productivity", pricing_model: "Freemium",
    tags: JSON.stringify(["search", "AI", "research", "answers"]),
    badges: JSON.stringify(["trending", "community_pick"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: false,
    upvote_count: 3600, review_count: 1100, average_rating: 4.8, rank_score: 9500, weekly_rank_change: 28,
    launched_at: "2022-08-01",
  },
  {
    slug: "airtable", name: "Airtable", tagline: "Low-code platform for building apps",
    description: "Airtable is a low-code platform for building collaborative apps. Customize your workflow, collaborate, and achieve ambitious outcomes.",
    logo_url: "https://www.google.com/s2/favicons?domain=airtable.com&sz=64",
    website_url: "https://airtable.com", category: "Project Management", pricing_model: "Freemium",
    tags: JSON.stringify(["database", "low-code", "collaboration", "workflow"]),
    badges: JSON.stringify(["verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 2000, review_count: 750, average_rating: 4.5, rank_score: 8900, weekly_rank_change: 3,
    launched_at: "2012-01-01",
  },
  {
    slug: "loom", name: "Loom", tagline: "Async video messaging for work",
    description: "Loom is the video messaging platform that helps you get your message across through instantly shareable videos.",
    logo_url: "https://www.google.com/s2/favicons?domain=loom.com&sz=64",
    website_url: "https://loom.com", category: "AI Productivity", pricing_model: "Freemium",
    tags: JSON.stringify(["video", "messaging", "async", "communication"]),
    badges: JSON.stringify(["verified"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: false,
    upvote_count: 1800, review_count: 600, average_rating: 4.5, rank_score: 8700, weekly_rank_change: 5,
    launched_at: "2015-01-01",
  },
  {
    slug: "datadog", name: "Datadog", tagline: "Cloud monitoring and security platform",
    description: "Datadog is the monitoring and security platform for cloud applications. See inside any stack, any app, at any scale, anywhere.",
    logo_url: "https://www.google.com/s2/favicons?domain=datadoghq.com&sz=64",
    website_url: "https://datadoghq.com", category: "Developer Tools", pricing_model: "Paid",
    tags: JSON.stringify(["monitoring", "cloud", "security", "DevOps"]),
    badges: JSON.stringify(["verified", "editors_pick"]),
    status: "approved", is_featured: false, is_verified: true, is_pro: true,
    upvote_count: 1600, review_count: 500, average_rating: 4.4, rank_score: 8600, weekly_rank_change: 2,
    launched_at: "2010-06-01",
  },
  {
    slug: "anthropic-claude", name: "Claude by Anthropic", tagline: "Safe and helpful AI assistant",
    description: "Claude is Anthropic's AI assistant, designed to be helpful, harmless, and honest. Use Claude for analysis, writing, coding, math, and creative tasks.",
    logo_url: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=64",
    website_url: "https://claude.ai", category: "AI Productivity", pricing_model: "Freemium",
    tags: JSON.stringify(["AI assistant", "chat", "analysis", "coding"]),
    badges: JSON.stringify(["top_rated", "trending", "featured"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 4500, review_count: 1800, average_rating: 4.9, rank_score: 9700, weekly_rank_change: 35,
    launched_at: "2023-03-14",
  },
  {
    slug: "chatgpt", name: "ChatGPT", tagline: "AI chatbot by OpenAI",
    description: "ChatGPT is an AI chatbot developed by OpenAI that can engage in conversational dialogue, answer questions, write code, and assist with a wide range of tasks.",
    logo_url: "https://www.google.com/s2/favicons?domain=openai.com&sz=64",
    website_url: "https://chat.openai.com", category: "AI Productivity", pricing_model: "Freemium",
    tags: JSON.stringify(["AI", "chatbot", "writing", "coding"]),
    badges: JSON.stringify(["top_rated", "community_pick", "verified"]),
    status: "approved", is_featured: true, is_verified: true, is_pro: true,
    upvote_count: 6000, review_count: 3000, average_rating: 4.8, rank_score: 9900, weekly_rank_change: 2,
    launched_at: "2022-11-30",
  },
];

async function seed() {
  console.log(`Seeding ${MOCK_TOOLS.length} tools...`);
  
  // Check existing count
  const existing = await sql`SELECT count(*) FROM tools`;
  console.log(`Existing tools: ${existing[0].count}`);
  
  if (parseInt(existing[0].count) > 0) {
    console.log("Tools already exist, skipping seed.");
    await sql.end();
    return;
  }

  for (const tool of MOCK_TOOLS) {
    await sql`
      INSERT INTO tools (slug, name, tagline, description, logo_url, website_url, category, pricing_model, tags, badges, status, is_featured, is_verified, is_pro, upvote_count, review_count, average_rating, rank_score, weekly_rank_change, launched_at, created_at, updated_at)
      VALUES (${tool.slug}, ${tool.name}, ${tool.tagline}, ${tool.description}, ${tool.logo_url}, ${tool.website_url}, ${tool.category}, ${tool.pricing_model}, ${tool.tags}::jsonb, ${tool.badges}::jsonb, ${tool.status}, ${tool.is_featured}, ${tool.is_verified}, ${tool.is_pro}, ${tool.upvote_count}, ${tool.review_count}, ${tool.average_rating}, ${tool.rank_score}, ${tool.weekly_rank_change}, ${tool.launched_at}, NOW(), NOW())
    `;
    console.log(`  ✓ ${tool.name}`);
  }

  // Seed some sample reviews
  console.log("\nSeeding sample reviews...");
  const toolRows = await sql`SELECT id, slug FROM tools LIMIT 10`;
  const reviewBodies = [
    { title: "Excellent tool!", body: "This tool has transformed our workflow. Highly recommended for any team.", rating: 5, pros: "Easy to use, great features", cons: "Pricing could be better" },
    { title: "Good but room for improvement", body: "Solid product with good fundamentals. A few rough edges but overall positive experience.", rating: 4, pros: "Good UI, reliable", cons: "Missing some advanced features" },
    { title: "Great value for the price", body: "For what you pay, this is an incredible tool. The free tier is generous enough for most use cases.", rating: 4, pros: "Affordable, feature-rich", cons: "Support could be faster" },
    { title: "Game changer for our team", body: "We've been using this for 6 months and it's completely changed how we work. Can't imagine going back.", rating: 5, pros: "Incredible productivity boost", cons: "Steep learning curve initially" },
    { title: "Decent but not the best", body: "It does what it says but there are better alternatives in the market. Still a solid choice for beginners.", rating: 3, pros: "Simple to start", cons: "Limited integrations" },
  ];

  for (const tool of toolRows) {
    for (let i = 0; i < 3; i++) {
      const review = reviewBodies[i % reviewBodies.length];
      await sql`
        INSERT INTO reviews (tool_id, rating, title, body, pros, cons, is_verified, helpful_count, created_at, updated_at)
        VALUES (${tool.id}, ${review.rating}, ${review.title}, ${review.body}, ${review.pros}, ${review.cons}, ${Math.random() > 0.3}, ${Math.floor(Math.random() * 50)}, NOW() - interval '${sql.unsafe(String(Math.floor(Math.random() * 90)))} days', NOW())
      `;
    }
    console.log(`  ✓ Reviews for ${tool.slug}`);
  }

  console.log("\nSeed complete!");
  await sql.end();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
