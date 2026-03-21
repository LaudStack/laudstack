-- Add unique constraint to prevent duplicate reviews per user per tool
-- This enforces at the DB level what was previously only checked in application code
-- Note: only applies to non-removed reviews (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_tool_user_unique"
  ON "reviews" ("tool_id", "user_id")
  WHERE "status" != 'removed';
