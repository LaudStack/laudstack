/**
 * toolExtras.ts — Extended data for ToolDetail page
 * Provides screenshots, feature breakdowns, and pricing tiers per tool slug.
 * Falls back to generated defaults for any tool not listed here.
 *
 * Screenshots: Each tool uses a SINGLE screenshot — either the real screenshot_url
 * from the database, or a live Microlink API capture from the product's website_url.
 * No placeholder images are used.
 */

import type { ToolExtras, PricingTier, ToolFeature } from './types';

// ── Helper: generate Microlink screenshot URL from a website URL ─────────────
export function getMicrolinkScreenshot(websiteUrl: string): string {
  return `https://api.microlink.io/?url=${encodeURIComponent(websiteUrl)}&screenshot=true&meta=false&embed=screenshot.url`;
}

// ── Shared pricing blueprints ─────────────────────────────────────────────────
const freemiumTiers = (paidName = 'Pro', paidPrice = '$29/mo', paidFeatures: string[] = []): PricingTier[] => [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with the essentials at no cost.',
    features: ['Up to 10,000 words/month', 'Basic templates', 'Email support', '1 user seat'],
    cta: 'Get Started Free',
  },
  {
    name: paidName,
    price: paidPrice,
    period: 'per month',
    description: 'Everything in Free, plus powerful features for professionals.',
    features: [
      'Unlimited words',
      'All templates & modes',
      'Priority support',
      '5 user seats',
      'API access',
      ...paidFeatures,
    ],
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored plans for large teams and organizations.',
    features: [
      'Everything in Pro',
      'Unlimited seats',
      'SSO & SAML',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
  },
];

