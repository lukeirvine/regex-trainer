"use client";

import { useMemo, useState } from "react";
import { compile, highlightSegments } from "@/lib/regex";

const r = String.raw;

const sample = [
  "[ERROR] 09:14 payment failed for ada@example.com",
  "[INFO]  09:15 retry scheduled, call 555-0199",
  "[WARN]  09:21 unknown colour #1E90FF in theme",
  "[INFO]  09:30 deployed v2.13.4 to 10.0.0.255",
];

const presets = [
  { label: "time", pattern: r`\b\d{2}:\d{2}\b`, flags: "" },
  { label: "phone", pattern: r`\d{3}-\d{4}`, flags: "" },
  { label: "email", pattern: r`[\w.+-]+@\w+(\.\w+)+`, flags: "" },
  { label: "hex colour", pattern: r`#[0-9a-f]{6}`, flags: "i" },
  { label: "version", pattern: r`v\d+\.\d+\.\d+`, flags: "" },
  { label: "errors", pattern: r`^\[(ERROR|WARN)\]`, flags: "" },
];

/** Hero demo: edit a regex and watch it highlight a small log, like a find in your editor. */
export function RegexPlayground() {
  const [pattern, setPattern] = useState(presets[0].pattern);
  const [flags, setFlags] = useState(presets[0].flags);

  const compiled = useMemo(() => compile(pattern, flags), [pattern, flags]);
  const lines = useMemo(() => sample.map((s) => highlightSegments(s, compiled)), [compiled]);
  const matchCount = lines.flat().filter((seg) => seg.matched).length;

  return (
    <div className="card bg-base-100 border-base-300 border shadow-lg">
      <div className="card-body gap-4 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="bg-error/70 size-3 rounded-full" />
          <span className="bg-warning/70 size-3 rounded-full" />
          <span className="bg-success/70 size-3 rounded-full" />
          <span className="text-base-content/50 ml-2 text-xs">app.log</span>
        </div>

        <label className={`input code-text w-full text-base ${compiled.status === "error" ? "input-error" : ""}`}>
          <span className="text-base-content/40">/</span>
          <input
            type="text"
            className="grow"
            placeholder="type a regex…"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Regex pattern"
          />
          <span className="text-base-content/40">/</span>
          <input
            type="text"
            className="text-secondary w-12"
            placeholder="flags"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="Flags"
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-base-content/50 mr-1 text-xs">Try:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              className={`btn btn-xs ${p.pattern === pattern && p.flags === flags ? "btn-primary" : "btn-ghost border-base-300"}`}
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="bg-base-200 rounded-box px-4 py-3 text-xs leading-6 sm:text-sm">
          {lines.map((segments, i) => (
            // Not .code-text: lines may wrap on narrow screens rather than scroll.
            <div key={i} className="font-mono whitespace-pre-wrap [overflow-wrap:anywhere]">
              {segments.map((seg, j) => (
                <span key={j} className={seg.matched ? "match-hl" : undefined}>
                  {seg.text}
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="h-5 text-sm" aria-live="polite">
          {compiled.status === "error" ? (
            <span className="text-error">{compiled.error}</span>
          ) : compiled.status === "ok" ? (
            <span className="text-base-content/60">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
          ) : (
            <span className="text-base-content/50">Type a pattern to see what it matches.</span>
          )}
        </p>
      </div>
    </div>
  );
}
