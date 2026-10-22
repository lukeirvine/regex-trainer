import type { Segment } from "@/lib/regex";

/** Renders a sample string with matched spans highlighted and spaces made visible. */
export function HighlightedString({ segments }: { segments: Segment[] }) {
  return (
    <span className="code-text">
      {segments.map((seg, i) => (
        <span key={i} className={seg.matched ? "match-hl" : undefined}>
          {seg.text.split(/( )/).map((part, j) =>
            part === " " ? (
              <span key={j} className="text-base-content/30">
                ·
              </span>
            ) : (
              part
            ),
          )}
        </span>
      ))}
    </span>
  );
}
