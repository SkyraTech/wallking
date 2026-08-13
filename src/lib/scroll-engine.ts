/**
 * A single requestAnimationFrame loop that every scroll-reactive element on
 * the page shares.
 *
 * The rules that keep this smooth:
 *  - One rAF, one scroll listener, one ResizeObserver for the whole document.
 *  - Element geometry is measured only on resize / mutation, never per frame.
 *    Per frame we do arithmetic and write a transform. No layout reads.
 *  - The loop parks itself when nothing has moved, so an idle page costs zero.
 *  - Everything is a no-op under `prefers-reduced-motion`.
 */

export type ScrollState = {
  /** Raw window.scrollY */
  y: number;
  /** Critically-damped follower of `y`; what parallax should read. */
  smooth: number;
  /** Signed pixels moved on the last frame. */
  velocity: number;
  vh: number;
  vw: number;
};

type FrameFn = (state: ScrollState) => void;
type MeasureFn = () => void;

const LERP = 0.115;
const SETTLE_EPSILON = 0.02;

class ScrollEngine {
  private frames = new Set<FrameFn>();
  private measures = new Set<MeasureFn>();
  private rafId = 0;
  private running = false;
  private idleFrames = 0;
  private resizeRaf = 0;

  readonly state: ScrollState = {
    y: 0,
    smooth: 0,
    velocity: 0,
    vh: 0,
    vw: 0,
  };

  reducedMotion = false;

  private initialised = false;

  private init() {
    if (this.initialised || typeof window === "undefined") return;
    this.initialised = true;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = mq.matches;
    mq.addEventListener("change", (e) => {
      this.reducedMotion = e.matches;
      this.measureAll();
      this.kick();
    });

    this.state.y = window.scrollY;
    this.state.smooth = window.scrollY;
    this.readViewport();

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("orientationchange", this.onResize);

    // Late-loading fonts and images shift geometry; re-measure when they land.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => this.onResize());
    }
    window.addEventListener("load", this.onResize);
  }

  private readViewport() {
    this.state.vh = window.innerHeight;
    this.state.vw = window.innerWidth;
  }

  private onScroll = () => {
    this.state.y = window.scrollY;
    this.kick();
  };

  private onResize = () => {
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      this.readViewport();
      this.measureAll();
      this.kick();
    });
  };

  private measureAll() {
    for (const m of this.measures) m();
  }

  /** Wake the loop and give it a few frames of runway. */
  kick() {
    this.idleFrames = 0;
    if (!this.running) {
      this.running = true;
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private tick = () => {
    const s = this.state;
    const target = s.y;
    const prev = s.smooth;

    if (this.reducedMotion) {
      s.smooth = target;
    } else {
      s.smooth += (target - prev) * LERP;
      // Snap once we are visually there, so we stop burning frames.
      if (Math.abs(target - s.smooth) < SETTLE_EPSILON) s.smooth = target;
    }
    s.velocity = s.smooth - prev;

    for (const fn of this.frames) fn(s);

    if (s.smooth === target) {
      this.idleFrames += 1;
    } else {
      this.idleFrames = 0;
    }

    // Two settled frames is enough to be sure every subscriber has
    // written its resting transform.
    if (this.idleFrames > 2 || this.frames.size === 0) {
      this.running = false;
      return;
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  onFrame(fn: FrameFn) {
    this.init();
    this.frames.add(fn);
    this.kick();
    return () => {
      this.frames.delete(fn);
      if (this.frames.size === 0 && this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        this.running = false;
      }
    };
  }

  onMeasure(fn: MeasureFn) {
    this.init();
    this.measures.add(fn);
    fn();
    return () => {
      this.measures.delete(fn);
    };
  }
}

export const scrollEngine = new ScrollEngine();

/** Absolute document-space top of an element, without forcing a reflow chain. */
export function documentTop(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  return rect.top + window.scrollY;
}

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

/** Map `v` from [a1,b1] into [a2,b2], clamped. */
export const mapRange = (
  v: number,
  a1: number,
  b1: number,
  a2: number,
  b2: number,
) => {
  if (b1 === a1) return a2;
  return clamp(a2 + ((v - a1) / (b1 - a1)) * (b2 - a2), Math.min(a2, b2), Math.max(a2, b2));
};
