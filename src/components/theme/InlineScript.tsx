/**
 * Renders a synchronous inline <script> that executes during HTML parsing,
 * before the browser's first paint.
 *
 * On the client the type is flipped to text/plain so the browser ignores it
 * and React stops warning about script tags in render — the script has
 * already done its job by then. `suppressHydrationWarning` covers the
 * resulting type attribute mismatch. Pattern is straight from the Next.js
 * "preventing flash before hydration" guide.
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
