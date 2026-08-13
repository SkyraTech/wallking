import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import { srcForKey, blurForKey } from "@/lib/data/imagery";
import { cx } from "@/components/ui/primitives";

/**
 * A wallpapered wall behind a section.
 *
 * Drop this as the first child of any `relative` section and it fills the
 * band with real room photography, parallaxing slowly, knocked back far
 * enough that body copy still clears AA.
 *
 * The wash is THEME-AWARE: on the light act it is a pale bone veil, on dark a
 * charcoal one. That is deliberate — a fixed dark scrim on every section was
 * what made the two themes look identical.
 *
 * `strength` controls how much wallpaper shows through:
 *   "whisper" — texture only, for text-heavy bands
 *   "soft"    — clearly a wall, still safe behind paragraphs
 *   "bold"    — for bands that carry little or no small text
 */
export function SectionBackdrop({
  seed,
  strength = "whisper",
  className,
}: {
  seed: string;
  strength?: "whisper" | "soft" | "bold";
  className?: string;
}) {
  const wash = {
    whisper: "bg-void/45",
    soft: "bg-void/60",
    bold: "bg-void/75",
  }[strength];

  return (
    <div aria-hidden className={cx("absolute inset-0 -z-10 overflow-hidden", className)}>
      <Parallax speed={0.1} zoom={0.04} cover className="absolute inset-0">
        <Image
          src={srcForKey(seed, 1800)}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurForKey(seed)}
          className="object-cover"
        />
      </Parallax>
      <div className={cx("absolute inset-0", wash)} />
      {/* Feather the band into whatever sits above and below it. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-void to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}
