ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_goal_uuid_goal_lists_uuid_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_goal_uuid_goals_uuid_fk" FOREIGN KEY ("goal_uuid") REFERENCES "public"."goals"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
