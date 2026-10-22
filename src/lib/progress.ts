import "server-only";
import { and, asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { totalItems } from "@/content";
import type { Mode } from "@/content/types";
import { getDb } from "@/db";
import { completions, runs } from "@/db/schema";

export type Completion = { itemId: string; completedAt: Date; attempts: number; answer: string | null };

export type Progress = {
  runId: number;
  startedAt: Date;
  completed: Map<string, Completion>;
  total: number;
};

export type HistoryEntry = {
  id: number;
  startedAt: Date;
  endedAt: Date;
  completedCount: number;
  totalCount: number;
};

/** The user's active run for a mode, created on first use. */
export async function getActiveRun(userId: string, mode: Mode) {
  const db = await getDb();
  const active = and(eq(runs.userId, userId), eq(runs.mode, mode), isNull(runs.endedAt));
  const [existing] = await db.select().from(runs).where(active).limit(1);
  if (existing) return existing;

  // The partial unique index guarantees one active run even if two requests race here.
  await db.insert(runs).values({ userId, mode }).onConflictDoNothing();
  const [created] = await db.select().from(runs).where(active).limit(1);
  return created;
}

export async function getProgress(userId: string, mode: Mode): Promise<Progress> {
  const db = await getDb();
  const run = await getActiveRun(userId, mode);
  const rows = await db
    .select({
      itemId: completions.itemId,
      completedAt: completions.completedAt,
      attempts: completions.attempts,
      answer: completions.answer,
    })
    .from(completions)
    .where(eq(completions.runId, run.id))
    .orderBy(asc(completions.completedAt));
  return {
    runId: run.id,
    startedAt: run.startedAt,
    completed: new Map(rows.map((r) => [r.itemId, r])),
    total: totalItems(mode),
  };
}

export async function getHistory(userId: string, mode: Mode): Promise<HistoryEntry[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(runs)
    .where(and(eq(runs.userId, userId), eq(runs.mode, mode), isNotNull(runs.endedAt)))
    .orderBy(desc(runs.endedAt));
  return rows.map((r) => ({
    id: r.id,
    startedAt: r.startedAt,
    endedAt: r.endedAt!,
    completedCount: r.completedCount ?? 0,
    totalCount: r.totalCount ?? 0,
  }));
}

export async function recordCompletion(
  userId: string,
  mode: Mode,
  itemId: string,
  attempts: number,
  answer: string | null,
) {
  const db = await getDb();
  const run = await getActiveRun(userId, mode);
  // Keep the first completion; re-solving an item doesn't overwrite it.
  await db
    .insert(completions)
    .values({ runId: run.id, itemId, attempts, answer })
    .onConflictDoNothing();
}

/**
 * End the active run, snapshotting how far the user got. A single UPDATE keeps this atomic
 * without needing a transaction (which neon-http doesn't support). The next read creates a
 * fresh run.
 */
export async function endActiveRun(userId: string, mode: Mode) {
  const db = await getDb();
  await getActiveRun(userId, mode); // so even an untouched run gets logged
  await db
    .update(runs)
    .set({
      endedAt: sql`now()`,
      completedCount: sql`(select count(*)::int from ${completions} where ${completions.runId} = ${runs.id})`,
      totalCount: totalItems(mode),
    })
    .where(and(eq(runs.userId, userId), eq(runs.mode, mode), isNull(runs.endedAt)));
}
