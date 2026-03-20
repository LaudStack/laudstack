CREATE TYPE "public"."email_template_recipient" AS ENUM('user', 'founder', 'admin');--> statement-breakpoint
CREATE TYPE "public"."promotion_status" AS ENUM('pending_payment', 'paid', 'scheduled', 'active', 'expired', 'cancelled', 'failed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."promotion_target" AS ENUM('stack', 'deal', 'marketplace');--> statement-breakpoint
CREATE TYPE "public"."promotion_type" AS ENUM('stack_featured', 'stack_spotlight', 'stack_category_boost', 'deal_pinned', 'deal_featured', 'deal_of_day', 'marketplace_boost', 'marketplace_spotlight');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal_of_day_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot_date" varchar(10) NOT NULL,
	"promotion_id" integer NOT NULL,
	"deal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_confirmed" boolean DEFAULT false NOT NULL,
	"hold_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deal_of_day_slots_slot_date_unique" UNIQUE("slot_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"subject" varchar(512) NOT NULL,
	"trigger" varchar(256) NOT NULL,
	"recipient" "email_template_recipient" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"body_html" text,
	"body_text" text,
	"preview" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promotion_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"promotion_type" "promotion_type" NOT NULL,
	"duration_days" integer NOT NULL,
	"price_in_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"display_name" varchar(128) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"target" "promotion_target" NOT NULL,
	"type" "promotion_type" NOT NULL,
	"target_entity_id" integer NOT NULL,
	"duration_days" integer NOT NULL,
	"amount_paid" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"status" "promotion_status" DEFAULT 'pending_payment' NOT NULL,
	"stripe_session_id" varchar(256),
	"stripe_payment_intent_id" varchar(256),
	"starts_at" timestamp,
	"expires_at" timestamp,
	"slot_date" varchar(10),
	"admin_id" integer,
	"admin_notes" text,
	"is_manual" boolean DEFAULT false NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_of_day_slots" ADD CONSTRAINT "deal_of_day_slots_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_of_day_slots" ADD CONSTRAINT "deal_of_day_slots_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_of_day_slots" ADD CONSTRAINT "deal_of_day_slots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promotions" ADD CONSTRAINT "promotions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promotions" ADD CONSTRAINT "promotions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dotd_slot_date_idx" ON "deal_of_day_slots" USING btree ("slot_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dotd_promotion_idx" ON "deal_of_day_slots" USING btree ("promotion_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pricing_type_duration_idx" ON "promotion_pricing" USING btree ("promotion_type","duration_days");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_user_idx" ON "promotions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_target_entity_idx" ON "promotions" USING btree ("target","target_entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_status_idx" ON "promotions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_expires_idx" ON "promotions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "promo_slot_date_idx" ON "promotions" USING btree ("slot_date");