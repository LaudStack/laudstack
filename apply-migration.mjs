import postgres from "postgres";
import { readFileSync } from "fs";

// The DATABASE_URL should be a Supabase PostgreSQL connection string
// It must be set as an environment variable
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL environment variable is not set.");
  console.error("Set it to your Supabase PostgreSQL connection string.");
  process.exit(1);
}

const sql = postgres(dbUrl, {
  ssl: "require",
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
});

// Read the migration SQL
const migrationSql = readFileSync("src/drizzle/migrations/0009_thankful_stature.sql", "utf-8");

// Split by statement breakpoint and execute each statement
const statements = migrationSql
  .split("--> statement-breakpoint")
  .map(s => s.trim())
  .filter(s => s.length > 0);

async function run() {
  console.log(`Applying ${statements.length} statements...`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[${i + 1}/${statements.length}] Executing: ${stmt.substring(0, 80)}...`);
    try {
      await sql.unsafe(stmt);
      console.log(`  ✓ Success`);
    } catch (err) {
      // Skip "already exists" errors
      if (err.message.includes("already exists") || err.message.includes("duplicate")) {
        console.log(`  ⚠ Skipped (already exists)`);
      } else {
        console.error(`  ✗ Error: ${err.message}`);
      }
    }
  }
  console.log("Migration complete!");
  await sql.end();
}

run().catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});
