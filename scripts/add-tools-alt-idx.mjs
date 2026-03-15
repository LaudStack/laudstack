import postgres from "postgres";
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const sql = postgres(DATABASE_URL, { ssl: "require" });

async function main() {
  console.log("Adding composite indexes for alternatives/category queries...");

  // Composite index: (status, is_visible, category) — covers the exact WHERE pattern
  // used by getAlternativesData, getCategorySEOData, getAllCategoriesWithCounts, etc.
  await sql`CREATE INDEX IF NOT EXISTS idx_tools_status_visible_category 
    ON tools (status, is_visible, category)`;
  console.log("✓ idx_tools_status_visible_category");

  // Index on rank_score for ORDER BY desc(rankScore) — used in most listing queries
  await sql`CREATE INDEX IF NOT EXISTS idx_tools_rank_score 
    ON tools (rank_score DESC)`;
  console.log("✓ idx_tools_rank_score");

  // Index on category alone for GROUP BY queries
  await sql`CREATE INDEX IF NOT EXISTS idx_tools_category 
    ON tools (category)`;
  console.log("✓ idx_tools_category");

  console.log("Done.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
