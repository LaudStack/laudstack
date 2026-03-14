CREATE TABLE IF NOT EXISTS "laud_rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ip_address" varchar(45),
	"action_type" varchar(20) DEFAULT 'laud' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ip_address" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_flagged" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "flag_reason" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "flagged_by" integer;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "flagged_at" timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "moderation_note" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "moderated_by" integer;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "moderated_at" timestamp;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "scheduled_launch_at" timestamp;--> statement-breakpoint
ALTER TABLE "upvotes" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "upvotes" ADD COLUMN "user_agent" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laud_rate_limits" ADD CONSTRAINT "laud_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_rate_limits" ADD CONSTRAINT "review_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_flagged_by_users_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "upvotes_tool_user_unique" ON "upvotes" USING btree ("tool_id","user_id");