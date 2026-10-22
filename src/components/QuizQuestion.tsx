"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { markComplete } from "@/app/actions";
import type { QuizQuestion as Question } from "@/content/types";
import { seededShuffle } from "@/lib/shuffle";
import { Prose, RegexLiteral } from "./Code";

export function QuizQuestion({ question: q, nextHref }: { question: Question; nextHref: string | null }) {
  const router = useRouter();
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const [saving, startSaving] = useTransition();

  // Indices into q.options, in display order.
  const order = useMemo(() => seededShuffle(q.options.map((_, i) => i), q.id), [q]);
  const optionsAreRegex = q.kind === "which-regex";

  function pick(i: number) {
    if (solved || wrong.has(i)) return;
    if (i === q.answer) {
      setSolved(true);
      startSaving(() => markComplete("quiz", q.id, wrong.size + 1));
    } else {
      setWrong(new Set(wrong).add(i));
    }
  }

  // Keyboard: 1–4 pick an option, Enter goes to the next question once solved.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= order.length) pick(order[n - 1]);
      else if (e.key === "Enter" && solved && nextHref) router.push(nextHref);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-5">
        <div className="space-y-3">
          {q.kind === "which-string" ? (
            <>
              <h1 className="text-xl font-semibold">Which string contains a match for</h1>
              <div className="bg-base-200 rounded-box px-4 py-3 text-2xl">
                <RegexLiteral pattern={q.pattern} flags={q.flags} />
              </div>
              <p className="text-base-content/60 text-sm">A match anywhere in the string counts.</p>
            </>
          ) : (
            <h1 className="text-xl leading-relaxed font-semibold">
              <Prose text={q.prompt} />
            </h1>
          )}
          {q.kind === "which-regex" && (
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Examples label="Should match" tone="success" items={q.examples.match} />
              <Examples label="Should not match" tone="error" items={q.examples.avoid} />
            </div>
          )}
        </div>

        <ul className="grid gap-2">
          {order.map((i, pos) => {
            const isWrong = wrong.has(i);
            const isRight = solved && i === q.answer;
            const locked = solved || isWrong;
            return (
              <li key={i}>
                {/* Not `disabled`/`aria-disabled`: daisyUI greys those out, hiding the right/wrong colours.
                    pick() already ignores locked options. */}
                <button
                  onClick={() => pick(i)}
                  tabIndex={locked ? -1 : undefined}
                  className={`btn h-auto min-h-12 w-full justify-start py-2 text-left font-normal normal-case ${
                    isRight
                      ? "btn-success"
                      : isWrong
                        ? "btn-error btn-soft line-through decoration-1"
                        : "btn-ghost border-base-300"
                  } ${locked ? "pointer-events-none" : ""} ${solved && !isRight && !isWrong ? "opacity-50" : ""}`}
                >
                  <kbd className="kbd kbd-sm">{pos + 1}</kbd>
                  {optionsAreRegex ? (
                    <RegexLiteral pattern={q.options[i]} className="text-base" />
                  ) : q.kind === "which-string" ? (
                    <code className="code-text text-base">{q.options[i]}</code>
                  ) : (
                    <Prose text={q.options[i]} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {!solved && wrong.size > 0 && (
          <div role="alert" className="alert alert-soft alert-error">
            Not quite — try another option.
          </div>
        )}

        {solved && (
          <div role="alert" className="alert alert-soft alert-success items-start">
            <div className="space-y-1">
              <p className="font-semibold">
                {wrong.size === 0 ? "Correct!" : `Got it — after ${wrong.size + 1} tries.`}
                {saving && <span className="loading loading-dots loading-xs ml-2 align-middle" />}
              </p>
              <p>
                <Prose text={q.explanation} />
              </p>
            </div>
          </div>
        )}

        {solved && (
          <div className="flex justify-end">
            {nextHref ? (
              <button className="btn btn-primary" onClick={() => router.push(nextHref)}>
                Next question <kbd className="kbd kbd-sm text-base-content">↵</kbd>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => router.push("/app/quiz")}>
                Back to all questions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Examples({ label, tone, items }: { label: string; tone: "success" | "error"; items: string[] }) {
  return (
    <div className={`rounded-box border p-3 ${tone === "success" ? "border-success/40" : "border-error/40"}`}>
      <p className={`mb-1 text-xs font-semibold uppercase ${tone === "success" ? "text-success" : "text-error"}`}>{label}</p>
      <ul className="space-y-0.5">
        {items.map((s) => (
          <li key={s} className="code-text">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
