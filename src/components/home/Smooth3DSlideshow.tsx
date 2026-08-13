"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { byNewest, tagLabel } from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";
import { srcFor } from "@/lib/data/imagery";

export interface Slide {
  image?: { src?: string; srcSet?: string; alt?: string };
  title?: string;
  slug?: string;
  brand?: string;
  tag?: string;
}

type AutoplayDir = "leftToRight" | "rightToLeft";
type TitleCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface Smooth3DSlideshowProps {
  slides?: Slide[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tilt?: number;
  sideTilt?: number;
  gap?: number;
  opacity?: number;
  transition?: any;
  autoplay?: boolean;
  autoplayDirection?: AutoplayDir;
  showTitle?: boolean;
  titleFont?: CSSProperties;
  titleColor?: string;
  titlePosition?: {
    position?: TitleCorner;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
  };
  style?: CSSProperties;
}

const brandName = (slug?: string) =>
  brands.find((b) => b.slug === slug)?.name ?? slug ?? "";

const DEFAULT_SLIDES: Slide[] = byNewest.slice(0, 8).map((c) => ({
  image: {
    src: srcFor(c.slug, 1200),
    alt: c.name,
  },
  title: `${c.name}\n${brandName(c.brand)}`,
  slug: c.slug,
  brand: brandName(c.brand),
  tag: c.tags[0] ? tagLabel[c.tags[0]] : "New Arrival",
}));

// Fixed internals.
const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
const DEPTH = 240;

function cssTransition(t: any): { dur: number; ease: string } {
  const dur = t && typeof t.duration === "number" ? t.duration : 0.6;
  let ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const e = t?.ease;
  if (Array.isArray(e) && e.length === 4) {
    ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`;
  } else if (typeof e === "string") {
    const map: Record<string, string> = {
      linear: "linear",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    };
    ease = map[e] || "ease";
  }
  return { dur, ease };
}

export function Smooth3DSlideshow(props: Smooth3DSlideshowProps) {
  const slides = props.slides || DEFAULT_SLIDES;
  const cardWidth = props.cardWidth ?? 440;
  const cardHeight = props.cardHeight ?? 440;
  const radius = props.radius ?? 6;
  const tilt = props.tilt ?? 12;
  const sideTilt = props.sideTilt ?? 8;
  const gap = props.gap ?? 8;
  const opacity = props.opacity ?? 60;
  const transition = props.transition;
  const autoplay = props.autoplay ?? false;
  const autoplayDirection = props.autoplayDirection ?? "rightToLeft";
  const showTitle = props.showTitle ?? true;
  const titleFont = props.titleFont;
  const titleColor = props.titleColor ?? "#ffffff";
  const titlePosition = props.titlePosition;
  const style = props.style;

  const tp = titlePosition || {};
  const corner: TitleCorner = tp.position || "bottomLeft";
  const isTop = corner === "topLeft" || corner === "topRight";
  const isRight = corner === "topRight" || corner === "bottomRight";
  const padLeft = tp.paddingLeft ?? 22;
  const padRight = tp.paddingRight ?? 22;
  const padTop = tp.paddingTop ?? 24;
  const padBottom = tp.paddingBottom ?? 24;

  const list = slides && slides.length ? slides : DEFAULT_SLIDES;
  const n = list.length;
  const loop = true;
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive((a) => Math.max(0, Math.min(n - 1, a)));
  }, [n]);

  const moveDur =
    transition && typeof transition.duration === "number"
      ? transition.duration
      : 0.6;
  const lockRef = useRef(false);
  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, Math.max(50, moveDur * 1000));
  }, [moveDur]);

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current) return;
      lock();
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n, lock]
  );

  const handleCardClick = useCallback(
    (i: number) => {
      if (autoplay || lockRef.current) return;
      lock();
      setActive((a) => (i === a ? (a + 1) % n : i));
    },
    [autoplay, n, lock]
  );

  const delay =
    transition && typeof transition.delay === "number"
      ? transition.delay
      : 2.5;
  useEffect(() => {
    if (!autoplay || n < 2) return;
    const ms = Math.max(0.3, delay) * 1000;
    const dir = autoplayDirection === "leftToRight" ? -1 : 1;
    const id = window.setInterval(() => step(dir), ms);
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDirection, delay, n, step]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    },
    [step]
  );

  const { dur, ease } = cssTransition(transition);
  const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`;

  const effectiveRadius =
    (Math.max(0, Math.min(20, radius)) / 20) *
    (Math.min(cardWidth, cardHeight) / 2);
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;

  const rootStyle: CSSProperties = {
    ...(style || {}),
    position: "relative",
    width: "100%",
    height: "100%",
    minWidth: 320,
    minHeight: cardHeight + 80,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    perspective: `${PERSPECTIVE}px`,
    overflow: "hidden",
    outline: "none",
  };

  const activeSlide = list[active];

  return (
    <div
      style={rootStyle}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={onKeyDown}
      className="py-6"
    >
      {/* 3D Stage */}
      <div
        style={{
          position: "relative",
          width: cardWidth,
          height: cardHeight,
          transformStyle: "preserve-3d",
        }}
      >
        {list.map((slide, i) => {
          let rel = i - active;
          if (loop) {
            if (rel > n / 2) rel -= n;
            if (rel < -n / 2) rel += n;
          }
          const ax = Math.abs(rel);
          const visible = ax <= MAX_VISIBLE;
          const isActive = rel === 0;
          const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
          const tx = rel * (gap * 30);
          const tz = -ax * DEPTH;
          const ry = -rel * tilt;
          const rz = rel * sideTilt;
          const src = slide.image?.src || "";

          const cardStyle: CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: cardWidth,
            height: cardHeight,
            borderRadius: effectiveRadius,
            overflow: "hidden",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
            transition: transitionCss,
            opacity: visible ? 1 : 0,
            cursor: "pointer",
            pointerEvents: visible ? "auto" : "none",
            backgroundColor: "#1a1a1a",
          };

          return (
            <div
              key={i}
              style={cardStyle}
              onClick={() => handleCardClick(i)}
              aria-label={slide.title}
              aria-hidden={!visible}
              className="group relative shadow-2xl border border-line-2"
            >
              {src ? (
                <img
                  src={src}
                  alt={slide.image?.alt || slide.title || ""}
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    userSelect: "none",
                  }}
                />
              ) : null}

              {/* Tag Badge */}
              {slide.tag && (
                <span className="eyebrow absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[0.625rem] text-white backdrop-blur-md">
                  {slide.tag}
                </span>
              )}

              {showTitle && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isTop
                        ? "linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)"
                        : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: padLeft,
                      right: padRight,
                      [isTop ? "top" : "bottom"]: isTop ? padTop : padBottom,
                      textAlign: isRight ? "right" : "left",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        color: titleColor,
                        fontSize: 26,
                        fontWeight: 700,
                        lineHeight: "1.15em",
                        letterSpacing: "-0.02em",
                        whiteSpace: "pre-line",
                        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                        ...(titleFont || {}),
                      }}
                    >
                      {slide.title}
                    </span>
                  </div>
                </>
              )}

              {/* Dim overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#000000",
                  opacity: isActive ? 0 : dim,
                  transition: `opacity ${dur}s ${ease}`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Control Buttons & Active Collection Link */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step(-1)}
            aria-label="Previous 3D slide"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/90 text-ink shadow-sm backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>

          {activeSlide?.slug && (
            <Link
              href={`/collections/${activeSlide.slug}`}
              className="eyebrow inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-5 py-2.5 text-[0.6875rem] font-bold text-accent transition-all duration-300 hover:bg-accent hover:text-white shadow-sm"
            >
              Explore {activeSlide.title?.split("\n")[0]} Collection
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          <button
            onClick={() => step(1)}
            aria-label="Next 3D slide"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/90 text-ink shadow-sm backdrop-blur-md transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Slide Counter dots */}
        <div className="flex items-center gap-1.5">
          {list.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === active ? "w-6 bg-accent" : "w-1.5 bg-line-2 hover:bg-ink-3"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Smooth3DSlideshow;
