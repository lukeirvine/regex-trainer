import { Fragment } from "react";

/** Renders prose where `backticked` spans become inline code. */
export function Prose({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/`([^`]*)`/);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="code-text bg-base-200 rounded px-1 py-0.5 text-[0.95em]">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

/** A regex literal: /pattern/flags */
export function RegexLiteral({ pattern, flags = "", className = "" }: { pattern: string; flags?: string; className?: string }) {
  return (
    <code className={`code-text ${className}`}>
      <span className="text-base-content/40">/</span>
      {pattern}
      <span className="text-base-content/40">/</span>
      <span className="text-secondary">{flags}</span>
    </code>
  );
}
