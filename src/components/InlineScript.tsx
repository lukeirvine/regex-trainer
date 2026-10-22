/**
 * Runs during HTML parsing on hard navigations, before first paint. On the client it renders
 * as text/plain so React doesn't warn about (or re-run) script tags.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
