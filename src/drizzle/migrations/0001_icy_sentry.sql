CREATE TYPE "public"."founder_status" AS ENUM('none', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"supabase_id" varchar(128) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"tagline" varchar(200) NOT NULL,
	"website" varchar(512) NOT NULL,
	"description" text NOT NULL,
	"logo_url" varchar(512),
	"launch_date" timestamp,
	"category" varchar(64),
	"tags" text,
	"pricing_model" varchar(32),
	"pricing_plans" text,
	"screenshots" text,
	"demo_video_url" varchar(512),
	"verify_method" varchar(32) DEFAULT 'meta' NOT NULL,
	"verify_email" varchar(256),
	"verification_token" varchar(128),
	"founder_name" varchar(128),
	"founder_role" varchar(128),
	"founder_bio" text,
	"founder_linkedin" varchar(512),
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "founder_status" "founder_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "founder_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "founder_bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "founder_website" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tool_submissions" ADD CONSTRAINT "tool_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
