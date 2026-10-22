import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HighlightedString } from "@/components/HighlightedString";
import { nextIncomplete } from "@/content";
import type { Mode } from "@/content/types";
import { compile, highlightSegments } from "@/lib/regex";
import { getMasteryCount, getProgress } from "@/lib/progress";
import { requireUserId } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

const modes: { mode: Mode; title: string; blurb: string }[] = [
  {
    mode: "quiz",
    title: "Quiz",
    blurb: "Quick multiple-choice drills on what each token means and what a pattern matches.",
  },
  {
    mode: "builder",
    title: "Builder",
    blurb: "Write a regex that matches a list of strings and skips the decoys, with live highlighting.",
  },
];

const demo = compile(String.raw`\d{3}-\d{4}`);

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-3 pt-4">
        <h1 className="text-4xl font-bold tracking-tight">Make regex automatic.</h1>
        <p className="text-base-content/70 max-w-2xl text-lg">
          Practise the daily-driver regex you reach for in editors, logs and code — not the obscure corners. Work through
          each mode, then start over and see how much faster you get.
        </p>
        <p className="text-base-content/60 text-lg">
          <HighlightedString segments={highlightSegments("call 555-0199 or 555-1234", demo)} />
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {modes.map((m) => (
          <div key={m.mode} className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="card-title text-2xl">
                    {m.title}
                    <Suspense fallback={null}>
                      <MasteryBadge mode={m.mode} />
                    </Suspense>
                  </h2>
                  <p className="text-base-content/70 mt-1">{m.blurb}</p>
                </div>
                <Suspense fallback={<div className="skeleton size-16 shrink-0 rounded-full" />}>
                  <ModeProgress mode={m.mode} />
                </Suspense>
              </div>
              <div className="card-actions mt-2 justify-end">
                <Link href={`/app/${m.mode}`} className="btn btn-ghost btn-sm">
                  View all
                </Link>
                <Suspense fallback={<span className="btn btn-primary btn-sm btn-disabled">Start</span>}>
                  <ContinueButton mode={m.mode} />
                </Suspense>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="text-base-content/70 text-sm">
        Need a refresher?{" "}
        <Link href="/cheatsheet" className="link link-primary">
          Open the cheat sheet
        </Link>
        .
      </section>
    </div>
  );
}

async function ModeProgress({ mode }: { mode: Mode }) {
  const progress = await getProgress(await requireUserId(), mode);
  const pct = Math.round((progress.completed.size / progress.total) * 100);
  return (
    <div
      className="radial-progress text-primary bg-base-200 border-base-200 shrink-0 border-4 text-sm font-semibold"
      style={{ "--value": pct, "--size": "4rem" } as React.CSSProperties}
      role="progressbar"
      aria-valuenow={pct}
    >
      {progress.completed.size}/{progress.total}
    </div>
  );
}

async function MasteryBadge({ mode }: { mode: Mode }) {
  const count = await getMasteryCount(await requireUserId(), mode);
  if (count === 0) return null;
  const label = `Completed and reset ${count} ${count === 1 ? "time" : "times"}`;
  return (
    <span className="tooltip font-normal" data-tip="Completions">
      <span
        className="badge badge-accent text-accent-content gap-1 font-semibold tabular-nums"
        aria-label={label}
      >
        <span aria-hidden="true">🏆</span>
        {count}
      </span>
    </span>
  );
}

async function ContinueButton({ mode }: { mode: Mode }) {
  const progress = await getProgress(await requireUserId(), mode);
  const id = nextIncomplete(mode, new Set(progress.completed.keys()));
  if (!id) {
    return (
      <Link href={`/app/${mode}`} className="btn btn-success btn-sm">
        Complete — start over?
      </Link>
    );
  }
  return (
    <Link href={`/app/${mode}/${id}`} className="btn btn-primary btn-sm">
      {progress.completed.size === 0 ? "Start" : "Continue"}
    </Link>
  );
}
