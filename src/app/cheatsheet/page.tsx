import type { Metadata } from "next";
import { Prose } from "@/components/Code";
import { topics } from "@/content/topics";

export const metadata: Metadata = { title: "Cheat sheet" };

export default function CheatSheetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cheat sheet</h1>
        <p className="text-base-content/70 mt-1">Everything the drills cover, on one page. JavaScript flavour.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <section key={t.id} className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-5">
              <div>
                <h2 className="card-title text-lg">{t.title}</h2>
                <p className="text-base-content/60 text-sm">{t.summary}</p>
              </div>
              <table className="table table-sm">
                <tbody>
                  {t.tokens.map((tok) => (
                    <tr key={tok.token}>
                      <td className="w-1/3 align-top">
                        <code className="code-text text-primary font-semibold whitespace-pre-wrap">{tok.token}</code>
                      </td>
                      <td>
                        <Prose text={tok.meaning} />
                        {tok.example && (
                          <div className="code-text text-base-content/50 text-xs whitespace-pre-wrap">{tok.example}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
