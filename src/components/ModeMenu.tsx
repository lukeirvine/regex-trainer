import Link from "next/link";
import { menuItems, nextIncomplete } from "@/content";
import type { Mode } from "@/content/types";
import { getHistory, getProgress } from "@/lib/progress";
import { requireUserId } from "@/lib/session";
import { Prose } from "./Code";
import { HistoryTable } from "./HistoryTable";
import { ResetButton } from "./ResetButton";

export async function ModeMenu({ mode }: { mode: Mode }) {
  const userId = await requireUserId();
  const [progress, history] = await Promise.all([getProgress(userId, mode), getHistory(userId, mode)]);
  const items = menuItems(mode);
  const done = progress.completed.size;
  const pct = Math.round((done / progress.total) * 100);
  const continueId = nextIncomplete(mode, new Set(progress.completed.keys()));

  const groups = new Map<string, { item: (typeof items)[number]; n: number }[]>();
  items.forEach((item, i) => {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group)!.push({ item, n: i + 1 });
  });

  return (
    <div className="space-y-8">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body flex-row flex-wrap items-center gap-4">
          <div className="min-w-48 flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="tabular-nums">
                {done}/{progress.total}
              </span>
            </div>
            <progress className="progress progress-success w-full" value={pct} max={100} />
          </div>
          {continueId ? (
            <Link href={`/app/${mode}/${continueId}`} className="btn btn-primary btn-sm">
              {done === 0 ? "Start" : "Continue"}
            </Link>
          ) : (
            <span className="badge badge-success">All done 🎉</span>
          )}
          <ResetButton mode={mode} completed={done} total={progress.total} />
        </div>
      </div>

      {[...groups.entries()].map(([group, entries]) => {
        const groupDone = entries.filter((e) => progress.completed.has(e.item.id)).length;
        return (
          <section key={group}>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              {group}
              <span className="badge badge-ghost badge-sm tabular-nums">
                {groupDone}/{entries.length}
              </span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {entries.map(({ item, n }) => {
                const completion = progress.completed.get(item.id);
                return (
                  <Link
                    key={item.id}
                    href={`/app/${mode}/${item.id}`}
                    className={`bg-base-100 hover:border-primary flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      completion ? "border-success/50" : "border-base-300"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                        completion ? "bg-success text-success-content" : "bg-base-200 text-base-content/60"
                      }`}
                    >
                      {completion ? "✓" : n}
                    </span>
                    <span className="min-w-0">
                      <Prose text={item.title} className="line-clamp-2 text-sm" />
                      {completion?.answer && (
                        <code className="code-text text-base-content/60 block truncate text-xs">{completion.answer}</code>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <section>
        <h2 className="mb-3 font-semibold">Reset history</h2>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <HistoryTable history={history} />
          </div>
        </div>
      </section>
    </div>
  );
}

export function ModeMenuSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-20 w-full" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-14" />
        ))}
      </div>
    </div>
  );
}
