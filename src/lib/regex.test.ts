import { describe, expect, it } from "vitest";
import { cleanFlags, compile, evaluateChallenge, fullMatch, highlightSegments } from "./regex";

describe("compile", () => {
  it("reports empty and invalid patterns", () => {
    expect(compile("").status).toBe("empty");
    const bad = compile("(abc");
    expect(bad.status).toBe("error");
  });

  it("drops unsupported and duplicate flags", () => {
    expect(cleanFlags("gigmx")).toBe("im");
  });

  it("judges the actual match, so alternation order matters", () => {
    expect(fullMatch(compile("a|ab"), "ab")).toBe(false);
    expect(fullMatch(compile("ab|a"), "ab")).toBe(true);
  });

  it("applies full matching to every alternation branch", () => {
    const c = compile("cat|dog");
    expect(fullMatch(c, "cat")).toBe(true);
    expect(fullMatch(c, "dog")).toBe(true);
    expect(fullMatch(c, "catdog")).toBe(false);
  });

  it("keeps backreference numbering intact", () => {
    expect(fullMatch(compile(String.raw`(\w)\1`), "aa")).toBe(true);
  });

  it("respects flags", () => {
    expect(fullMatch(compile("abc", "i"), "ABC")).toBe(true);
    expect(fullMatch(compile("abc"), "ABC")).toBe(false);
  });
});

describe("highlightSegments", () => {
  it("splits a string into matched and unmatched runs", () => {
    expect(highlightSegments("a1b22", compile(String.raw`\d+`))).toEqual([
      { text: "a", matched: false },
      { text: "1", matched: true },
      { text: "b", matched: false },
      { text: "22", matched: true },
    ]);
  });

  it("ignores zero-length matches without looping forever", () => {
    expect(highlightSegments("bbb", compile("a*"))).toEqual([{ text: "bbb", matched: false }]);
  });

  it("returns the plain string for invalid patterns", () => {
    expect(highlightSegments("abc", compile("("))).toEqual([{ text: "abc", matched: false }]);
  });
});

describe("evaluateChallenge", () => {
  it("is solved only when all matches pass and no avoid passes", () => {
    const match = ["cat", "cot"];
    const avoid = ["coat"];
    expect(evaluateChallenge(compile("c.t"), match, avoid).solved).toBe(true);
    expect(evaluateChallenge(compile("c.*t"), match, avoid).solved).toBe(false);
    expect(evaluateChallenge(compile("cat"), match, avoid).solved).toBe(false);
    expect(evaluateChallenge(compile("("), match, avoid).solved).toBe(false);
  });
});
