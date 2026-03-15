// Migration: Add UNIQUE constraint on saved_tools(tool_id, user_id)
// Also adds indexes and cleans up any existing duplicates.
import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: 'require',
});

async function run() {
  console.log("Connected to Supabase");

  // 1. Clean up any existing duplicate rows (keep the oldest by id)
  const dupes = await sql`
    SELECT tool_id, user_id, COUNT(*) as cnt
    FROM saved_tools
    GROUP BY tool_id, user_id
    HAVING COUNT(*) > 1
  `;
  if (dupes.length > 0) {
    console.log(`Found ${dupes.length} duplicate (tool_id, user_id) pairs. Cleaning up...`);
    await sql`
      DELETE FROM saved_tools
      WHERE id NOT IN (
        SELECT MIN(id) FROM saved_tools GROUP BY tool_id, user_id
      )
    `;
    console.log("Duplicates removed.");
  } else {
    console.log("No duplicate saves found.");
  }

  // 2. Add unique constraint
  await sql`
    DO $$ BEGIN
      ALTER TABLE saved_tools
        ADD CONSTRAINT saved_tools_tool_user_unique UNIQUE (tool_id, user_id);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END $$;
  `;
  console.log("UNIQUE constraint on (tool_id, user_id) added.");

  // 3. Add index on user_id for fast lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_saved_tools_user_id ON saved_tools (user_id);
  `;
  console.log("Index on user_id added.");

  // 4. Add index on tool_id for save count queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_saved_tools_tool_id ON saved_tools (tool_id);
  `;
  console.log("Index on tool_id added.");

  await sql.end();
  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
