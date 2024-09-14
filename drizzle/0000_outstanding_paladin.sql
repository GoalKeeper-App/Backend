CREATE TABLE IF NOT EXISTS "goal_lists" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goals" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"list_uuid" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_achievements" (
	"user_id" integer,
	"goal_uuid" uuid,
	"achieved_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_user_achviement" PRIMARY KEY("goal_uuid","user_id","achieved_at")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_list_uuid_goal_lists_uuid_fk" FOREIGN KEY ("list_uuid") REFERENCES "public"."goal_lists"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_goal_uuid_goal_lists_uuid_fk" FOREIGN KEY ("goal_uuid") REFERENCES "public"."goal_lists"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
