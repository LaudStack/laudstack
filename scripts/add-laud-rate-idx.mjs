import postgres from "postgres";

const DATABASE_URL = "postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres";

const sql = postgres(DATABASE_URL, { ssl: "require" });

async function run() {
  console.log("Adding index on laud_rate_limits(user_id, created_at)...");
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_laud_rate_limits_user_created 
              ON laud_rate_limits (user_id, created_at)`;
    console.log("✅ Index on laud_rate_limits(user_id, created_at) created");
  } catch (e) {
    console.log("Index may already exist:", e.message);
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_laud_rate_limits_ip_created 
              ON laud_rate_limits (ip_address, created_at)`;
    console.log("✅ Index on laud_rate_limits(ip_address, created_at) created");
  } catch (e) {
    console.log("Index may already exist:", e.message);
  }

  // Also add index on upvotes(user_id) for getUserLaudedToolIds performance
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_upvotes_user_id 
              ON upvotes (user_id)`;
    console.log("✅ Index on upvotes(user_id) created");
  } catch (e) {
    console.log("Index may already exist:", e.message);
  }

  await sql.end();
  console.log("Done!");
}

run().catch(console.error);
