"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { markComplete } from "@/app/actions";
import type { BuilderChallenge as Challenge } from "@/content/types";
import { cleanFlags, compile, evaluateChallenge, highlightSegments } from "@/lib/regex";
import { Prose, RegexLiteral } from "./Code";
import { HighlightedString } from "./HighlightedString";

export function BuilderChallenge({ challenge: c, nextHref }: { challenge: Challenge; nextHref: string | null }) {
  const router = useRouter();
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("");
  const [recorded, setRecorded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [saving, startSaving] = useTransition();

  const compiled = useMemo(() => compile(pattern, flags), [pattern, flags]);
  const result = useMemo(() => evaluateChallenge(compiled, c.match, c.avoid), [compiled, c]);
  const matchedCount = result.matchResults.filter(Boolean).length;
  const decoysHit = result.avoidResults.filter(Boolean).length;

  function update(nextPattern: string, nextFlags: string) {
    setPattern(nextPattern);
    setFlags(nextFlags);
    // Record the first solve as it happens, from the event rather than an effect.
    if (recorded) return;
    const r = evaluateChallenge(compile(nextPattern, nextFlags), c.match, c.avoid);
    if (r.solved) {
      setRecorded(true);
      const f = cleanFlags(nextFlags);
      startSaving(() => markComplete("builder", c.id, 1, `/${nextPattern}/${f}`));
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-5">
        <div>
          <h1 className="text-2xl font-bold">{c.title}</h1>
          <p className="text-base-content/70 mt-1">
            <Prose text={c.brief} />
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {c.concepts.map((k) => (
              <span key={k} className="badge badge-ghost badge-sm code-text">
                {k}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label
            className={`input code-text w-full text-lg ${
              compiled.status === "error" ? "input-error" : result.solved ? "input-success" : ""
            }`}
          >
            <span className="text-base-content/40">/</span>
            <input
              type="text"
              className="grow"
              placeholder="type a regex…"
              value={pattern}
              onChange={(e) => update(e.target.value, flags)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && result.solved && nextHref) router.push(nextHref);
              }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Regex pattern"
            />
            <span className="text-base-content/40">/</span>
            <input
              type="text"
              className="text-secondary w-16"
              placeholder="flags"
              value={flags}
              onChange={(e) => update(pattern, e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Flags"
            />
          </label>
          <p className="mt-1 h-5 text-sm">
            {compiled.status === "error" ? (
              <span className="text-error">{compiled.error}</span>
            ) : compiled.status === "ok" ? (
              <span className="text-base-content/60">
                {matchedCount}/{c.match.length} matched
                {decoysHit > 0 && <span className="text-error"> · {decoysHit} decoy{decoysHit > 1 && "s"} matched</span>}
                {flags !== cleanFlags(flags) && <span> · supported flags: i, m, s, u</span>}
              </span>
            ) : (
              <span className="text-base-content/50">Your match must cover each string on the left exactly — like a find in your editor.</span>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StringList
            title="Match these"
            tone="success"
            items={c.match}
            passed={result.matchResults}
            compiled={compiled}
          />
          <StringList
            title="Skip these"
            tone="error"
            items={c.avoid}
            passed={result.avoidResults.map((hit) => !hit)}
            compiled={compiled}
          />
        </div>

        {result.solved && (
          <div role="alert" className="alert alert-soft alert-success">
            <span className="font-semibold">
              Solved!{saving && <span className="loading loading-dots loading-xs ml-2 align-middle" />}
            </span>
            {nextHref ? (
              <button className="btn btn-success btn-sm" onClick={() => router.push(nextHref)}>
                Next challenge <kbd className="kbd kbd-xs text-base-content">↵</kbd>
              </button>
            ) : (
              <button className="btn btn-success btn-sm" onClick={() => router.push("/app/builder")}>
                Back to all challenges
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {c.hint && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHint(!showHint)}>
              {showHint ? "Hide hint" : "Hint"}
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSolution(!showSolution)}>
            {showSolution ? "Hide solution" : "Show a solution"}
          </button>
        </div>
        {showHint && c.hint && (
          <div className="alert alert-soft alert-info">
            <Prose text={c.hint} />
          </div>
        )}
        {showSolution && (
          <div className="alert alert-soft">
            <span>One answer:</span>
            <RegexLiteral pattern={c.solution} flags={c.solutionFlags} className="text-base" />
          </div>
        )}
      </div>
    </div>
  );
}

function StringList({
  title,
  tone,
  items,
  passed,
  compiled,
}: {
  title: string;
  tone: "success" | "error";
  items: string[];
  passed: boolean[];
  compiled: ReturnType<typeof compile>;
}) {
  const active = compiled.status === "ok";
  return (
    <div>
      <h2 className={`mb-2 text-xs font-semibold tracking-wide uppercase ${tone === "success" ? "text-success" : "text-error"}`}>
        {title}
      </h2>
      <ul className="space-y-1.5">
        {items.map((s, i) => {
          const ok = active && passed[i];
          const bad = active && !passed[i] && tone === "error";
          return (
            <li
              key={s}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                ok ? "border-success/60 bg-success/10" : bad ? "border-error/60 bg-error/10" : "border-base-300"
              }`}
            >
              <span className={`w-4 text-center text-sm ${ok ? "text-success" : bad ? "text-error" : "text-base-content/30"}`}>
                {ok ? "✓" : bad ? "✗" : "○"}
              </span>
              <HighlightedString segments={highlightSegments(s, compiled)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
