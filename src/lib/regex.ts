export type Compiled =
  | { status: "empty" }
  | { status: "error"; error: string }
  | { status: "ok"; search: RegExp; display: RegExp };

export type Segment = { text: string; matched: boolean };

const ALLOWED_FLAGS = "imsu";

/** Normalise user-typed flags: drop unknown/duplicate letters (g/y are implied where needed). */
export function cleanFlags(flags: string): string {
  return [...new Set(flags.split(""))].filter((f) => ALLOWED_FLAGS.includes(f)).join("");
}

export function compile(pattern: string, flags = ""): Compiled {
  if (pattern === "") return { status: "empty" };
  const f = cleanFlags(flags);
  try {
    const search = new RegExp(pattern, f);
    const display = new RegExp(pattern, f + "g");
    return { status: "ok", search, display };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * True if the regex's actual (leftmost) match is the entire string — exactly what an editor's
 * find would highlight. Unlike wrapping in ^(?:...)$, this doesn't let the engine backtrack into
 * a later alternative, so `a|ab` does NOT fully match "ab", matching what the highlighting shows.
 */
export function fullMatch(c: Compiled, str: string): boolean {
  if (c.status !== "ok") return false;
  const m = c.search.exec(str);
  return m !== null && m.index === 0 && m[0].length === str.length;
}

/** Split a string into matched / unmatched runs for highlighting. */
export function highlightSegments(str: string, c: Compiled): Segment[] {
  if (c.status !== "ok") return [{ text: str, matched: false }];
  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of str.matchAll(c.display)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (end === start) continue; // zero-length matches have nothing to paint
    if (start > cursor) segments.push({ text: str.slice(cursor, start), matched: false });
    segments.push({ text: m[0], matched: true });
    cursor = end;
  }
  if (cursor < str.length) segments.push({ text: str.slice(cursor), matched: false });
  return segments;
}

export type Evaluation = {
  matchResults: boolean[];
  avoidResults: boolean[];
  solved: boolean;
};

/** A challenge is solved when every `match` string is fully matched and no `avoid` string is. */
export function evaluateChallenge(c: Compiled, match: string[], avoid: string[]): Evaluation {
  const matchResults = match.map((s) => fullMatch(c, s));
  const avoidResults = avoid.map((s) => fullMatch(c, s));
  const solved =
    c.status === "ok" && matchResults.every(Boolean) && !avoidResults.some(Boolean);
  return { matchResults, avoidResults, solved };
}
