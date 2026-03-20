/**
 * Migration: Add index on parent_comment_id and FK constraint
 * for the comments table.
 */
import postgres from "postgres";

const DATABASE_URL = 'postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

const sql = postgres(DATABASE_URL, { ssl: "require" });

async function run() {
  console.log("Adding index on comments.parent_comment_id...");
  try {
    await sql`CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments (parent_comment_id)`;
    console.log("  ✓ Index created");
  } catch (e) {
    console.log("  ⚠ Index may already exist:", e.message);
  }

  console.log("Adding FK constraint on comments.parent_comment_id...");
  try {
    await sql`ALTER TABLE comments ADD CONSTRAINT comments_parent_comment_id_fk FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL`;
    console.log("  ✓ FK constraint added");
  } catch (e) {
    if (e.message?.includes("already exists")) {
      console.log("  ⚠ FK constraint already exists");
    } else {
      console.log("  ⚠ FK constraint error:", e.message);
    }
  }

  await sql.end();
  console.log("Done.");
}

run().catch(e => { console.error(e); process.exit(1); });
