// Category definitions — icons and descriptions for each category
// Counts are computed dynamically from the DB via tRPC

export interface CategoryDef {
  name: string;
  icon: string;
  description: string;
}

export const CATEGORY_DEFS: CategoryDef[] = [
  { name: 'All', icon: '🌐', description: 'All tools on LaudStack' },
  { name: 'AI Productivity', icon: '⚡', description: 'AI-powered productivity and automation tools' },
  { name: 'AI Writing', icon: '✍️', description: 'AI writing assistants and content generators' },
  { name: 'AI Image', icon: '🎨', description: 'AI image generation and editing tools' },
  { name: 'AI Video', icon: '🎬', description: 'AI video creation and editing platforms' },
  { name: 'AI Audio', icon: '🎙️', description: 'AI voice generation and audio tools' },
  { name: 'AI Code', icon: '💻', description: 'AI coding assistants and developer tools' },
  { name: 'AI Analytics', icon: '📊', description: 'AI-powered analytics and research tools' },
  { name: 'Design', icon: '🖌️', description: 'Design tools for creators and teams' },
  { name: 'Marketing', icon: '📣', description: 'Marketing and SEO platforms' },
  { name: 'Developer Tools', icon: '🔧', description: 'Tools for developers and engineers' },
  { name: 'Project Management', icon: '📋', description: 'Project and task management platforms' },
  { name: 'Customer Support', icon: '💬', description: 'Customer service and support tools' },
  { name: 'CRM', icon: '🤝', description: 'Customer relationship management platforms' },
  { name: 'Sales', icon: '💰', description: 'Sales intelligence and outreach tools' },
];

// Helper to build categories with counts from stack data
export function buildCategoriesWithCounts(
  stacks: { category: string }[],
  total?: number
): { name: string; icon: string; count: number; description: string }[] {
  const countMap: Record<string, number> = {};
  stacks.forEach((s) => {
    countMap[s.category] = (countMap[s.category] || 0) + 1;
  });

  return CATEGORY_DEFS.map((cat) => ({
    ...cat,
    count: cat.name === 'All' ? (total ?? stacks.length) : (countMap[cat.name] || 0),
  }));
}
