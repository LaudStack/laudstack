CREATE TYPE "public"."admin_invite_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" "user_role" NOT NULL,
	"token" varchar(128) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" "admin_invite_status" DEFAULT 'pending' NOT NULL,
	"invited_by" integer NOT NULL,
	"message" text,
	"accepted_at" timestamp,
	"accepted_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_invites" ADD CONSTRAINT "admin_invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_invites" ADD CONSTRAINT "admin_invites_accepted_user_id_users_id_fk" FOREIGN KEY ("accepted_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_invites_email_idx" ON "admin_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_invites_token_idx" ON "admin_invites" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_invites_status_idx" ON "admin_invites" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outbound_clicks_created_at_idx" ON "outbound_clicks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_tool_id_idx" ON "reviews" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tool_views_tool_id_idx" ON "tool_views" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tool_views_created_at_idx" ON "tool_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_status_idx" ON "tools" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_status_visible_idx" ON "tools" USING btree ("status","is_visible");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_category_idx" ON "tools" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_rank_score_idx" ON "tools" USING btree ("rank_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_created_at_idx" ON "tools" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_launched_at_idx" ON "tools" USING btree ("launched_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_supabase_id_idx" ON "users" USING btree ("supabase_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_founder_status_idx" ON "users" USING btree ("founder_status");