// ── Per-tool extras (features + pricing only — screenshots handled dynamically) ──
const TOOL_EXTRAS: Record<string, Omit<ToolExtras, 'screenshots'>> = {
  'chatgpt': {
    features: [
      { icon: '💬', title: 'Advanced Conversations', description: 'Multi-turn dialogue with memory, context retention, and nuanced understanding across long sessions.' },
      { icon: '🖼️', title: 'Image Generation', description: 'Create stunning images from text prompts using DALL·E 3 directly inside the chat interface.' },
      { icon: '🔌', title: 'Plugin Ecosystem', description: 'Connect to 1,000+ third-party plugins for browsing, code execution, data analysis, and more.' },
      { icon: '📊', title: 'Advanced Data Analysis', description: 'Upload CSVs, PDFs, and images. ChatGPT can analyze, chart, and summarize complex datasets.' },
      { icon: '🗣️', title: 'Voice Mode', description: 'Natural real-time voice conversations with emotional awareness and multiple voice styles.' },
      { icon: '🔒', title: 'Enterprise Security', description: 'SOC 2 compliant, no training on your data, SSO, and custom data retention policies.' },
    ],
    pricing_tiers: [
      {
        name: 'Free',
        price: '$0',
        description: 'Access GPT-3.5 and limited GPT-4o features.',
        features: ['GPT-3.5 & limited GPT-4o', 'DALL·E image generation', 'Web browsing', 'Standard response speed'],
        cta: 'Start Free',
      },
      {
        name: 'Plus',
        price: '$20/mo',
        period: 'per month',
        description: 'Full GPT-4o access with higher limits and new features first.',
        features: ['GPT-4o & GPT-4', 'DALL·E 3 (unlimited)', 'Advanced Data Analysis', 'Voice Mode', 'Early access to new features', '5× more messages'],
        cta: 'Upgrade to Plus',
        highlighted: true,
        badge: 'Most Popular',
      },
      {
        name: 'Team',
        price: '$30/mo',
        period: 'per user/month',
        description: 'Collaborative workspace with admin controls.',
        features: ['Everything in Plus', 'Shared workspace', 'Admin console', 'No training on your data', 'Higher rate limits'],
        cta: 'Start Team Trial',
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Unlimited, secure, and fully customizable.',
        features: ['Unlimited GPT-4o', 'SSO & SAML', 'Custom data retention', 'Dedicated account manager', 'SLA & compliance'],
        cta: 'Contact Sales',
      },
    ],
  },

  'claude': {
    features: [
      { icon: '📚', title: '200K Token Context', description: 'Process entire codebases, legal documents, or books in a single conversation — the largest context window available.' },
      { icon: '🛡️', title: 'Constitutional AI', description: 'Built with Anthropic\'s safety-first approach, Claude is designed to be helpful, harmless, and honest.' },
      { icon: '✍️', title: 'Superior Writing', description: 'Nuanced, human-like writing for essays, reports, creative fiction, and technical documentation.' },
      { icon: '🔬', title: 'Deep Analysis', description: 'Complex reasoning across multi-step problems, research synthesis, and structured argument evaluation.' },
      { icon: '💻', title: 'Code Generation', description: 'Write, review, debug, and explain code across 20+ programming languages with detailed explanations.' },
      { icon: '🌐', title: 'API Access', description: 'Integrate Claude into your products via a clean REST API with streaming, function calling, and vision support.' },
    ],
    pricing_tiers: freemiumTiers('Pro', '$20/mo', ['200K context window', 'Claude 3.5 Sonnet & Opus', 'Priority access']),
  },

  'jasper': {
    features: [
      { icon: '🎯', title: 'Brand Voice', description: 'Train Jasper on your brand guidelines, tone, and style so every piece of content sounds authentically yours.' },
      { icon: '📋', title: '50+ Templates', description: 'Pre-built templates for blog posts, ad copy, emails, social media, product descriptions, and more.' },
      { icon: '🤝', title: 'Team Collaboration', description: 'Real-time collaborative editing, content calendars, and approval workflows for marketing teams.' },
      { icon: '🔗', title: 'Integrations', description: 'Connect with Surfer SEO, Grammarly, Google Docs, WordPress, HubSpot, and 20+ other products.' },
      { icon: '🌍', title: '30+ Languages', description: 'Create content in over 30 languages with native-quality output for global marketing campaigns.' },
      { icon: '📈', title: 'SEO Mode', description: 'Integrated SEO optimization with keyword suggestions, readability scoring, and SERP analysis.' },
    ],
    pricing_tiers: [
      {
        name: 'Creator',
        price: '$49/mo',
        period: 'per month',
        description: 'For individual content creators and freelancers.',
        features: ['1 user seat', 'Brand voice (1 profile)', '50+ templates', 'SEO mode', 'Browser extension'],
        cta: 'Start Free Trial',
      },
      {
        name: 'Teams',
        price: '$125/mo',
        period: 'per month',
        description: 'For marketing teams that need collaboration.',
        features: ['3 user seats', 'Brand voice (3 profiles)', 'Collaboration tools', 'Campaign workflows', 'Priority support', 'API access'],
        cta: 'Start Free Trial',
        highlighted: true,
        badge: 'Most Popular',
      },
      {
        name: 'Business',
        price: 'Custom',
        description: 'For enterprises with advanced needs.',
        features: ['Unlimited seats', 'Custom brand voices', 'SSO', 'Dedicated CSM', 'Custom integrations', 'SLA'],
        cta: 'Contact Sales',
      },
    ],
  },

  'midjourney': {
    features: [
      { icon: '🎨', title: 'Photorealistic Output', description: 'Generate stunning photorealistic images, concept art, and illustrations from natural language descriptions.' },
      { icon: '🔧', title: 'Fine-grained Control', description: 'Advanced parameters for aspect ratio, style weight, chaos, quality, and seed for reproducible results.' },
      { icon: '🔄', title: 'Variations & Upscaling', description: 'Generate multiple variations of any image and upscale to 4× resolution with detail enhancement.' },
      { icon: '👁️', title: 'Image Prompting', description: 'Use reference images to guide style, composition, and subject matter in generated outputs.' },
      { icon: '🌐', title: 'Web Interface', description: 'New web app with image organization, prompt history, and a gallery of community creations.' },
      { icon: '⚡', title: 'Fast Mode', description: 'GPU-accelerated fast mode for rapid iteration, with relaxed mode for unlimited slower generations.' },
    ],
    pricing_tiers: [
      {
        name: 'Basic',
        price: '$10/mo',
        period: 'per month',
        description: 'For hobbyists and casual creators.',
        features: ['~200 image generations/mo', 'General commercial terms', 'Access to member gallery', '3 concurrent jobs'],
        cta: 'Subscribe',
      },
      {
        name: 'Standard',
        price: '$30/mo',
        period: 'per month',
        description: 'For active creators and professionals.',
        features: ['15 hr fast GPU time/mo', 'Unlimited relaxed generations', 'General commercial terms', '3 concurrent fast jobs'],
        cta: 'Subscribe',
        highlighted: true,
        badge: 'Most Popular',
      },
      {
        name: 'Pro',
        price: '$60/mo',
        period: 'per month',
        description: 'For power users and agencies.',
        features: ['30 hr fast GPU time/mo', 'Stealth mode (private generations)', '12 concurrent fast jobs', 'General commercial terms'],
        cta: 'Subscribe',
      },
      {
        name: 'Mega',
        price: '$120/mo',
        period: 'per month',
        description: 'Maximum speed and capacity.',
        features: ['60 hr fast GPU time/mo', 'Stealth mode', '12 concurrent fast jobs', 'Priority queue'],
        cta: 'Subscribe',
      },
    ],
  },

  'github-copilot': {
    features: [
      { icon: '⌨️', title: 'Inline Completions', description: 'Context-aware code completions that understand your codebase, comments, and variable names.' },
      { icon: '💬', title: 'Copilot Chat', description: 'Ask questions about your code, get explanations, debug errors, and generate tests in natural language.' },
      { icon: '🔍', title: 'Code Review', description: 'Automated pull request summaries, security vulnerability detection, and code quality suggestions.' },
      { icon: '🧪', title: 'Test Generation', description: 'Automatically generate unit tests, edge cases, and test suites for your existing code.' },
      { icon: '🛠️', title: 'Multi-IDE Support', description: 'Works with VS Code, Visual Studio, JetBrains IDEs, Neovim, and GitHub.com.' },
      { icon: '🔐', title: 'Enterprise Security', description: 'No code stored beyond the session, IP indemnity, and enterprise-grade access controls.' },
    ],
    pricing_tiers: [
      {
        name: 'Individual',
        price: '$10/mo',
        period: 'per month',
        description: 'For individual developers.',
        features: ['Unlimited completions', 'Copilot Chat', 'CLI assistance', 'All IDE integrations'],
        cta: 'Start Free Trial',
      },
      {
        name: 'Business',
        price: '$19/mo',
        period: 'per user/month',
        description: 'For teams with management and policy controls.',
        features: ['Everything in Individual', 'Organization-wide policy', 'Audit logs', 'IP indemnity', 'SAML SSO'],
        cta: 'Start Free Trial',
        highlighted: true,
        badge: 'Most Popular',
      },
      {
        name: 'Enterprise',
        price: '$39/mo',
        period: 'per user/month',
        description: 'For large organizations with custom needs.',
        features: ['Everything in Business', 'Fine-tuned models on your codebase', 'GitHub.com Copilot Chat', 'Dedicated support', 'Custom policies'],
        cta: 'Contact Sales',
      },
    ],
  },
};

