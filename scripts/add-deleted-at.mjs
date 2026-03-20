// Migration: Add deleted_at column to comments table + enable Supabase Realtime
import postgres from 'postgres';
const sql = postgres('postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: 'require',
});

async function run() {
  // 1. Add deleted_at column if it doesn't exist
  const checkCol = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'deleted_at'
  `;

  if (checkCol.length === 0) {
    await sql`ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP`;
    console.log("✅ Added deleted_at column to comments table");
  } else {
    console.log("ℹ️  deleted_at column already exists");
  }

  // 2. Enable Supabase Realtime on the comments table
  try {
    await sql`ALTER PUBLICATION supabase_realtime ADD TABLE comments`;
    console.log("✅ Enabled Supabase Realtime on comments table");
  } catch (e) {
    if (e.message?.includes("already member")) {
      console.log("ℹ️  comments table already in supabase_realtime publication");
    } else {
      console.log("⚠️  Could not enable Realtime:", e.message);
    }
  }

  await sql.end();
  console.log("Done.");
}

run().catch(e => { console.error(e); process.exit(1); });
