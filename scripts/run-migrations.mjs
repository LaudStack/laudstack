import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: 'require',
});

async function run() {
  console.log('=== Checking existing tables ===');
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log('Existing tables:', tables.map(t => t.table_name).join(', '));

  // 1. Create comments table if not exists
  console.log('\n=== Migration: comments table ===');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" serial PRIMARY KEY NOT NULL,
        "tool_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "parent_comment_id" integer,
        "content" text NOT NULL,
        "is_deleted" boolean DEFAULT false NOT NULL,
        "is_edited" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('✓ comments table created/verified');
  } catch (e) {
    console.log('comments table:', e.message);
  }

  // Add foreign keys for comments
  try {
    await sql`
      DO $$ BEGIN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_tool_id_tools_id_fk" 
        FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `;
    console.log('✓ comments FK tool_id added/verified');
  } catch (e) {
    console.log('comments FK tool_id:', e.message);
  }

  try {
    await sql`
      DO $$ BEGIN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `;
    console.log('✓ comments FK user_id added/verified');
  } catch (e) {
    console.log('comments FK user_id:', e.message);
  }

  // Add index on tool_id
  try {
    await sql`CREATE INDEX IF NOT EXISTS "comments_tool_id_idx" ON "comments" USING btree ("tool_id")`;
    console.log('✓ comments_tool_id_idx created/verified');
  } catch (e) {
    console.log('comments index:', e.message);
  }

  // 2. Create review_helpful_votes table if not exists
  console.log('\n=== Migration: review_helpful_votes table ===');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "review_helpful_votes" (
        "id" serial PRIMARY KEY NOT NULL,
        "review_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('✓ review_helpful_votes table created/verified');
  } catch (e) {
    console.log('review_helpful_votes table:', e.message);
  }

  // Add foreign keys
  try {
    await sql`
      DO $$ BEGIN
        ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_reviews_id_fk" 
        FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `;
    console.log('✓ review_helpful_votes FK review_id added/verified');
  } catch (e) {
    console.log('review_helpful_votes FK review_id:', e.message);
  }

  try {
    await sql`
      DO $$ BEGIN
        ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `;
    console.log('✓ review_helpful_votes FK user_id added/verified');
  } catch (e) {
    console.log('review_helpful_votes FK user_id:', e.message);
  }

  // Add unique index and regular index
  try {
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "review_helpful_votes_unique" ON "review_helpful_votes" USING btree ("review_id","user_id")`;
    console.log('✓ review_helpful_votes_unique index created/verified');
  } catch (e) {
    console.log('review_helpful_votes unique index:', e.message);
  }

  try {
    await sql`CREATE INDEX IF NOT EXISTS "review_helpful_votes_review_idx" ON "review_helpful_votes" USING btree ("review_id")`;
    console.log('✓ review_helpful_votes_review_idx created/verified');
  } catch (e) {
    console.log('review_helpful_votes review index:', e.message);
  }

  // 3. Verify final state
  console.log('\n=== Final verification ===');
  const finalTables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('comments', 'review_helpful_votes')
    ORDER BY table_name;
  `;
  console.log('Verified tables:', finalTables.map(t => t.table_name).join(', '));

  // Check indexes
  const indexes = await sql`
    SELECT indexname, tablename FROM pg_indexes 
    WHERE tablename IN ('comments', 'review_helpful_votes')
    ORDER BY tablename, indexname;
  `;
  console.log('Indexes:');
  for (const idx of indexes) {
    console.log(`  ${idx.tablename}: ${idx.indexname}`);
  }

  await sql.end();
  console.log('\n✅ All migrations complete!');
}

run().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
