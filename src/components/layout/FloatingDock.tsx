"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollEngine } from "@/lib/scroll-engine";
import { whatsappLink } from "@/lib/site";
import { cx } from "@/components/ui/primitives";

/**
 * Bottom-right dock: WhatsApp enquiry plus a back-to-top that doubles as a
 * page-progress ring. Both appear only once the reader has committed to the
 * page, so they never cover the hero.
 */
export function FloatingDock() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const R = 17;
    const circumference = 2 * Math.PI * R;

    return scrollEngine.onFrame((s) => {
      const max = document.documentElement.scrollHeight - s.vh;
      const p = max > 0 ? Math.min(s.smooth / max, 1) : 0;

      setVisible((prev) => {
        const next = s.y > s.vh * 0.6;
        return prev === next ? prev : next;
      });

      if (ringRef.current) {
        ringRef.current.style.strokeDasharray = `${circumference}`;
        ringRef.current.style.strokeDashoffset = `${circumference * (1 - p)}`;
      }
    });
  }, []);

  return (
    <div
      className={cx(
        "fixed bottom-6 right-6 z-[130] flex flex-col items-end gap-3 transition-all duration-700 [transition-timing-function:var(--ease-cut)]",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="group relative grid h-11 w-11 place-items-center rounded-none border border-line-2 bg-panel/85 text-ink-2 backdrop-blur-md transition-colors duration-500 hover:border-accent hover:text-accent"
      >
        <svg
          viewBox="0 0 40 40"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            ref={ringRef}
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
        <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <a
        href={whatsappLink(
          "Hello Wall King — I'd like to enquire about your wallpaper collections.",
        )}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex h-11 items-center gap-2.5 rounded-full bg-[#25D366] px-4 text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:bg-[#20bd5a] hover:scale-105"
        aria-label="Enquire on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current text-white" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.21-8.24 8.21Z" />
        </svg>
        <span className="text-[0.8125rem] font-semibold tracking-tight text-white">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
}
