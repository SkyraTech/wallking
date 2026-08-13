"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { clamp, scrollEngine } from "@/lib/scroll-engine";

type ParallaxOptions = {
  /**
   * Pixels of counter-movement per pixel of scroll.
   * 0 = pinned to the page. 0.1–0.25 = background depth.
   * Negative = moves *with* the scroll faster than the page (foreground).
   */
  speed?: number;
  /** Horizontal drift, same units as `speed`. */
  speedX?: number;
  /** Scale delta applied across the element's travel through the viewport. */
  zoom?: number;
  /** Degrees of rotation across the travel. */
  rotate?: number;
  /** [entering, centred] opacity. */
  fade?: [number, number];
  /** Pre-scale the layer so a translating background never shows its edge. */
  cover?: boolean;
  /** Hard cap on translation, in px. */
  max?: number;
};

/**
 * Attaches an element to the shared scroll loop.
 * Returns a ref you spread onto any host element.
 */
export function useParallax<T extends HTMLElement>({
  speed = 0.14,
  speedX = 0,
  zoom = 0,
  rotate = 0,
  fade,
  cover = false,
  max = 600,
}: ParallaxOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Geometry cache — written on measure, read on frame.
    const geom = { center: 0, span: 1 };

    const measure = () => {
      const rect = el.getBoundingClientRect();
      geom.center = rect.top + window.scrollY + rect.height / 2;
      geom.span = (window.innerHeight + rect.height) / 2;
    };

    const baseScale = cover ? 1 + Math.min(Math.abs(speed) * 0.35, 0.06) : 1;

    const render = (s: { smooth: number; vh: number }) => {
      const delta = s.smooth + s.vh / 2 - geom.center;
      // -1 just below the fold, 0 centred, +1 just above it.
      const p = clamp(delta / geom.span, -1, 1);

      if (scrollEngine.reducedMotion) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }

      const ty = clamp(delta * speed, -max, max);
      const tx = clamp(delta * speedX, -max, max);
      const scale = baseScale + zoom * Math.abs(p);
      const rot = rotate * p;

      let t = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      if (scale !== 1) t += ` scale(${scale.toFixed(4)})`;
      if (rot !== 0) t += ` rotate(${rot.toFixed(3)}deg)`;
      el.style.transform = t;

      if (fade) {
        const [edge, centre] = fade;
        el.style.opacity = (edge + (centre - edge) * (1 - Math.abs(p))).toFixed(3);
      }
    };

    el.style.willChange = "transform";
    el.style.backfaceVisibility = "hidden";

    const offMeasure = scrollEngine.onMeasure(measure);
    const offFrame = scrollEngine.onFrame(render);

    // Elements whose own size settles late (images, embedded SVG).
    const ro = new ResizeObserver(() => {
      measure();
      scrollEngine.kick();
    });
    ro.observe(el);

    return () => {
      offMeasure();
      offFrame();
      ro.disconnect();
      el.style.willChange = "";
      el.style.transform = "";
    };
  }, [speed, speedX, zoom, rotate, cover, max, fade]);

  return ref;
}

type ParallaxProps = ParallaxOptions & {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
};

export function Parallax({
  as: Tag = "div",
  className,
  children,
  style,
  speed,
  speedX,
  zoom,
  rotate,
  fade,
  cover,
  max,
  ...rest
}: ParallaxProps) {
  const ref = useParallax<HTMLDivElement>({
    speed,
    speedX,
    zoom,
    rotate,
    fade,
    cover,
    max,
  });
  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Publishes a 0→1 progress value for a section as it crosses the viewport,
 * written to a CSS custom property so children can react in pure CSS.
 */
export function useSectionProgress<T extends HTMLElement>(
  varName = "--progress",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const geom = { start: 0, length: 1 };

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      geom.start = top - window.innerHeight;
      geom.length = rect.height + window.innerHeight;
    };

    let last = -1;
    const render = (s: { smooth: number }) => {
      const p = clamp((s.smooth - geom.start) / geom.length, 0, 1);
      const rounded = Math.round(p * 1000) / 1000;
      if (rounded !== last) {
        last = rounded;
        el.style.setProperty(varName, String(rounded));
      }
    };

    const offMeasure = scrollEngine.onMeasure(measure);
    const offFrame = scrollEngine.onFrame(render);
    return () => {
      offMeasure();
      offFrame();
    };
  }, [varName]);

  return ref;
}

/**
 * Pointer-driven depth. Writes eased `--mx` / `--my` in the range -1…1 onto
 * the container; layers inside read them with calc(). Disabled for coarse
 * pointers, where there is no cursor to follow.
 */
export function useMouseParallax<T extends HTMLElement>(strength = 1) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (scrollEngine.reducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;
    let idle = 0;

    const loop = () => {
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      el.style.setProperty("--mx", (curX * strength).toFixed(4));
      el.style.setProperty("--my", (curY * strength).toFixed(4));

      const settled =
        Math.abs(targetX - curX) < 0.0008 && Math.abs(targetY - curY) < 0.0008;
      idle = settled ? idle + 1 : 0;
      raf = idle > 3 ? 0 : requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width - 0.5;
      targetY = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) {
        idle = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!raf) {
        idle = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return ref;
}
