CREATE TYPE "public"."audit_action" AS ENUM('role_change', 'user_delete', 'tool_approve', 'tool_reject', 'tool_suspend', 'tool_delete', 'tool_feature', 'tool_edit', 'review_approve', 'review_hide', 'review_remove', 'review_delete', 'deal_approve', 'deal_reject', 'deal_delete', 'promotion_assign', 'promotion_cancel', 'founder_verify', 'founder_reject', 'claim_approve', 'claim_reject', 'settings_update', 'staff_invite', 'ranking_recalc', 'comment_delete', 'marketplace_approve', 'marketplace_reject', 'other');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'customer_rep' BEFORE 'admin';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'manager' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"action" "audit_action" NOT NULL,
	"description" text NOT NULL,
	"entity_type" varchar(64),
	"entity_id" integer,
	"metadata" jsonb,
	"ip_address" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_job_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(128) NOT NULL,
	"success" boolean NOT NULL,
	"duration_ms" integer,
	"items_processed" integer,
	"error_message" text,
	"metadata" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ranking_weights" (
	"id" serial PRIMARY KEY NOT NULL,
	"weight_name" varchar(64) NOT NULL,
	"display_label" varchar(128) NOT NULL,
	"weight_value" real NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "ranking_weights_weight_name_unique" UNIQUE("weight_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ranking_weights" ADD CONSTRAINT "ranking_weights_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_admin_idx" ON "admin_audit_log" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_action_idx" ON "admin_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_created_idx" ON "admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_entity_idx" ON "admin_audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cron_job_name_idx" ON "cron_job_runs" USING btree ("job_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cron_started_idx" ON "cron_job_runs" USING btree ("started_at");