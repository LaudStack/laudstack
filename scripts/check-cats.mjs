import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();

// Category distribution
const cats = await client.query(`SELECT category, COUNT(*) as cnt FROM tools WHERE status IN ('approved','featured') AND is_visible = true GROUP BY category ORDER BY cnt DESC`);
console.log("=== Category Distribution ===");
cats.rows.forEach(r => console.log(`  ${r.category}: ${r.cnt}`));

// Check AI Video tools
console.log("\n=== AI Video tools (first 5) ===");
const vids = await client.query(`SELECT name, category, tags, rank_score FROM tools WHERE category = 'AI Video' AND status IN ('approved','featured') AND is_visible = true ORDER BY rank_score DESC LIMIT 5`);
vids.rows.forEach(r => console.log(`  ${r.name} | rank: ${r.rank_score} | tags: ${JSON.stringify(r.tags)}`));

// Check AI Writing tools
console.log("\n=== AI Writing tools (first 5) ===");
const writes = await client.query(`SELECT name, category, tags, rank_score FROM tools WHERE category = 'AI Writing' AND status IN ('approved','featured') AND is_visible = true ORDER BY rank_score DESC LIMIT 5`);
writes.rows.forEach(r => console.log(`  ${r.name} | rank: ${r.rank_score} | tags: ${JSON.stringify(r.tags)}`));

// Check for cross-contamination via tags
console.log("\n=== Non-AI-Video tools matching 'video' via tags ===");
const tagOverlap = await client.query(`
  SELECT name, category, tags, rank_score 
  FROM tools 
  WHERE category != 'AI Video' 
    AND status IN ('approved','featured') 
    AND is_visible = true
    AND (
      tags::text ILIKE '%video%' 
      OR tags::text ILIKE '%ai video%'
    )
  ORDER BY rank_score DESC 
  LIMIT 10
`);
tagOverlap.rows.forEach(r => console.log(`  ${r.name} [${r.category}] | rank: ${r.rank_score} | tags: ${JSON.stringify(r.tags)}`));

// Check the tag overlap logic: what tags in AI Writing contain "ai" (which would match "AI Video" category)
console.log("\n=== Tag overlap simulation: AI Writing tags containing 'ai' ===");
const aiTags = await client.query(`
  SELECT DISTINCT t.tag, name, category
  FROM tools, jsonb_array_elements_text(tags) AS t(tag)
  WHERE category = 'AI Writing' 
    AND status IN ('approved','featured') 
    AND is_visible = true
    AND LOWER(t.tag) LIKE '%ai%'
  LIMIT 15
`);
aiTags.rows.forEach(r => console.log(`  "${r.tag}" in ${r.name} [${r.category}]`));

// Check what the current algorithm would return for "AI Video" selection
console.log("\n=== Simulated match: tools where category='AI Video' OR tags contain 'video' ===");
const simMatch = await client.query(`
  SELECT name, category, rank_score, average_rating, pricing_model
  FROM tools 
  WHERE status IN ('approved','featured') 
    AND is_visible = true
    AND (category = 'AI Video' OR tags::text ILIKE '%video%')
  ORDER BY rank_score DESC 
  LIMIT 15
`);
simMatch.rows.forEach(r => console.log(`  ${r.name} [${r.category}] | rank: ${r.rank_score} | rating: ${r.average_rating} | ${r.pricing_model}`));

await client.end();
