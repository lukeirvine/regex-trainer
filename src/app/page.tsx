import type { Metadata } from "next";
import Link from "next/link";
import { Prose, RegexLiteral } from "@/components/Code";
import { HighlightedString } from "@/components/HighlightedString";
import { RegexPlayground } from "@/components/RegexPlayground";
import { builderChallenges, levelNames } from "@/content/builder";
import { quizQuestions } from "@/content/quiz";
import { topics } from "@/content/topics";
import { compile, highlightSegments } from "@/lib/regex";

export const metadata: Metadata = {
  title: { absolute: "Regex Trainer · Make regex automatic" },
  description:
    "Short drills on the everyday regex you reach for in editors, logs and code. Quiz yourself on tokens, then build real patterns with live highlighting.",
};

/** Look up a content item by id, failing the build if it has been renamed or removed. */
function byId<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error(`Landing page sample "${id}" not found`);
  return item;
}

const quizSample = (() => {
  const q = byId(quizQuestions, "sh-whole-word");
  if (q.kind !== "which-string") throw new Error(`Landing page quiz sample must be "which-string"`);
  return q;
})();
const builderSample = byId(builderChallenges, "iso-dates");
const builderCompiled = compile(builderSample.solution, builderSample.solutionFlags);

const stats = [
  { value: quizQuestions.length, label: "quiz questions" },
  { value: builderChallenges.length, label: "builder challenges" },
  { value: topics.length, label: "topics" },
  { value: 1, label: "cheat sheet, free to browse" },
];

const steps = [
  {
    title: "Learn the tokens",
    body: "The quiz asks what `\\d`, `+`, `\\b` and friends mean, which strings a pattern matches, and which pattern fits a job.",
  },
  {
    title: "Build real patterns",
    body: "The builder hands you strings to match and decoys to skip. Your matches highlight as you type, exactly like a find in your editor.",
  },
  {
    title: "Start over, get faster",
    body: "When you finish a mode, start it again. Each reset records how far you got, so you can see the syntax sticking.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-8">
      <section className="space-y-8 pt-4 sm:pt-8">
        <div className="space-y-5">
          <span className="badge badge-soft badge-primary">JavaScript flavour · works in VS Code, browsers and Node</span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Make regex <span className="match-hl px-1">automatic</span>.
          </h1>
          <p className="text-base-content/70 max-w-2xl text-lg sm:text-xl">
            Short, focused drills on the patterns you actually reach for in editors, logs and code. Learn what each token
            means, then build real patterns against live highlighting, until you stop looking up the syntax.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/app" className="btn btn-primary btn-lg">
              Start drilling
            </Link>
            <Link href="/cheatsheet" className="btn btn-ghost btn-lg">
              Browse the cheat sheet
            </Link>
          </div>
        </div>
        <RegexPlayground />
      </section>

      <section className="bg-base-100 rounded-box divide-base-300 grid grid-cols-2 shadow-sm sm:grid-cols-4 sm:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-6 text-center">
            <div className="text-primary text-4xl font-bold">{s.value}</div>
            <div className="text-base-content/60 mt-1 text-sm">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Two modes" title="Recognise it, then write it." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4">
              <div>
                <h3 className="card-title text-xl">Quiz</h3>
                <p className="text-base-content/70">
                  Quick multiple-choice drills. Number keys pick an answer, and every answer explains itself.
                </p>
              </div>
              <div className="bg-base-200 rounded-box space-y-3 p-4" aria-hidden>
                <p className="text-sm font-semibold">Which string contains a match for</p>
                <RegexLiteral pattern={quizSample.pattern} flags={quizSample.flags} className="text-lg" />
                <ul className="grid gap-2 sm:grid-cols-2">
                  {quizSample.options.map((o, i) => (
                    <li
                      key={o}
                      className={`code-text rounded-field border px-3 py-1.5 text-sm ${
                        i === quizSample.answer ? "border-success bg-success/15 text-success" : "border-base-300 bg-base-100"
                      }`}
                    >
                      <span className="text-base-content/40 mr-2">{i + 1}</span>
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="text-base-content/70 text-sm">
                  <Prose text={quizSample.explanation} />
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4">
              <div>
                <h3 className="card-title text-xl">Builder</h3>
                <p className="text-base-content/70">
                  Write one regex that matches every string on the left and none on the right. Three levels, up to
                  real-world patterns.
                </p>
              </div>
              <div className="bg-base-200 rounded-box space-y-3 p-4" aria-hidden>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{builderSample.title}</p>
                  <span className="badge badge-ghost badge-sm">{levelNames[builderSample.level]}</span>
                </div>
                <div className="input input-success code-text bg-base-100 w-full">
                  <span className="text-base-content/40">/</span>
                  <span className="grow">{builderSample.solution}</span>
                  <span className="text-base-content/40">/</span>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <SampleList title="Match these" tone="success" items={builderSample.match} />
                  <SampleList title="Skip these" tone="error" items={builderSample.avoid} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="How it works" title="Built for repetition, not reading." />
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="card bg-base-100 shadow-sm">
              <div className="card-body gap-2">
                <span className="code-text text-primary text-sm font-semibold">0{i + 1}</span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-base-content/70 text-sm">
                  <Prose text={s.body} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="What you'll cover" title="The daily drivers, not the obscure corners." />
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {topics.map((t) => (
            <div key={t.id} className="bg-base-100 rounded-box border-base-300 space-y-2 border p-4">
              <h3 className="font-semibold">{t.title}</h3>
              <div className="flex flex-wrap gap-1.5">
                {t.tokens
                  .filter((tok) => tok.token.length <= 8)
                  .slice(0, 4)
                  .map((tok) => (
                    <code key={tok.token} className="code-text bg-base-200 text-primary rounded px-1.5 py-0.5 text-xs">
                      {tok.token}
                    </code>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-base-content/70 text-sm">
          Want the whole list?{" "}
          <Link href="/cheatsheet" className="link link-primary">
            The cheat sheet
          </Link>{" "}
          covers every token on one page, no sign-in needed.
        </p>
      </section>

      <section className="card bg-neutral text-neutral-content shadow-lg">
        <div className="card-body items-center gap-4 py-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">A few minutes a day. No more googling the syntax.</h2>
          <p className="text-neutral-content/70 max-w-xl">
            Sign in to save your progress across both modes and see how much faster you get each time round.
          </p>
          <Link href="/app" className="btn btn-primary btn-lg">
            Start drilling
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="space-y-1">
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function SampleList({ title, tone, items }: { title: string; tone: "success" | "error"; items: string[] }) {
  return (
    <div>
      <p className={`mb-1.5 text-xs font-semibold tracking-wide uppercase ${tone === "success" ? "text-success" : "text-error"}`}>
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((s) => (
          <li key={s} className="border-success/60 bg-success/10 flex items-center gap-2 rounded-lg border px-2 py-1">
            <span className="text-success text-xs">✓</span>
            <HighlightedString segments={highlightSegments(s, builderCompiled)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
