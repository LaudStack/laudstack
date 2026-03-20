CREATE TABLE IF NOT EXISTS "stack_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tool_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "stack_follows" ADD CONSTRAINT "stack_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stack_follows" ADD CONSTRAINT "stack_follows_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stack_follows_unique_idx" ON "stack_follows" USING btree ("user_id","tool_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stack_follows_user_idx" ON "stack_follows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stack_follows_tool_idx" ON "stack_follows" USING btree ("tool_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_follows_unique_idx" ON "user_follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_follows_follower_idx" ON "user_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_follows_following_idx" ON "user_follows" USING btree ("following_id");