// ── Default generator for any tool not in the map ────────────────────────────
function generateDefaultExtras(toolName: string, pricingModel: string): Omit<ToolExtras, 'screenshots'> {
  const features: ToolFeature[] = [
    { icon: '⚡', title: 'Fast & Reliable', description: `${toolName} is built for speed and reliability, with 99.9% uptime SLA and sub-100ms response times.` },
    { icon: '🔗', title: 'Integrations', description: `Connect ${toolName} with your existing tools via native integrations and a comprehensive REST API.` },
    { icon: '📊', title: 'Analytics & Insights', description: `Track usage, performance, and ROI with built-in analytics dashboards and exportable reports.` },
    { icon: '🛡️', title: 'Enterprise Security', description: `SOC 2 Type II certified, GDPR compliant, with role-based access control and audit logging.` },
    { icon: '🤝', title: 'Team Collaboration', description: `Invite your team, assign roles, and collaborate in real time with shared workspaces and comments.` },
    { icon: '📱', title: 'Mobile Ready', description: `Full-featured mobile apps for iOS and Android, plus a responsive web interface for any device.` },
  ];

  const isFree = pricingModel === 'Free' || pricingModel === 'Open Source';
  const isFreemium = pricingModel === 'Freemium';

  let pricing_tiers: PricingTier[];

  if (isFree) {
    pricing_tiers = [
      {
        name: 'Free Forever',
        price: '$0',
        description: `${toolName} is completely free to use with no hidden costs.`,
        features: ['All core features', 'Unlimited usage', 'Community support', 'Regular updates'],
        cta: 'Get Started Free',
        highlighted: true,
        badge: '100% Free',
      },
    ];
  } else if (isFreemium) {
    pricing_tiers = freemiumTiers();
  } else {
    pricing_tiers = [
      {
        name: 'Starter',
        price: '$19/mo',
        period: 'per month',
        description: 'Perfect for individuals and small projects.',
        features: ['Core features', '1 user seat', 'Email support', '5GB storage'],
        cta: 'Start Free Trial',
      },
      {
        name: 'Pro',
        price: '$49/mo',
        period: 'per month',
        description: 'For professionals who need more power.',
        features: ['All Starter features', '5 user seats', 'Priority support', '50GB storage', 'API access', 'Advanced analytics'],
        cta: 'Start Free Trial',
        highlighted: true,
        badge: 'Most Popular',
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large teams with custom requirements.',
        features: ['Everything in Pro', 'Unlimited seats', 'SSO & SAML', 'Dedicated support', 'Custom SLA', 'On-premise option'],
        cta: 'Contact Sales',
      },
    ];
  }

  return { features, pricing_tiers };
}

// ── Public API ────────────────────────────────────────────────────────────────
export function getToolExtras(slug: string, toolName: string, pricingModel: string, screenshotUrl?: string, websiteUrl?: string): ToolExtras {
  const base = TOOL_EXTRAS[slug] ?? generateDefaultExtras(toolName, pricingModel);

  // Build single screenshot — real screenshot_url takes priority, then Microlink from website_url
  let screenshots: { url: string; caption: string }[] = [];

  if (screenshotUrl) {
    screenshots = [{ url: screenshotUrl, caption: `${toolName} homepage` }];
  } else if (websiteUrl) {
    screenshots = [{ url: getMicrolinkScreenshot(websiteUrl), caption: `${toolName} homepage` }];
  }

  return { ...base, screenshots };
}

// ── Helper to get a single screenshot URL for cards ──────────────────────────
export function getToolScreenshotUrl(screenshotUrl?: string, websiteUrl?: string): string {
  if (screenshotUrl) return screenshotUrl;
  if (websiteUrl) return getMicrolinkScreenshot(websiteUrl);
  return ''; // No screenshot available
}
