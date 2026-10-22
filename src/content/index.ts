import { builderChallenges, levelNames } from "./builder";
import { quizQuestions } from "./quiz";
import { topicById } from "./topics";
import type { MenuItem, Mode, QuizQuestion } from "./types";

export const modeLabels: Record<Mode, string> = { quiz: "Quiz", builder: "Builder" };

export function quizTitle(q: QuizQuestion): string {
  if (q.kind === "which-string") return `Which string matches /${q.pattern}/${q.flags ?? ""}?`;
  return q.prompt;
}

/** Ordered list of items for a mode, with the group heading each belongs under. */
export function menuItems(mode: Mode): MenuItem[] {
  if (mode === "quiz") {
    return quizQuestions.map((q) => ({
      id: q.id,
      title: quizTitle(q),
      group: topicById[q.topic]?.title ?? q.topic,
    }));
  }
  return builderChallenges.map((c) => ({ id: c.id, title: c.title, group: levelNames[c.level] }));
}

export function itemIds(mode: Mode): string[] {
  return menuItems(mode).map((i) => i.id);
}

export function totalItems(mode: Mode): number {
  return mode === "quiz" ? quizQuestions.length : builderChallenges.length;
}

export function neighbours(mode: Mode, id: string) {
  const ids = itemIds(mode);
  const i = ids.indexOf(id);
  return {
    index: i,
    total: ids.length,
    prev: i > 0 ? ids[i - 1] : null,
    next: i >= 0 && i < ids.length - 1 ? ids[i + 1] : null,
  };
}

/** First incomplete item after `afterId` (wrapping around), or null if everything is done. */
export function nextIncomplete(mode: Mode, completed: Set<string>, afterId?: string): string | null {
  const ids = itemIds(mode);
  const start = afterId ? ids.indexOf(afterId) + 1 : 0;
  for (let k = 0; k < ids.length; k++) {
    const id = ids[(start + k) % ids.length];
    if (!completed.has(id) && id !== afterId) return id;
  }
  return null;
}
