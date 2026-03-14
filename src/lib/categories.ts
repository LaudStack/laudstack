/**
 * Static category definitions — no dependency on mock data.
 * Counts will be fetched from the database when needed.
 */
export const CATEGORY_META: { name: string; icon: string; description: string }[] = [
  { name: "All", icon: "🌐", description: "All tools on LaudStack" },
  { name: "AI Productivity", icon: "⚡", description: "AI-powered productivity and automation tools" },
  { name: "AI Writing", icon: "✍️", description: "AI writing assistants and content generators" },
  { name: "AI Image", icon: "🎨", description: "AI image generation and editing tools" },
  { name: "AI Video", icon: "🎬", description: "AI video creation and editing platforms" },
  { name: "AI Audio", icon: "🎙️", description: "AI voice generation and audio tools" },
  { name: "AI Code", icon: "💻", description: "AI coding assistants and developer tools" },
  { name: "AI Analytics", icon: "📊", description: "AI-powered analytics and research tools" },
  { name: "Design", icon: "🖌️", description: "Design products for creators and teams" },
  { name: "Marketing", icon: "📣", description: "Marketing and SEO platforms" },
  { name: "Developer Tools", icon: "🔧", description: "Tools for developers and engineers" },
  { name: "Project Management", icon: "📋", description: "Project and task management platforms" },
  { name: "Customer Support", icon: "💬", description: "Customer service and support tools" },
  { name: "CRM", icon: "🤝", description: "Customer relationship management platforms" },
  { name: "Sales", icon: "💰", description: "Sales intelligence and outreach products" },
  { name: "HR & Recruiting", icon: "👥", description: "Human resources and recruitment tools" },
  { name: "Finance", icon: "🏦", description: "Financial management and accounting tools" },
  { name: "Security", icon: "🔒", description: "Cybersecurity and data protection tools" },
  { name: "E-commerce", icon: "🛒", description: "E-commerce platforms and tools" },
  { name: "Education", icon: "📚", description: "Educational technology and learning tools" },
  { name: "Other", icon: "📦", description: "Other products and platforms" },
];

export const CATEGORY_NAMES = CATEGORY_META.map(c => c.name);
