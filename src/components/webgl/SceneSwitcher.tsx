"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Check, X } from "lucide-react";
import { useBackground } from "./BackgroundProvider";
import { SCENES } from "@/lib/webgl/scenes";
import { cx } from "@/components/ui/primitives";

/**
 * Background picker.
 *
 * Sits bottom-left, opposite the enquiry dock. Each option is a live label
 * rather than a thumbnail — the background itself is the preview, so choosing
 * changes the page under the panel while it is open.
 */
export function SceneSwitcher() {
  const { scene, setScene, enabled, setEnabled } = useBackground();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-6 left-6 z-[130]">
      {open && (
        <div className="mb-3 w-64 overflow-hidden rounded-2xl border border-line bg-panel/85 p-2 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
              Background
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close background picker"
              className="text-ink-3 transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.6} />
            </button>
          </div>

          <ul className="mt-1">
            {SCENES.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setScene(s.id);
                    setEnabled(true);
                  }}
                  aria-pressed={enabled && scene === s.id}
                  className={cx(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-300",
                    enabled && scene === s.id
                      ? "bg-accent/12 text-ink"
                      : "text-ink-2 hover:bg-ink/6 hover:text-ink",
                  )}
                >
                  <span>
                    <span className="block text-[0.875rem] font-medium">
                      {s.label}
                    </span>
                    <span className="mt-0.5 block text-[0.6875rem] text-ink-3">
                      {s.note}
                    </span>
                  </span>
                  {enabled && scene === s.id && (
                    <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-1 border-t border-line px-3 pb-1 pt-2">
            <button
              onClick={() => setEnabled(!enabled)}
              className="flex w-full items-center justify-between py-1.5 text-[0.75rem] text-ink-2 transition-colors hover:text-ink"
            >
              Motion background
              <span
                className={cx(
                  "relative h-4 w-7 rounded-full transition-colors duration-300",
                  enabled ? "bg-accent" : "bg-ink/25",
                )}
              >
                <span
                  className={cx(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-panel transition-transform duration-300",
                    enabled ? "translate-x-3.5" : "translate-x-0.5",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Choose background"
        className="group flex h-11 items-center gap-2.5 rounded-full border border-line bg-panel/80 pl-3.5 pr-4 text-ink-2 backdrop-blur-xl transition-colors duration-400 hover:border-accent hover:text-ink"
      >
        <Layers className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em]">
          {enabled ? SCENES.find((s) => s.id === scene)?.label : "Off"}
        </span>
      </button>
    </div>
  );
}
