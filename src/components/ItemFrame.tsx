import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { modeLabels, neighbours, nextIncomplete } from "@/content";
import type { Mode } from "@/content/types";
import { getProgress } from "@/lib/progress";
import { requireUserId } from "@/lib/session";

/** Shared chrome for a single quiz question or builder challenge. */
export function ItemFrame({ mode, id, group, children }: { mode: Mode; id: string; group: string; children: ReactNode }) {
  const { index, total, prev, next } = neighbours(mode, id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="breadcrumbs py-0 text-sm">
          <ul>
            <li>
              <Link href={`/${mode}`}>{modeLabels[mode]}</Link>
            </li>
            <li>{group}</li>
            <li className="text-base-content/60 tabular-nums">
              {index + 1} of {total}
            </li>
          </ul>
        </div>
        <Suspense fallback={<div className="skeleton h-6 w-24" />}>
          <ItemStatus mode={mode} id={id} />
        </Suspense>
      </div>

      {children}

      <nav className="flex items-center justify-between gap-2">
        {prev ? (
          <Link href={`/${mode}/${prev}`} className="btn btn-ghost btn-sm">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/${mode}`} className="btn btn-ghost btn-sm">
          All {mode === "quiz" ? "questions" : "challenges"}
        </Link>
        {next ? (
          <Link href={`/${mode}/${next}`} className="btn btn-ghost btn-sm">
            Next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

async function ItemStatus({ mode, id }: { mode: Mode; id: string }) {
  const userId = await requireUserId();
  const progress = await getProgress(userId, mode);
  const done = progress.completed.has(id);
  const upNext = nextIncomplete(mode, new Set(progress.completed.keys()), id);

  return (
    <div className="flex items-center gap-2">
      {done && <span className="badge badge-success badge-sm">✓ Completed</span>}
      <span className="text-base-content/60 text-xs tabular-nums">
        {progress.completed.size}/{progress.total} done
      </span>
      {upNext && (
        <Link href={`/${mode}/${upNext}`} className="btn btn-xs btn-outline">
          Next unfinished
        </Link>
      )}
    </div>
  );
}

export function ItemSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-6 w-48" />
      <div className="skeleton h-96 w-full" />
    </div>
  );
}
