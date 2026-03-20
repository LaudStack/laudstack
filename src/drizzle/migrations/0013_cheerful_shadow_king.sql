CREATE TYPE "public"."contact_submission_status" AS ENUM('new', 'read', 'replied', 'archived');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"topic" varchar(64) DEFAULT 'general' NOT NULL,
	"message" text NOT NULL,
	"status" "contact_submission_status" DEFAULT 'new' NOT NULL,
	"ip_address" varchar(45),
	"admin_notes" text,
	"email_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_submissions_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_submissions_created_idx" ON "contact_submissions" USING btree ("created_at");