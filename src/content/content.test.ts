import { describe, expect, it } from "vitest";
import { compile, evaluateChallenge } from "@/lib/regex";
import { builderChallenges } from "./builder";
import { quizQuestions } from "./quiz";
import { topicById } from "./topics";

function uniqueIds(ids: string[]) {
  return new Set(ids).size === ids.length;
}

describe("quiz content", () => {
  it("has unique ids and known topics", () => {
    expect(uniqueIds(quizQuestions.map((q) => q.id))).toBe(true);
    for (const q of quizQuestions) expect(topicById[q.topic], q.id).toBeDefined();
  });

  it.each(quizQuestions.map((q) => [q.id, q] as const))("%s has a valid answer", (_, q) => {
    expect(q.options.length).toBeGreaterThanOrEqual(3);
    expect(uniqueIds(q.options)).toBe(true);
    expect(q.answer).toBeGreaterThanOrEqual(0);
    expect(q.answer).toBeLessThan(q.options.length);

    if (q.kind === "which-string") {
      const re = new RegExp(q.pattern, q.flags);
      const matching = q.options.map((o, i) => (re.test(o) ? i : -1)).filter((i) => i >= 0);
      expect(matching, "exactly the answer option should match").toEqual([q.answer]);
    }

    if (q.kind === "which-regex") {
      const passes = (pattern: string) => {
        const re = new RegExp(pattern);
        return q.examples.match.every((s) => re.test(s)) && !q.examples.avoid.some((s) => re.test(s));
      };
      const passing = q.options.map((o, i) => (passes(o) ? i : -1)).filter((i) => i >= 0);
      expect(passing, "exactly the answer regex should satisfy the examples").toEqual([q.answer]);
    }
  });
});

describe("builder content", () => {
  it("has unique ids", () => {
    expect(uniqueIds(builderChallenges.map((c) => c.id))).toBe(true);
  });

  it.each(builderChallenges.map((c) => [c.id, c] as const))("%s solution solves it", (_, c) => {
    const result = evaluateChallenge(compile(c.solution, c.solutionFlags), c.match, c.avoid);
    expect(result.matchResults.every(Boolean), "solution matches every target").toBe(true);
    expect(result.avoidResults.some(Boolean), "solution avoids every decoy").toBe(false);
  });

  it.each(builderChallenges.map((c) => [c.id, c] as const))("%s rejects trivial patterns", (_, c) => {
    expect(c.avoid.length).toBeGreaterThan(0);
    expect(evaluateChallenge(compile(".*"), c.match, c.avoid).solved).toBe(false);
    expect(evaluateChallenge(compile(".+"), c.match, c.avoid).solved).toBe(false);
  });
});
