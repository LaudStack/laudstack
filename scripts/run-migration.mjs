import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

console.log("Connecting to:", DATABASE_URL.replace(/:[^:@]+@/, ":****@").substring(0, 80));

const sql = postgres(DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
  ssl: "require",
  prepare: false,
});

const migrationFile = path.join(__dirname, "../src/drizzle/migrations/0013_cheerful_shadow_king.sql");
const migrationSql = fs.readFileSync(migrationFile, "utf8");

// Split on the drizzle statement breakpoint marker
const statements = migrationSql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Running ${statements.length} migration statements...`);

try {
  for (const stmt of statements) {
    console.log("  Executing:", stmt.substring(0, 80) + "...");
    await sql.unsafe(stmt);
    console.log("  ✓ Done");
  }
  console.log("\n✅ Migration completed successfully!");
} catch (err) {
  if (err.message?.includes("already exists")) {
    console.log("  ⚠ Already exists, skipping...");
    console.log("\n✅ Migration already applied.");
  } else {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  }
} finally {
  await sql.end();
}
