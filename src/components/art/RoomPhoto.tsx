import type { CSSProperties } from "react";
import type { SwatchSpec } from "./WallpaperSwatch";
import { srcForKey } from "@/lib/data/imagery";
import { cx } from "@/components/ui/primitives";

/**
 * Drop-in replacement for `WallpaperSwatch`.
 *
 * Same props, same box-filling behaviour — but renders real wallpapered-room
 * photography instead of a generated pattern. Every call site that used to
 * show a procedural swatch shows a photograph by swapping one import.
 *
 * Uses a plain <img> rather than next/image on purpose: these are scattered
 * through cards, thumbnails and full-bleed panels, and `fill` would require
 * every one of those parents to be positioned. Unsplash already serves a
 * correctly-sized, optimised file from the query string, and this is
 * placeholder imagery — when the real photography lands it moves to
 * next/image with known dimensions.
 *
 * `spec` is accepted and ignored so the swap needs no other edits.
 */
export function RoomPhoto({
  seed,
  className = "",
  style,
  priority = false,
  alt = "",
}: {
  spec?: SwatchSpec;
  seed: string;
  className?: string;
  style?: CSSProperties;
  lit?: boolean;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <img
      src={srcForKey(seed, 900)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={style}
      className={cx("h-full w-full object-cover", className)}
    />
  );
}
