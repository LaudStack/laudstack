-- Migration: Add Stack Listing Features
-- Run this migration to add new fields and tables for the complete stack listing ecosystem

-- Add 'suspended' and 'unpublished' to tool_status enum
ALTER TYPE "tool_status" ADD VALUE IF NOT EXISTS 'suspended';
ALTER TYPE "tool_status" ADD VALUE IF NOT EXISTS 'unpublished';

-- Add new columns to tools table
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "affiliate_url" text;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "outbound_click_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "save_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "is_spotlighted" boolean DEFAULT false NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "is_trending" boolean DEFAULT false NOT NULL;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "claimed_by" integer;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "claimed_at" timestamp;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "short_description" text;
ALTER TABLE "tools" ADD COLUMN IF NOT EXISTS "pricing_details" text;

-- Create tool_screenshots table
CREATE TABLE IF NOT EXISTS "tool_screenshots" (
  "id" serial PRIMARY KEY,
  "tool_id" integer NOT NULL REFERENCES "tools"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "alt_text" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS "moderation_logs" (
  "id" serial PRIMARY KEY,
  "tool_id" integer NOT NULL REFERENCES "tools"("id") ON DELETE CASCADE,
  "admin_id" integer NOT NULL REFERENCES "users"("id"),
  "action" text NOT NULL,
  "reason" text,
  "previous_status" text,
  "new_status" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create tool_views table
CREATE TABLE IF NOT EXISTS "tool_views" (
  "id" serial PRIMARY KEY,
  "tool_id" integer NOT NULL REFERENCES "tools"("id") ON DELETE CASCADE,
  "user_id" integer,
  "ip_address" text,
  "user_agent" text,
  "referrer" text,
  "viewed_at" timestamp DEFAULT now() NOT NULL
);

-- Create outbound_clicks table
CREATE TABLE IF NOT EXISTS "outbound_clicks" (
  "id" serial PRIMARY KEY,
  "tool_id" integer NOT NULL REFERENCES "tools"("id") ON DELETE CASCADE,
  "user_id" integer,
  "click_type" text DEFAULT 'website' NOT NULL,
  "ip_address" text,
  "clicked_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key for claimed_by
ALTER TABLE "tools" ADD CONSTRAINT IF NOT EXISTS "tools_claimed_by_fk" 
  FOREIGN KEY ("claimed_by") REFERENCES "users"("id");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_tool_views_tool_id" ON "tool_views"("tool_id");
CREATE INDEX IF NOT EXISTS "idx_tool_views_viewed_at" ON "tool_views"("viewed_at");
CREATE INDEX IF NOT EXISTS "idx_outbound_clicks_tool_id" ON "outbound_clicks"("tool_id");
CREATE INDEX IF NOT EXISTS "idx_outbound_clicks_clicked_at" ON "outbound_clicks"("clicked_at");
CREATE INDEX IF NOT EXISTS "idx_tool_screenshots_tool_id" ON "tool_screenshots"("tool_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_tool_id" ON "moderation_logs"("tool_id");
CREATE INDEX IF NOT EXISTS "idx_tools_is_visible" ON "tools"("is_visible");
CREATE INDEX IF NOT EXISTS "idx_tools_is_spotlighted" ON "tools"("is_spotlighted");
