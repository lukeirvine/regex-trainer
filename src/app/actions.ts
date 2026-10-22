"use server";

import { revalidatePath } from "next/cache";
import { itemIds } from "@/content";
import type { Mode } from "@/content/types";
import { endActiveRun, recordCompletion } from "@/lib/progress";
import { requireUserId } from "@/lib/session";

function assertMode(mode: unknown): asserts mode is Mode {
  if (mode !== "quiz" && mode !== "builder") throw new Error("Unknown mode");
}

export async function markComplete(mode: Mode, itemId: string, attempts: number, answer?: string) {
  const userId = await requireUserId();
  assertMode(mode);
  if (!itemIds(mode).includes(itemId)) throw new Error("Unknown item");
  const safeAttempts = Math.max(1, Math.min(1000, Math.floor(Number(attempts) || 1)));
  const safeAnswer = mode === "builder" && typeof answer === "string" ? answer.slice(0, 500) : null;

  await recordCompletion(userId, mode, itemId, safeAttempts, safeAnswer);
  revalidatePath("/", "layout");
}

export async function resetProgress(mode: Mode) {
  const userId = await requireUserId();
  assertMode(mode);
  await endActiveRun(userId, mode);
  revalidatePath("/", "layout");
}
