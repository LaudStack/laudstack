// Script to pull all stacks from Supabase and audit their categories and tags
const SUPABASE_URL = 'https://ehnlovnzpfvaxwwmgppj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmxvdm56cGZ2YXh3d21ncHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI1NDE2OCwiZXhwIjoyMDg4ODMwMTY4fQ.aCOyOrFHgQ2r25KdYN9xhMbuwR3-M-HeK0maqRl5-xo';

async function main() {
  // Fetch all tools via Supabase REST API
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/tools?select=id,name,slug,category,tags,status,pricing_model,description,tagline,is_visible,website_url&order=category.asc,name.asc&limit=1000`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    }
  );

  if (!res.ok) {
    console.error('Error:', res.status, await res.text());
    return;
  }

  const tools = await res.json();
  console.log(`Total tools: ${tools.length}\n`);

  // Group by category
  const byCategory = {};
  for (const t of tools) {
    const cat = t.category || 'UNCATEGORIZED';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }

  // Print summary
  console.log('=== CATEGORY DISTRIBUTION ===');
  for (const [cat, catTools] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat}: ${catTools.length} stacks`);
  }
  console.log('');

  // Print each tool with details
  console.log('=== ALL STACKS BY CATEGORY ===\n');
  for (const [cat, catTools] of Object.entries(byCategory).sort()) {
    console.log(`\n--- ${cat} (${catTools.length}) ---`);
    for (const t of catTools) {
      const tags = Array.isArray(t.tags) ? t.tags : [];
      console.log(`  [${t.id}] ${t.name} | status:${t.status} | pricing:${t.pricing_model} | visible:${t.is_visible}`);
      console.log(`      Tagline: ${(t.tagline || '').substring(0, 100)}`);
      console.log(`      Tags: ${tags.length > 0 ? tags.join(', ') : '(none)'}`);
      console.log(`      Desc: ${(t.description || '').substring(0, 120)}`);
    }
  }
}

main().catch(console.error);
