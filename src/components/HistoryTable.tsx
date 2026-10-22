import type { HistoryEntry } from "@/lib/progress";
import { LocalDate } from "./LocalDate";

function duration(from: Date, to: Date) {
  const mins = Math.round((to.getTime() - from.getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} hr`;
  return `${Math.round(hours / 24)} days`;
}

export function HistoryTable({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-base-content/60 text-sm">No resets yet. When you start over, your progress lands here.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Reset on</th>
            <th>Progress</th>
            <th className="hidden sm:table-cell">Run length</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => {
            const pct = h.totalCount ? Math.round((h.completedCount / h.totalCount) * 100) : 0;
            return (
              <tr key={h.id}>
                <td>
                  <LocalDate date={h.endedAt.toISOString()} />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <progress className="progress progress-primary w-24" value={pct} max={100} />
                    <span className="tabular-nums">
                      {h.completedCount}/{h.totalCount} <span className="text-base-content/50">({pct}%)</span>
                    </span>
                  </div>
                </td>
                <td className="hidden sm:table-cell">{duration(h.startedAt, h.endedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
