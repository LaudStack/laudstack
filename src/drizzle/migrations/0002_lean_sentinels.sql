ALTER TABLE "deals" ADD COLUMN "discount_percent" integer;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "deal_url" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "starts_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "claim_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "headline" varchar(256);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter_handle" varchar(128);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "founder_plan_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "founder_plan_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "discount_type";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "discount_value";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "redeem_url";