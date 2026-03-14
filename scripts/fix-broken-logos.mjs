import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Broken logos with their website domains for Google favicon fallback
const brokenLogos = [
  { id: 2, slug: 'notion', domain: 'notion.so' },
  { id: 10, slug: 'airtable', domain: 'airtable.com' },
  { id: 15, slug: 'loom', domain: 'loom.com' },
  { id: 18, slug: 'resend', domain: 'resend.com' },
  { id: 22, slug: 'intercom', domain: 'intercom.com' },
  { id: 25, slug: 'descript', domain: 'descript.com' },
  { id: 27, slug: 'grammarly', domain: 'grammarly.com' },
  { id: 30, slug: 'notion-ai', domain: 'notion.so' },
  { id: 37, slug: 'mixpanel', domain: 'mixpanel.com' },
  { id: 43, slug: 'coda', domain: 'coda.io' },
  { id: 47, slug: 'coolify', domain: 'coolify.io' },
  { id: 49, slug: 'plausible-analytics', domain: 'plausible.io' },
];

const STATIC_DIR = '/home/ubuntu/webdev-static-assets';
if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });

const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const logo of brokenLogos) {
  const outFile = path.join(STATIC_DIR, `logo-${logo.slug}.png`);
  
  // Use Google's favicon service which is very reliable at 128px
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${logo.domain}&sz=128`;
  
  try {
    console.log(`Downloading logo for ${logo.slug} from Google favicons...`);
    execSync(`curl -sL -o "${outFile}" "${faviconUrl}"`, { timeout: 10000 });
    
    // Check if file was downloaded
    const stats = fs.statSync(outFile);
    if (stats.size < 100) {
      console.log(`  WARNING: File too small (${stats.size} bytes), trying gstatic...`);
      const gstaticUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${logo.domain}&size=128`;
      execSync(`curl -sL -o "${outFile}" "${gstaticUrl}"`, { timeout: 10000 });
    }
    
    // Upload to CDN
    console.log(`  Uploading to CDN...`);
    const cdnResult = execSync(`manus-upload-file --webdev "${outFile}"`, { encoding: 'utf-8', timeout: 30000 }).trim();
    
    // Extract URL from output
    const urlMatch = cdnResult.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const cdnUrl = urlMatch[0];
      console.log(`  CDN URL: ${cdnUrl}`);
      
      // Update database
      await conn.execute('UPDATE stacks SET logoUrl = ? WHERE id = ?', [cdnUrl, logo.id]);
      console.log(`  Updated DB for ${logo.slug} (id=${logo.id})`);
    } else {
      console.log(`  ERROR: Could not extract CDN URL from: ${cdnResult}`);
    }
  } catch (e) {
    console.log(`  ERROR for ${logo.slug}: ${e.message}`);
  }
}

await conn.end();
console.log('Done fixing broken logos.');
