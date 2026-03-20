CREATE TYPE "public"."deal_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."deal_placement" AS ENUM('none', 'pinned', 'featured', 'deal_of_day');--> statement-breakpoint
CREATE TYPE "public"."deal_type" AS ENUM('discount', 'lifetime', 'free_trial', 'exclusive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"deal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "is_active" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "deal_type" "deal_type" DEFAULT 'discount' NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "original_price" varchar(32);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "deal_price" varchar(32);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "placement" "deal_placement" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "approval_status" "deal_approval_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "placement_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "placement_plan" varchar(32);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "placement_paid_amount" integer;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "placement_stripe_session_id" varchar(256);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_claims" ADD CONSTRAINT "deal_claims_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_claims" ADD CONSTRAINT "deal_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "deal_claims_unique_idx" ON "deal_claims" USING btree ("deal_id","user_id");