import mysql from 'mysql2/promise';
import fs from 'fs';

// Read the screenshot CDN map
const screenshotMap = JSON.parse(fs.readFileSync('/home/ubuntu/screenshot_cdn_map.json', 'utf-8'));

// Read the logo map from the parallel processing results
const logoResults = JSON.parse(fs.readFileSync('/home/ubuntu/collect_stack_logos.json', 'utf-8'));
const logoMap = {};
for (const r of logoResults.results) {
  logoMap[r.output.slug] = r.output.logo_url;
}

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || '');
  
  // Get all stacks
  const [stacks] = await conn.query('SELECT id, slug, logoUrl, screenshotUrl FROM stacks');
  console.log(`Found ${stacks.length} stacks in database`);
  
  let screenshotUpdated = 0;
  let logoUpdated = 0;
  
  for (const stack of stacks) {
    const slug = stack.slug;
    const updates = [];
    const values = [];
    
    // Update screenshot if we have a CDN URL
    if (screenshotMap[slug]) {
      updates.push('screenshotUrl = ?');
      values.push(screenshotMap[slug]);
    }
    
    // Update logo if we have a better URL (prefer clearbit/direct over google favicon)
    if (logoMap[slug]) {
      updates.push('logoUrl = ?');
      values.push(logoMap[slug]);
    }
    
    if (updates.length > 0) {
      values.push(stack.id);
      await conn.query(
        `UPDATE stacks SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      if (screenshotMap[slug]) screenshotUpdated++;
      if (logoMap[slug]) logoUpdated++;
      console.log(`Updated ${slug}: screenshot=${!!screenshotMap[slug]}, logo=${!!logoMap[slug]}`);
    }
  }
  
  console.log(`\nDone! Updated ${screenshotUpdated} screenshots and ${logoUpdated} logos`);
  await conn.end();
}

main().catch(console.error);
