CREATE TABLE IF NOT EXISTS "goals" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uuser_idx" ON "goals" USING btree ("uuid");