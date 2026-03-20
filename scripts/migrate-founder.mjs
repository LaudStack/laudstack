import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const connectionString = envVars.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

async function migrate() {
  console.log('Adding founder_reply and founder_reply_at columns to reviews...');
  try {
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS founder_reply TEXT`;
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS founder_reply_at TIMESTAMP`;
    console.log('✓ Reviews table updated');
  } catch (e) {
    console.log('Reviews columns may already exist:', e.message);
  }

  console.log('Adding max_claims and created_by columns to deals...');
  try {
    await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS max_claims INTEGER`;
    await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)`;
    console.log('✓ Deals table updated');
  } catch (e) {
    console.log('Deals columns may already exist:', e.message);
  }

  console.log('Migration complete!');
  await sql.end();
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
