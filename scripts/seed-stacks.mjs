/**
 * Seed 50 real AI & SaaS tools into the stacks table.
 * Run: node scripts/seed-stacks.mjs
 *
 * All stacks are added as admin-added, published, unverified (no founder claim).
 * Logos use the tool's favicon via clearbit/google favicon service.
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// 50 real AI & SaaS tools
const TOOLS = [
  {
    name: "ChatGPT",
    tagline: "AI assistant for writing, analysis, coding, and more",
    description:
      "ChatGPT by OpenAI is a conversational AI assistant that can help with writing, brainstorming, coding, data analysis, and creative tasks. It supports text, image, and file inputs with GPT-4o and GPT-4 Turbo models.",
    websiteUrl: "https://chat.openai.com",
    affiliateUrl: "https://chat.openai.com",
    category: "AI Assistants",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Plus plan at $20/mo. Team at $25/user/mo.",
    tags: ["ai", "chatbot", "writing", "coding", "gpt", "openai"],
    isFeatured: true,
    isTrending: true,
  },
  {
    name: "Notion",
    tagline: "All-in-one workspace for notes, docs, and project management",
    description:
      "Notion is a connected workspace where teams create docs, manage projects, and organize knowledge — all in one place. Features include databases, wikis, kanban boards, calendars, and AI-powered writing assistance.",
    websiteUrl: "https://www.notion.so",
    affiliateUrl: "https://www.notion.so",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free for personal use. Plus at $8/user/mo. Business at $15/user/mo.",
    tags: ["productivity", "notes", "project-management", "wiki", "collaboration"],
    isFeatured: true,
  },
  {
    name: "Cursor",
    tagline: "AI-first code editor built for pair programming with AI",
    description:
      "Cursor is an AI-powered code editor forked from VS Code that deeply integrates AI into the coding workflow. Features include AI autocomplete, chat, code generation, and multi-file editing powered by frontier models.",
    websiteUrl: "https://cursor.sh",
    affiliateUrl: "https://cursor.sh",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free tier with limited completions. Pro at $20/mo. Business at $40/user/mo.",
    tags: ["ai", "code-editor", "developer", "ide", "coding", "pair-programming"],
    isFeatured: true,
    isTrending: true,
  },
  {
    name: "Perplexity AI",
    tagline: "AI-powered search engine with cited, real-time answers",
    description:
      "Perplexity AI is an AI-powered answer engine that searches the web in real-time and provides cited, accurate answers. It combines the power of large language models with live web search for research and discovery.",
    websiteUrl: "https://www.perplexity.ai",
    affiliateUrl: "https://www.perplexity.ai",
    category: "AI Assistants",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Pro at $20/mo with unlimited Pro searches.",
    tags: ["ai", "search", "research", "answers", "citations"],
    isTrending: true,
  },
  {
    name: "Figma",
    tagline: "Collaborative interface design tool for teams",
    description:
      "Figma is a cloud-based design tool for creating user interfaces, prototypes, and design systems. It enables real-time collaboration, has a powerful plugin ecosystem, and supports design-to-code workflows.",
    websiteUrl: "https://www.figma.com",
    affiliateUrl: "https://www.figma.com",
    category: "Design Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 3 projects. Professional at $12/editor/mo. Organization at $45/editor/mo.",
    tags: ["design", "ui", "ux", "prototyping", "collaboration", "figma"],
    isFeatured: true,
  },
  {
    name: "Linear",
    tagline: "Streamlined issue tracking and project management for software teams",
    description:
      "Linear is a modern project management tool built for software teams. It features fast keyboard-driven UI, automated workflows, cycle planning, and deep integrations with GitHub, Slack, and Figma.",
    websiteUrl: "https://linear.app",
    affiliateUrl: "https://linear.app",
    category: "Project Management",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 250 issues. Standard at $8/user/mo. Plus at $14/user/mo.",
    tags: ["project-management", "issue-tracking", "agile", "developer", "team"],
  },
  {
    name: "Vercel",
    tagline: "Frontend cloud platform for deploying web applications",
    description:
      "Vercel is a cloud platform for frontend developers that enables instant deployments, serverless functions, edge computing, and seamless integration with Next.js and other frameworks.",
    websiteUrl: "https://vercel.com",
    affiliateUrl: "https://vercel.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free hobby tier. Pro at $20/user/mo. Enterprise custom pricing.",
    tags: ["hosting", "deployment", "nextjs", "serverless", "edge", "developer"],
  },
  {
    name: "Stripe",
    tagline: "Payment processing platform for internet businesses",
    description:
      "Stripe is a financial infrastructure platform for businesses. It provides APIs for payment processing, billing, fraud prevention, and financial reporting used by millions of companies worldwide.",
    websiteUrl: "https://stripe.com",
    affiliateUrl: "https://stripe.com",
    category: "Finance & Payments",
    pricingModel: "Pay Per Use",
    pricingDetails: "2.9% + 30¢ per transaction. No monthly fees. Volume discounts available.",
    tags: ["payments", "billing", "fintech", "api", "subscriptions", "e-commerce"],
    isFeatured: true,
  },
  {
    name: "Slack",
    tagline: "Business messaging platform for team communication",
    description:
      "Slack is a channel-based messaging platform that brings teams together. It features channels, direct messages, file sharing, app integrations, huddles, and workflow automation.",
    websiteUrl: "https://slack.com",
    affiliateUrl: "https://slack.com",
    category: "Communication",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Pro at $7.25/user/mo. Business+ at $12.50/user/mo.",
    tags: ["messaging", "team", "communication", "collaboration", "channels"],
  },
  {
    name: "Airtable",
    tagline: "Low-code platform for building collaborative apps",
    description:
      "Airtable is a cloud-based platform that combines the simplicity of a spreadsheet with the power of a database. Build custom apps, automate workflows, and manage data with flexible views and integrations.",
    websiteUrl: "https://airtable.com",
    affiliateUrl: "https://airtable.com",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 1,000 records. Team at $20/seat/mo. Business at $45/seat/mo.",
    tags: ["database", "spreadsheet", "no-code", "automation", "collaboration"],
  },
  {
    name: "Midjourney",
    tagline: "AI image generation tool for creating stunning visuals",
    description:
      "Midjourney is an AI-powered image generation tool that creates high-quality images from text prompts. It excels at artistic, photorealistic, and creative imagery through its Discord-based interface and web app.",
    websiteUrl: "https://www.midjourney.com",
    affiliateUrl: "https://www.midjourney.com",
    category: "AI Assistants",
    pricingModel: "Paid",
    pricingDetails: "Basic at $10/mo. Standard at $30/mo. Pro at $60/mo. Mega at $120/mo.",
    tags: ["ai", "image-generation", "art", "creative", "design"],
    isTrending: true,
  },
  {
    name: "GitHub Copilot",
    tagline: "AI pair programmer that helps you write code faster",
    description:
      "GitHub Copilot is an AI coding assistant that provides code suggestions, completions, and chat-based help directly in your editor. Powered by OpenAI models, it supports dozens of languages and frameworks.",
    websiteUrl: "https://github.com/features/copilot",
    affiliateUrl: "https://github.com/features/copilot",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for verified students and OSS maintainers. Individual at $10/mo. Business at $19/user/mo.",
    tags: ["ai", "coding", "developer", "autocomplete", "github", "copilot"],
    isFeatured: true,
  },
  {
    name: "Canva",
    tagline: "Online design platform for creating visual content",
    description:
      "Canva is an online graphic design platform that makes it easy to create social media graphics, presentations, posters, documents, and other visual content with drag-and-drop tools and thousands of templates.",
    websiteUrl: "https://www.canva.com",
    affiliateUrl: "https://www.canva.com",
    category: "Design Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Pro at $12.99/mo. Teams at $14.99/user/mo.",
    tags: ["design", "graphics", "templates", "social-media", "presentations"],
  },
  {
    name: "Supabase",
    tagline: "Open source Firebase alternative with Postgres database",
    description:
      "Supabase is an open-source backend-as-a-service platform built on PostgreSQL. It provides database, authentication, storage, edge functions, and real-time subscriptions with a generous free tier.",
    websiteUrl: "https://supabase.com",
    affiliateUrl: "https://supabase.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free tier with 500MB database. Pro at $25/mo. Team at $599/mo.",
    tags: ["database", "backend", "postgres", "auth", "realtime", "open-source"],
  },
  {
    name: "Loom",
    tagline: "Async video messaging for work communication",
    description:
      "Loom is a video messaging tool that lets you record your screen and camera to create quick videos. Share instantly with a link — no downloads needed. Features AI summaries, chapters, and engagement analytics.",
    websiteUrl: "https://www.loom.com",
    affiliateUrl: "https://www.loom.com",
    category: "Communication",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 25 videos. Business at $12.50/creator/mo. Enterprise custom.",
    tags: ["video", "async", "communication", "screen-recording", "messaging"],
  },
  {
    name: "Zapier",
    tagline: "Automation platform connecting 6,000+ apps",
    description:
      "Zapier is a no-code automation platform that connects over 6,000 apps to automate workflows. Create Zaps to move data between apps, trigger actions, and build multi-step automations without coding.",
    websiteUrl: "https://zapier.com",
    affiliateUrl: "https://zapier.com",
    category: "Automation",
    pricingModel: "Freemium",
    pricingDetails: "Free for 100 tasks/mo. Starter at $19.99/mo. Professional at $49/mo.",
    tags: ["automation", "integration", "no-code", "workflow", "zapier"],
    isFeatured: true,
  },
  {
    name: "Framer",
    tagline: "No-code website builder with powerful design capabilities",
    description:
      "Framer is a no-code website builder that combines powerful design tools with production-ready publishing. Features include responsive layouts, animations, CMS, localization, and AI-powered site generation.",
    websiteUrl: "https://www.framer.com",
    affiliateUrl: "https://www.framer.com",
    category: "Design Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Mini at $5/mo. Basic at $15/mo. Pro at $30/mo.",
    tags: ["website-builder", "no-code", "design", "animation", "cms"],
    isTrending: true,
  },
  {
    name: "Resend",
    tagline: "Email API for developers built for reliability",
    description:
      "Resend is a modern email API built for developers. It provides a simple API for sending transactional and marketing emails with high deliverability, React email templates, and detailed analytics.",
    websiteUrl: "https://resend.com",
    affiliateUrl: "https://resend.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for 100 emails/day. Pro at $20/mo for 50K emails. Enterprise custom.",
    tags: ["email", "api", "developer", "transactional", "marketing"],
  },
  {
    name: "Anthropic Claude",
    tagline: "AI assistant focused on safety, helpfulness, and honesty",
    description:
      "Claude by Anthropic is an AI assistant designed to be helpful, harmless, and honest. It excels at long-form content, analysis, coding, and complex reasoning with industry-leading context windows.",
    websiteUrl: "https://claude.ai",
    affiliateUrl: "https://claude.ai",
    category: "AI Assistants",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Pro at $20/mo. Team at $25/user/mo.",
    tags: ["ai", "chatbot", "writing", "analysis", "coding", "anthropic"],
    isFeatured: true,
    isTrending: true,
  },
  {
    name: "Webflow",
    tagline: "Visual web development platform for professional sites",
    description:
      "Webflow is a visual web development platform that lets designers build responsive websites without code. It combines a visual canvas with a powerful CMS, hosting, and e-commerce capabilities.",
    websiteUrl: "https://webflow.com",
    affiliateUrl: "https://webflow.com",
    category: "Design Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free starter plan. Basic at $14/mo. CMS at $23/mo. Business at $39/mo.",
    tags: ["website-builder", "no-code", "design", "cms", "e-commerce"],
  },
  {
    name: "Tailwind CSS",
    tagline: "Utility-first CSS framework for rapid UI development",
    description:
      "Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without leaving your HTML. It features JIT compilation, responsive design, and dark mode support.",
    websiteUrl: "https://tailwindcss.com",
    affiliateUrl: "https://tailwindcss.com",
    category: "Developer Tools",
    pricingModel: "Free",
    pricingDetails: "Open source and free. Tailwind UI components available separately.",
    tags: ["css", "framework", "developer", "ui", "frontend", "open-source"],
  },
  {
    name: "Intercom",
    tagline: "AI-first customer service platform for businesses",
    description:
      "Intercom is an AI-first customer service platform that provides a messenger, help center, ticketing, and AI chatbot (Fin) to help businesses engage with customers and resolve issues faster.",
    websiteUrl: "https://www.intercom.com",
    affiliateUrl: "https://www.intercom.com",
    category: "Customer Support",
    pricingModel: "Paid",
    pricingDetails: "Essential at $39/seat/mo. Advanced at $99/seat/mo. Expert at $139/seat/mo.",
    tags: ["customer-support", "chatbot", "ai", "messaging", "help-desk"],
  },
  {
    name: "Postman",
    tagline: "API platform for building, testing, and documenting APIs",
    description:
      "Postman is an API platform that simplifies the API lifecycle. It provides tools for designing, testing, documenting, and monitoring APIs with collaboration features for teams.",
    websiteUrl: "https://www.postman.com",
    affiliateUrl: "https://www.postman.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 3 users. Basic at $12/user/mo. Professional at $29/user/mo.",
    tags: ["api", "testing", "developer", "documentation", "collaboration"],
  },
  {
    name: "HubSpot",
    tagline: "All-in-one CRM platform for marketing, sales, and service",
    description:
      "HubSpot is a comprehensive CRM platform that includes marketing, sales, service, and content management tools. It helps businesses attract visitors, convert leads, and delight customers.",
    websiteUrl: "https://www.hubspot.com",
    affiliateUrl: "https://www.hubspot.com",
    category: "Marketing",
    pricingModel: "Freemium",
    pricingDetails: "Free CRM available. Starter at $15/mo. Professional at $800/mo.",
    tags: ["crm", "marketing", "sales", "email", "automation"],
    isFeatured: true,
  },
  {
    name: "Descript",
    tagline: "AI-powered video and podcast editing made simple",
    description:
      "Descript is an all-in-one video and podcast editor that uses AI to make editing as easy as editing a document. Features include transcription, screen recording, AI voice cloning, and collaborative editing.",
    websiteUrl: "https://www.descript.com",
    affiliateUrl: "https://www.descript.com",
    category: "Video & Audio",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Hobbyist at $24/mo. Business at $33/mo.",
    tags: ["video", "podcast", "editing", "ai", "transcription", "audio"],
  },
  {
    name: "Railway",
    tagline: "Cloud platform for deploying apps and databases instantly",
    description:
      "Railway is a cloud platform that makes it easy to deploy applications, databases, and services. It provides instant deployments, automatic scaling, and a simple developer experience.",
    websiteUrl: "https://railway.app",
    affiliateUrl: "https://railway.app",
    category: "Developer Tools",
    pricingModel: "Pay Per Use",
    pricingDetails: "Free trial with $5 credit. Usage-based pricing starting at $5/mo.",
    tags: ["hosting", "deployment", "database", "cloud", "developer"],
  },
  {
    name: "Grammarly",
    tagline: "AI writing assistant for clear, effective communication",
    description:
      "Grammarly is an AI-powered writing assistant that helps with grammar, spelling, punctuation, clarity, and tone. It works across browsers, desktop apps, and mobile devices.",
    websiteUrl: "https://www.grammarly.com",
    affiliateUrl: "https://www.grammarly.com",
    category: "AI Writing",
    pricingModel: "Freemium",
    pricingDetails: "Free basic plan. Premium at $12/mo. Business at $15/member/mo.",
    tags: ["writing", "grammar", "ai", "productivity", "communication"],
  },
  {
    name: "Jasper",
    tagline: "AI marketing platform for enterprise content creation",
    description:
      "Jasper is an AI content platform designed for marketing teams. It generates blog posts, social media content, ad copy, and emails while maintaining brand voice and style consistency.",
    websiteUrl: "https://www.jasper.ai",
    affiliateUrl: "https://www.jasper.ai",
    category: "AI Writing",
    pricingModel: "Paid",
    pricingDetails: "Creator at $39/mo. Pro at $59/mo. Business custom pricing.",
    tags: ["ai", "writing", "marketing", "content", "copywriting"],
  },
  {
    name: "Miro",
    tagline: "Online collaborative whiteboard for teams",
    description:
      "Miro is an online collaborative whiteboard platform that enables teams to brainstorm, plan, and design together in real-time. Features include templates, sticky notes, diagrams, and integrations.",
    websiteUrl: "https://miro.com",
    affiliateUrl: "https://miro.com",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 3 boards. Starter at $8/member/mo. Business at $16/member/mo.",
    tags: ["whiteboard", "collaboration", "brainstorming", "design", "planning"],
  },
  {
    name: "Notion AI",
    tagline: "AI-powered writing and knowledge assistant inside Notion",
    description:
      "Notion AI is an integrated AI assistant within Notion that helps with writing, summarizing, brainstorming, and translating content. It works directly in your workspace for seamless productivity.",
    websiteUrl: "https://www.notion.so/product/ai",
    affiliateUrl: "https://www.notion.so/product/ai",
    category: "AI Writing",
    pricingModel: "Paid",
    pricingDetails: "$8/member/mo add-on to any Notion plan.",
    tags: ["ai", "writing", "productivity", "notion", "assistant"],
  },
  {
    name: "Typeform",
    tagline: "Beautiful, conversational forms and surveys",
    description:
      "Typeform creates engaging, conversational forms and surveys with a one-question-at-a-time approach. Features include logic jumps, integrations, payment collection, and beautiful design templates.",
    websiteUrl: "https://www.typeform.com",
    affiliateUrl: "https://www.typeform.com",
    category: "Marketing",
    pricingModel: "Freemium",
    pricingDetails: "Free for 10 responses/mo. Basic at $25/mo. Plus at $50/mo. Business at $83/mo.",
    tags: ["forms", "surveys", "marketing", "feedback", "data-collection"],
  },
  {
    name: "Raycast",
    tagline: "Blazingly fast productivity launcher for macOS",
    description:
      "Raycast is a productivity tool for macOS that replaces Spotlight with a powerful launcher. It features extensions, snippets, clipboard history, window management, and AI-powered commands.",
    websiteUrl: "https://www.raycast.com",
    affiliateUrl: "https://www.raycast.com",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free for personal use. Pro at $8/mo with AI features. Team at $12/user/mo.",
    tags: ["productivity", "launcher", "macos", "ai", "developer", "tools"],
    isTrending: true,
  },
  {
    name: "Clerk",
    tagline: "Authentication and user management for modern apps",
    description:
      "Clerk provides embeddable UIs, flexible APIs, and admin dashboards to authenticate and manage users. It supports social login, MFA, organizations, and works with React, Next.js, and more.",
    websiteUrl: "https://clerk.com",
    affiliateUrl: "https://clerk.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for 10K MAUs. Pro at $25/mo + $0.02/MAU. Enterprise custom.",
    tags: ["auth", "authentication", "developer", "user-management", "security"],
  },
  {
    name: "Planetscale",
    tagline: "Serverless MySQL platform with branching workflows",
    description:
      "PlanetScale is a serverless MySQL-compatible database platform built on Vitess. It features database branching, non-blocking schema changes, and horizontal scaling for production workloads.",
    websiteUrl: "https://planetscale.com",
    affiliateUrl: "https://planetscale.com",
    category: "Developer Tools",
    pricingModel: "Paid",
    pricingDetails: "Scaler at $39/mo. Scaler Pro at $99/mo. Enterprise custom.",
    tags: ["database", "mysql", "serverless", "developer", "scaling"],
  },
  {
    name: "Calendly",
    tagline: "Scheduling automation platform for professionals",
    description:
      "Calendly is a scheduling platform that eliminates the back-and-forth of meeting scheduling. It integrates with calendars, video conferencing tools, and CRMs for seamless appointment booking.",
    websiteUrl: "https://calendly.com",
    affiliateUrl: "https://calendly.com",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free basic plan. Standard at $10/seat/mo. Teams at $16/seat/mo.",
    tags: ["scheduling", "calendar", "meetings", "productivity", "automation"],
  },
  {
    name: "Sentry",
    tagline: "Application monitoring and error tracking platform",
    description:
      "Sentry is an application monitoring platform that helps developers identify, triage, and resolve errors and performance issues in real-time. It supports 100+ platforms and languages.",
    websiteUrl: "https://sentry.io",
    affiliateUrl: "https://sentry.io",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for 5K errors/mo. Team at $26/mo. Business at $80/mo.",
    tags: ["monitoring", "error-tracking", "developer", "debugging", "performance"],
  },
  {
    name: "Mixpanel",
    tagline: "Product analytics platform for data-driven decisions",
    description:
      "Mixpanel is a product analytics platform that helps teams understand user behavior, measure engagement, and make data-driven product decisions with funnels, retention, and A/B testing.",
    websiteUrl: "https://mixpanel.com",
    affiliateUrl: "https://mixpanel.com",
    category: "Analytics",
    pricingModel: "Freemium",
    pricingDetails: "Free for 20M events/mo. Growth at $20/mo. Enterprise custom.",
    tags: ["analytics", "product", "data", "events", "user-behavior"],
  },
  {
    name: "Prisma",
    tagline: "Next-generation ORM for Node.js and TypeScript",
    description:
      "Prisma is an open-source ORM for Node.js and TypeScript that provides a type-safe database client, migrations, and a visual database browser. It supports PostgreSQL, MySQL, SQLite, and MongoDB.",
    websiteUrl: "https://www.prisma.io",
    affiliateUrl: "https://www.prisma.io",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Open source ORM is free. Prisma Accelerate from $29/mo. Pulse from $29/mo.",
    tags: ["orm", "database", "typescript", "developer", "open-source"],
  },
  {
    name: "Replit",
    tagline: "AI-powered software creation platform in the browser",
    description:
      "Replit is a browser-based IDE and cloud platform for building, deploying, and collaborating on software. Features include AI code generation, multiplayer editing, and instant deployment.",
    websiteUrl: "https://replit.com",
    affiliateUrl: "https://replit.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free tier available. Replit Core at $20/mo. Teams custom pricing.",
    tags: ["ide", "coding", "ai", "cloud", "collaboration", "deployment"],
    isTrending: true,
  },
  {
    name: "Mailchimp",
    tagline: "Email marketing and automation platform for growing businesses",
    description:
      "Mailchimp is an all-in-one marketing platform that provides email marketing, automation, landing pages, social media management, and audience analytics for small to medium businesses.",
    websiteUrl: "https://mailchimp.com",
    affiliateUrl: "https://mailchimp.com",
    category: "Marketing",
    pricingModel: "Freemium",
    pricingDetails: "Free for 500 contacts. Essentials at $13/mo. Standard at $20/mo.",
    tags: ["email", "marketing", "automation", "newsletter", "campaigns"],
  },
  {
    name: "Twilio",
    tagline: "Cloud communications platform for SMS, voice, and video",
    description:
      "Twilio is a cloud communications platform that provides APIs for SMS, voice, video, email, and authentication. It powers communication experiences for millions of businesses worldwide.",
    websiteUrl: "https://www.twilio.com",
    affiliateUrl: "https://www.twilio.com",
    category: "Developer Tools",
    pricingModel: "Pay Per Use",
    pricingDetails: "Pay-as-you-go pricing. SMS from $0.0079/message. Voice from $0.0085/min.",
    tags: ["sms", "voice", "api", "communication", "developer", "twilio"],
  },
  {
    name: "Amplitude",
    tagline: "Digital analytics platform for product and growth teams",
    description:
      "Amplitude is a digital analytics platform that helps product and growth teams understand user behavior, optimize experiences, and drive business outcomes with behavioral analytics and experimentation.",
    websiteUrl: "https://amplitude.com",
    affiliateUrl: "https://amplitude.com",
    category: "Analytics",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 50K MTUs. Growth and Enterprise plans available.",
    tags: ["analytics", "product", "data", "growth", "experimentation"],
  },
  {
    name: "Coda",
    tagline: "All-in-one doc that combines docs, spreadsheets, and apps",
    description:
      "Coda is a collaborative document platform that combines the flexibility of documents with the power of spreadsheets and applications. Build custom workflows, databases, and automations in one place.",
    websiteUrl: "https://coda.io",
    affiliateUrl: "https://coda.io",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free for small teams. Pro at $10/doc maker/mo. Team at $30/doc maker/mo.",
    tags: ["docs", "spreadsheet", "productivity", "collaboration", "automation"],
  },
  {
    name: "Retool",
    tagline: "Low-code platform for building internal tools fast",
    description:
      "Retool is a low-code platform for building internal tools. It provides drag-and-drop components, database connectors, and API integrations to build admin panels, dashboards, and CRUD apps quickly.",
    websiteUrl: "https://retool.com",
    affiliateUrl: "https://retool.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 5 users. Team at $10/user/mo. Business at $50/user/mo.",
    tags: ["low-code", "internal-tools", "admin", "dashboard", "developer"],
  },
  {
    name: "Datadog",
    tagline: "Cloud monitoring and security platform for modern infrastructure",
    description:
      "Datadog is a monitoring and security platform for cloud applications. It provides infrastructure monitoring, APM, log management, real user monitoring, and security monitoring in one unified platform.",
    websiteUrl: "https://www.datadoghq.com",
    affiliateUrl: "https://www.datadoghq.com",
    category: "Developer Tools",
    pricingModel: "Freemium",
    pricingDetails: "Free for up to 5 hosts. Pro at $15/host/mo. Enterprise at $23/host/mo.",
    tags: ["monitoring", "observability", "cloud", "security", "apm", "logs"],
  },
  {
    name: "Eleven Labs",
    tagline: "AI voice synthesis and text-to-speech platform",
    description:
      "ElevenLabs is an AI audio platform specializing in realistic text-to-speech, voice cloning, and audio content creation. It provides natural-sounding voices in 29+ languages for various use cases.",
    websiteUrl: "https://elevenlabs.io",
    affiliateUrl: "https://elevenlabs.io",
    category: "AI Assistants",
    pricingModel: "Freemium",
    pricingDetails: "Free tier with 10K characters/mo. Starter at $5/mo. Creator at $22/mo.",
    tags: ["ai", "voice", "text-to-speech", "audio", "voice-cloning"],
    isTrending: true,
  },
  {
    name: "Coolify",
    tagline: "Self-hostable alternative to Heroku, Netlify, and Vercel",
    description:
      "Coolify is an open-source, self-hostable platform for deploying applications, databases, and services. It provides a Heroku-like experience on your own infrastructure with Docker-based deployments.",
    websiteUrl: "https://coolify.io",
    affiliateUrl: "https://coolify.io",
    category: "Developer Tools",
    pricingModel: "Free",
    pricingDetails: "Open source and free to self-host. Cloud hosted version available at $5/mo.",
    tags: ["hosting", "self-hosted", "open-source", "deployment", "docker"],
  },
  {
    name: "Tally",
    tagline: "Simplest way to create free forms and surveys",
    description:
      "Tally is a free form builder that works like a document. Create forms, surveys, and quizzes with a simple, intuitive interface. Features include conditional logic, calculations, and integrations.",
    websiteUrl: "https://tally.so",
    affiliateUrl: "https://tally.so",
    category: "Productivity",
    pricingModel: "Freemium",
    pricingDetails: "Free with unlimited forms and responses. Pro at $29/mo for advanced features.",
    tags: ["forms", "surveys", "free", "no-code", "productivity"],
  },
  {
    name: "Excalidraw",
    tagline: "Virtual whiteboard for sketching hand-drawn diagrams",
    description:
      "Excalidraw is an open-source virtual whiteboard for sketching hand-drawn like diagrams. It features real-time collaboration, end-to-end encryption, and a simple, intuitive interface for creating diagrams, wireframes, and illustrations.",
    websiteUrl: "https://excalidraw.com",
    affiliateUrl: "https://excalidraw.com",
    category: "Design Tools",
    pricingModel: "Free",
    pricingDetails: "Free and open source. Excalidraw+ with collaboration features at $7/mo.",
    tags: ["whiteboard", "diagrams", "drawing", "open-source", "collaboration"],
  },
  {
    name: "Plausible Analytics",
    tagline: "Privacy-friendly, lightweight web analytics",
    description:
      "Plausible is a lightweight, open-source web analytics tool that provides simple, privacy-friendly website analytics. It's GDPR compliant, doesn't use cookies, and has a script under 1KB.",
    websiteUrl: "https://plausible.io",
    affiliateUrl: "https://plausible.io",
    category: "Analytics",
    pricingModel: "Paid",
    pricingDetails: "Growth at $9/mo for 10K pageviews. Business at $19/mo. Self-hosted is free.",
    tags: ["analytics", "privacy", "open-source", "web", "gdpr"],
  },
];

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  console.log("Connected to database. Seeding 50 stacks...\n");

  // Check how many stacks already exist
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM stacks");
  console.log(`Existing stacks: ${existing[0].cnt}`);

  let inserted = 0;
  let skipped = 0;

  for (const tool of TOOLS) {
    const slug = slugify(tool.name);

    // Skip if slug already exists
    const [rows] = await conn.execute(
      "SELECT id FROM stacks WHERE slug = ?",
      [slug]
    );
    if (rows.length > 0) {
      console.log(`  ⏭  ${tool.name} (${slug}) — already exists, skipping`);
      skipped++;
      continue;
    }

    // Use Google favicon service for logos
    const domain = new URL(tool.websiteUrl).hostname;
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // Generate a launched_at date within the last 6 months
    const daysAgo = Math.floor(Math.random() * 180);
    const launchedAt = new Date(Date.now() - daysAgo * 86400000);

    // Generate realistic rank scores
    const rankScore = Math.floor(Math.random() * 500) + 50;
    const weeklyRankChange = Math.floor(Math.random() * 20) - 5;

    await conn.execute(
      `INSERT INTO stacks (slug, name, tagline, description, logoUrl, websiteUrl, affiliateUrl,
        category, pricingModel, pricingDetails, tags, status, isVerified, isFeatured, isTrending,
        isSpotlighted, laudCount, saveCount, reviewCount, averageRating, viewCount, clickCount,
        rankScore, weeklyRankChange, launchedAt, addedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, 0, 0, 0, 0, '0.00', 0, 0, ?, ?, ?, 'admin')`,
      [
        slug,
        tool.name,
        tool.tagline,
        tool.description,
        logoUrl,
        tool.websiteUrl,
        tool.affiliateUrl,
        tool.category,
        tool.pricingModel,
        tool.pricingDetails,
        JSON.stringify(tool.tags),
        tool.isFeatured ? 1 : 0,
        tool.isTrending ? 1 : 0,
        rankScore,
        weeklyRankChange,
        launchedAt,
      ]
    );

    console.log(`  ✅ ${tool.name} (${slug})`);
    inserted++;
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);

  // Final count
  const [final] = await conn.execute("SELECT COUNT(*) as cnt FROM stacks");
  console.log(`Total stacks in database: ${final[0].cnt}`);

  await conn.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
