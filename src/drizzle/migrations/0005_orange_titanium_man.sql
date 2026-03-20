CREATE TABLE IF NOT EXISTS "launch_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"tool_id" integer,
	"submission_id" integer,
	"user_id" integer,
	"notified" boolean DEFAULT false NOT NULL,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "launch_notifications" ADD CONSTRAINT "launch_notifications_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "launch_notifications" ADD CONSTRAINT "launch_notifications_submission_id_tool_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."tool_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "launch_notifications" ADD CONSTRAINT "launch_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "launch_notif_email_tool_idx" ON "launch_notifications" USING btree ("email","tool_id");