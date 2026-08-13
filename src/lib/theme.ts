export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "wk-theme";

/**
 * Runs before first paint, inlined into <head>. Kept as a string so it is
 * render-blocking and there is no flash of the wrong theme.
 *
 * Also stamps `data-theme-ready` so CSS can hold back entrance animations
 * until the correct palette is in place.
 */
export const themeBootstrapScript = `
(function(){
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    // Light is this site's default state — the product is a printed surface
    // and it has to be shown on a gallery wall, not a black screen. Only an
    // explicit choice by the reader moves it to dark.
    var choice = stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = choice === "system" ? (prefersDark ? "dark" : "light") : choice;
    var root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-choice", choice);
    // Gate for scroll reveals: entrance animations start hidden ONLY when
    // this class is present. Without JS the content is simply visible, so a
    // failed bundle or a crawler that skips IntersectionObserver never gets
    // a blank page.
    root.classList.add("js");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`.trim();

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice !== "system") return choice;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function readStoredChoice(): ThemeChoice {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(THEME_STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "light";
}

/**
 * Commits a theme choice to the document.
 *
 * Where View Transitions are available the new palette is wiped across the
 * screen as a hard edge — a cut, matching the rest of the motion language.
 * The wipe itself is defined in globals.css; this only arms it.
 */
export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const resolved = resolveTheme(choice);

  const commit = () => {
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-choice", choice);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsVT =
    typeof document.startViewTransition === "function" && !reduced;

  if (!supportsVT) {
    // Freeze component transitions so the flip lands in one frame.
    root.classList.add("theme-switching");
    commit();
    window.setTimeout(() => root.classList.remove("theme-switching"), 60);
    return;
  }

  root.setAttribute("data-vt-theme", "");
  const transition = document.startViewTransition(commit);
  transition.finished.finally(() => {
    root.removeAttribute("data-vt-theme");
  });
}
