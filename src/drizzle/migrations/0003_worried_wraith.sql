ALTER TYPE "public"."tool_status" ADD VALUE 'suspended';--> statement-breakpoint
ALTER TYPE "public"."tool_status" ADD VALUE 'unpublished';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moderation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"action" varchar(64) NOT NULL,
	"previous_status" varchar(32),
	"new_status" varchar(32),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outbound_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"user_id" integer,
	"link_type" varchar(32) DEFAULT 'website' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool_screenshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"url" text NOT NULL,
	"caption" varchar(256),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_id" integer NOT NULL,
	"visitor_ip" varchar(64),
	"user_agent" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "max_claims" integer;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "founder_reply" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "founder_reply_at" timestamp;--> statement-breakpoint
ALTER TABLE "tool_claims" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "tool_claims" ADD COLUMN "verify_method" varchar(32);--> statement-breakpoint
ALTER TABLE "tool_claims" ADD COLUMN "proof_url" text;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "affiliate_url" text;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "outbound_click_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "save_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "is_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "is_spotlighted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "is_trending" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "claimed_by" integer;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "pricing_details" text;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "pricing_tiers" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "job_title" varchar(128);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company" varchar(128);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "use_case" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_source" varchar(64);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outbound_clicks" ADD CONSTRAINT "outbound_clicks_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outbound_clicks" ADD CONSTRAINT "outbound_clicks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tool_screenshots" ADD CONSTRAINT "tool_screenshots_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tool_views" ADD CONSTRAINT "tool_views_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deals" ADD CONSTRAINT "deals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tools" ADD CONSTRAINT "tools_claimed_by_users_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
