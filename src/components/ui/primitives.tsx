import Link from "next/link";
import type { ComponentProps, ElementType, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Container({
  children,
  className,
  wide = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
  as?: ElementType;
}) {
  return (
    <Tag
      className={cx(
        "mx-auto w-full px-10 sm:px-16 md:px-24 lg:px-36 xl:px-48 2xl:px-56",
        wide ? "max-w-[1180px]" : "max-w-[980px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Small tracked caps with a leading rule — the site's connective tissue. */
export function Eyebrow({
  children,
  className,
  rule = true,
  tone = "accent",
}: {
  children: ReactNode;
  className?: string;
  rule?: boolean;
  tone?: "accent" | "muted" | "invert";
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "invert"
        ? "text-ink-invert/70"
        : "text-ink-3";
  return (
    <span className={cx("eyebrow inline-flex items-center gap-2.5", toneClass, className)}>
      {rule && (
        <span aria-hidden className="h-px w-6 bg-current opacity-50" />
      )}
      {children}
    </span>
  );
}

export function SectionNumber({ n }: { n: string }) {
  return (
    <span className="eyebrow tnum text-ink-3" aria-hidden>
      {n}
    </span>
  );
}

/* ------------------------------------------------------------------ buttons */

type ButtonTone = "solid" | "outline" | "ghost" | "invert";

/* Pill on every variant — Arva's shape language. One filled chromatic
   action colour only, Apple's rule: `solid` is the single conversion button
   and everything else is outline or ghost. */
const buttonBase =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-medium tracking-[-0.005em] transition-[background-color,color,border-color] duration-400 [transition-timing-function:var(--ease-out)] disabled:pointer-events-none disabled:opacity-40";

const buttonSize = {
  sm: "h-8 px-3.5 text-[0.75rem]",
  md: "h-9.5 px-5 text-[0.8125rem]",
  lg: "h-11 px-6 text-[0.875rem]",
} as const;

const buttonTone: Record<ButtonTone, string> = {
  solid: "bg-accent text-white hover:bg-accent-hover",
  outline: "border border-line-2 text-ink hover:border-accent hover:text-accent",
  ghost: "text-ink-2 hover:text-accent",
  invert: "bg-ink text-ink-invert hover:bg-accent hover:text-white",
};

export function CTA({
  children,
  href,
  tone = "solid",
  size = "md",
  className,
  arrow = true,
  external = false,
  ...rest
}: {
  children: ReactNode;
  href: string;
  tone?: ButtonTone;
  size?: keyof typeof buttonSize;
  className?: string;
  arrow?: boolean;
  external?: boolean;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const cls = cx(buttonBase, buttonSize[size], buttonTone[tone], className);
  const inner = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  );
}

export function ButtonEl({
  children,
  tone = "solid",
  size = "md",
  className,
  arrow = false,
  ...rest
}: ComponentProps<"button"> & {
  tone?: ButtonTone;
  size?: keyof typeof buttonSize;
  arrow?: boolean;
}) {
  return (
    <button
      className={cx(buttonBase, buttonSize[size], buttonTone[tone], className)}
      {...rest}
    >
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cx(
        "h-3.5 w-3.5 shrink-0 transition-transform duration-500 [transition-timing-function:var(--ease-cut)] group-hover/btn:translate-x-1",
        className,
      )}
    >
      <path
        d="M3 10h13M11 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- tags */

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "live" | "warn" | "out";
  className?: string;
}) {
  const tones = {
    default: "border-line text-ink-2",
    accent: "border-accent/50 bg-accent-soft text-accent",
    live: "border-live/40 text-live",
    warn: "border-alert/40 text-alert",
    out: "border-line text-ink-3",
  };
  return (
    <span
      className={cx(
        "eyebrow inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.625rem]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StockDot({ stock }: { stock: "in" | "limited" | "out" }) {
  // Square, not round — same language as the rest of the interface.
  const colour =
    stock === "in" ? "bg-live" : stock === "limited" ? "bg-alert" : "bg-ink-3";
  return (
    <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
      <span className={cx("h-1.5 w-1.5", colour)} />
      {stock === "in" && (
        <span
          className={cx("rec-dot absolute inset-0", colour)}
          aria-hidden
        />
      )}
    </span>
  );
}

/* ----------------------------------------------------------------- headings */

export function SectionHead({
  eyebrow,
  title,
  lede,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "",
        action ? "md:flex-row md:items-end md:justify-between" : "",
        className,
      )}
    >
      <div className={cx("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
        <h2 className="display-lg text-ink">{title}</h2>
        {lede && <p className="lede mt-5">{lede}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
