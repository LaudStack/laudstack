import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Map seed categories to the frontend CATEGORIES taxonomy
const CATEGORY_MAP = {
  // Tool name -> correct category
  'ChatGPT': 'AI Productivity',
  'Notion': 'AI Productivity',
  'Cursor': 'AI Code',
  'Perplexity AI': 'AI Productivity',
  'Figma': 'Design',
  'Linear': 'Project Management',
  'Vercel': 'Developer Tools',
  'Stripe': 'Developer Tools',
  'Slack': 'AI Productivity',
  'Airtable': 'AI Productivity',
  'Midjourney': 'AI Image',
  'Claude': 'AI Productivity',
  'GitHub Copilot': 'AI Code',
  'Canva': 'Design',
  'Jasper': 'AI Writing',
  'Grammarly': 'AI Writing',
  'Framer': 'Design',
  'Webflow': 'Design',
  'Zapier': 'AI Productivity',
  'HubSpot': 'CRM',
  'Intercom': 'Customer Support',
  'Loom': 'AI Video',
  'Runway': 'AI Video',
  'Descript': 'AI Audio',
  'Eleven Labs': 'AI Audio',
  'Synthesia': 'AI Video',
  'Copy.ai': 'AI Writing',
  'Surfer SEO': 'Marketing',
  'Semrush': 'Marketing',
  'Mailchimp': 'Marketing',
  'Typeform': 'Marketing',
  'Calendly': 'AI Productivity',
  'Miro': 'Design',
  'Planetscale': 'Developer Tools',
  'Supabase': 'Developer Tools',
  'Railway': 'Developer Tools',
  'Render': 'Developer Tools',
  'Raycast': 'AI Productivity',
  'Arc Browser': 'AI Productivity',
  'Replit': 'AI Code',
  'v0 by Vercel': 'AI Code',
  'Bolt.new': 'AI Code',
  'Lovable': 'AI Code',
  'Datadog': 'AI Analytics',
  'Amplitude': 'AI Analytics',
  'Mixpanel': 'AI Analytics',
  'PostHog': 'AI Analytics',
  'Hotjar': 'AI Analytics',
  'Gong': 'Sales',
  'Apollo.io': 'Sales',
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  for (const [name, category] of Object.entries(CATEGORY_MAP)) {
    const [result] = await conn.execute(
      'UPDATE stacks SET category = ? WHERE name = ?',
      [category, name]
    );
    if (result.affectedRows > 0) {
      console.log(`✅ ${name} → ${category}`);
    } else {
      console.log(`⚠️  ${name} not found`);
    }
  }
  
  // Verify the new distribution
  const [rows] = await conn.execute(
    'SELECT category, COUNT(*) as cnt FROM stacks WHERE status = "published" GROUP BY category ORDER BY cnt DESC'
  );
  console.log('\nNew category distribution:');
  rows.forEach(r => console.log(`  ${r.category}: ${r.cnt}`));
  
  await conn.end();
}

main().catch(console.error);
