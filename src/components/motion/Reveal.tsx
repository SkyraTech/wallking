"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * One IntersectionObserver for the whole document. Every revealing element
 * registers with it, so a page with 200 reveals still has a single observer.
 */
let observer: IntersectionObserver | null = null;
const seen = new WeakSet<Element>();

function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.setAttribute("data-revealed", "");
        seen.add(el);
        observer?.unobserve(el);
      }
    },
    {
      // Fire a little before the element is fully on screen, so the motion
      // finishes as the reader arrives rather than starting then.
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.01,
    },
  );
  return observer;
}

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen.has(el)) return;
    const obs = getObserver();
    obs?.observe(el);
    return () => obs?.unobserve(el);
  }, []);
  return ref;
}

export type RevealVariant = "up" | "clip" | "wipe" | "scale";

type RevealProps = {
  as?: ElementType;
  variant?: RevealVariant;
  /** ms */
  delay?: number;
  /** starting offset for the "up" variant, px */
  y?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
};

export function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  y,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      data-reveal={variant === "up" ? "" : variant}
      className={className}
      style={
        {
          ...style,
          ...(delay ? { "--reveal-delay": `${delay}ms` } : {}),
          ...(y !== undefined ? { "--reveal-y": `${y}px` } : {}),
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Headline that rises line by line out of a mask.
 * Pass an array of lines — deliberately explicit rather than auto-splitting,
 * because where a display headline breaks is a typographic decision.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  stagger = 90,
  delay = 0,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useReveal<HTMLHeadingElement>();
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className={`split-line ${lineClassName ?? ""}`} key={i}>
          <span
            style={
              { "--reveal-delay": `${delay + i * stagger}ms` } as CSSProperties
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Counts to a number the first time it scrolls into view. */
export function CountUp({
  to,
  duration = 1600,
  suffix = "",
  prefix = "",
  className,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const render = (v: number) => {
      el.textContent = `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`;
    };

    if (reduced) {
      render(to);
      return;
    }

    render(0);
    let raf = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutExpo — fast arrival, long settle
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          render(to * eased);
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {to.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
