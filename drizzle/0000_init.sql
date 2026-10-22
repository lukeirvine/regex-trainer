CREATE TABLE "completions" (
	"run_id" integer NOT NULL,
	"item_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"answer" text,
	CONSTRAINT "completions_run_id_item_id_pk" PRIMARY KEY("run_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mode" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"completed_count" integer,
	"total_count" integer
);
--> statement-breakpoint
ALTER TABLE "completions" ADD CONSTRAINT "completions_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "runs_one_active_idx" ON "runs" USING btree ("user_id","mode") WHERE "runs"."ended_at" is null;--> statement-breakpoint
CREATE INDEX "runs_user_mode_idx" ON "runs" USING btree ("user_id","mode");