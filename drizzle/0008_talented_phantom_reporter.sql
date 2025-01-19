DO $$ BEGIN
 ALTER TABLE "goal_lists" ADD CONSTRAINT "goal_lists_created_from_users_id_fk" FOREIGN KEY ("created_from") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
