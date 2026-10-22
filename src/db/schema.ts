import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * A run is one pass at a mode. The active run has no `ended_at`; starting over ends it,
 * snapshotting how far the user got, and a fresh run is created on next use.
 */
export const runs = pgTable(
  "runs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    mode: text("mode", { enum: ["quiz", "builder"] }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    completedCount: integer("completed_count"),
    totalCount: integer("total_count"),
  },
  (t) => [
    uniqueIndex("runs_one_active_idx").on(t.userId, t.mode).where(sql`${t.endedAt} is null`),
    index("runs_user_mode_idx").on(t.userId, t.mode),
  ],
);

export const completions = pgTable(
  "completions",
  {
    runId: integer("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    attempts: integer("attempts").notNull().default(1),
    /** For builder challenges, the regex the user solved it with. */
    answer: text("answer"),
  },
  (t) => [primaryKey({ columns: [t.runId, t.itemId] })],
);
