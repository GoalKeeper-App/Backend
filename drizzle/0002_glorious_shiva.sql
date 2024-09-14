CREATE TABLE IF NOT EXISTS "user_goal_lists" (
	"user_id" text,
	"goal_list_uuid" uuid,
	"subscribed_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_user_goal_lists" PRIMARY KEY("user_id","goal_list_uuid")
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_goal_lists" ADD CONSTRAINT "user_goal_lists_goal_list_uuid_goal_lists_uuid_fk" FOREIGN KEY ("goal_list_uuid") REFERENCES "public"."goal_lists"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
