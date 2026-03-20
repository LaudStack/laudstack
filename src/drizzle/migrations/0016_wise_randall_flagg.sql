CREATE TYPE "public"."marketplace_category" AS ENUM('templates', 'saas_boilerplates', 'micro_saas', 'full_apps', 'automation_tools', 'startup_assets');--> statement-breakpoint
CREATE TYPE "public"."marketplace_offer_status" AS ENUM('pending', 'accepted', 'rejected', 'countered', 'expired', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."marketplace_product_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'paused');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"offer_amount_cents" integer NOT NULL,
	"message" text,
	"status" "marketplace_offer_status" DEFAULT 'pending' NOT NULL,
	"counter_amount_cents" integer,
	"counter_message" text,
	"rejection_reason" text,
	"stripe_session_id" varchar(256),
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"offer_id" integer,
	"stripe_session_id" varchar(256) NOT NULL,
	"stripe_payment_intent_id" varchar(256),
	"amount" integer NOT NULL,
	"platform_fee" integer NOT NULL,
	"creator_payout" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"download_granted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(128) NOT NULL,
	"tagline" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"category" "marketplace_category" NOT NULL,
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"offers_enabled" boolean DEFAULT false NOT NULL,
	"minimum_offer_percent" integer DEFAULT 60 NOT NULL,
	"preview_image_url" text,
	"screenshots" jsonb DEFAULT '[]'::jsonb,
	"demo_url" text,
	"download_file_key" text,
	"download_file_name" varchar(256),
	"download_file_size" integer,
	"tech_stack" jsonb DEFAULT '[]'::jsonb,
	"includes" jsonb DEFAULT '[]'::jsonb,
	"features" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"status" "marketplace_product_status" DEFAULT 'draft' NOT NULL,
	"review_notes" text,
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_boosted" boolean DEFAULT false NOT NULL,
	"boost_expires_at" timestamp,
	"boost_plan" varchar(32),
	"boost_stripe_session_id" varchar(256),
	"average_rating" real DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"sales_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"body" text NOT NULL,
	"creator_reply" text,
	"creator_reply_at" timestamp,
	"status" varchar(32) DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_marketplace_creator" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "creator_activated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_account_id" varchar(128);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_connect_onboarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "creator_onboarding_stripe_session_id" varchar(256);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_product_id_marketplace_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."marketplace_products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_product_id_marketplace_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."marketplace_products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_product_id_marketplace_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."marketplace_products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mof_product_idx" ON "marketplace_offers" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mof_buyer_idx" ON "marketplace_offers" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mof_creator_idx" ON "marketplace_offers" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mof_status_idx" ON "marketplace_offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mo_buyer_idx" ON "marketplace_orders" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mo_creator_idx" ON "marketplace_orders" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mo_product_idx" ON "marketplace_orders" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mp_creator_idx" ON "marketplace_products" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mp_category_idx" ON "marketplace_products" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mp_status_idx" ON "marketplace_products" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mr_product_idx" ON "marketplace_reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mr_user_idx" ON "marketplace_reviews" USING btree ("user_id");