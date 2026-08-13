"use client";

import { useCallback, useLayoutEffect } from "react";
import { applyTheme, readStoredChoice, resolveTheme } from "@/lib/theme";

/**
 * Dark/light switch, styled as an instrument readout rather than an icon
 * button — the label states the mode you are in, the way a camera body does.
 *
 * Both labels are always in the DOM and CSS picks which one shows, driven by
 * the `data-theme` the bootstrap script sets before first paint. No mounted
 * state, no hydration mismatch, correct icon in the very first frame.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // React's Strict Mode remount in development resets <html> to only the
  // attributes it manages from JSX, wiping what the bootstrap script set.
  // Re-applying before paint keeps dev honest; it is a no-op in production.
  useLayoutEffect(() => {
    const choice = readStoredChoice();
    const root = document.documentElement;
    root.setAttribute("data-theme", resolveTheme(choice));
    root.setAttribute("data-theme-choice", choice);
  }, []);

  const onClick = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "light" ? "dark" : "light");
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Switch between dark and light appearance"
      title="Switch appearance"
      className={`group relative flex h-9 items-center gap-2 border border-line px-2.5 text-ink-3 transition-colors duration-400 hover:border-accent hover:text-accent ${className}`}
    >
      <span
        aria-hidden
        className="block h-1.5 w-1.5 shrink-0 bg-accent transition-transform duration-500 [transition-timing-function:var(--ease-cut)] group-hover:scale-150"
      />
      <span className="eyebrow hidden text-[0.5625rem] sm:block">
        <span className="light:hidden">DARK</span>
        <span className="hidden light:inline">LIGHT</span>
      </span>
    </button>
  );
}
