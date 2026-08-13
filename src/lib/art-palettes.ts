import type { SwatchSpec } from "@/components/art/WallpaperSwatch";

/**
 * Chrome artwork — the pattern plates that sit behind page headers and
 * section bands.
 *
 * These are STRUCTURAL, not product. They are deliberately near-black and
 * cold: their job is to give a dark page texture and depth without ever
 * competing with the wallpaper being sold, and without introducing a warm or
 * metallic cast into the interface.
 *
 * Hard rule: nothing in this file may be warm. No cream, no tan, no gold, no
 * brass, no amber. Greys carry a blue bias so they sit with the ice accent.
 */
export const chromeArt: Record<string, SwatchSpec> = {
  ashlar: {
    kind: "ashlar",
    palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
    scale: 1.35,
  },
  herringbone: {
    kind: "herringbone",
    palette: ["#090b0f", "#232a34", "#11161d", "#333c48"],
    scale: 1.5,
  },
  geometric: {
    kind: "geometric",
    palette: ["#090b0e", "#2b3440", "#141a22", "#46525f"],
    scale: 1.45,
  },
  arabesque: {
    kind: "arabesque",
    palette: ["#080a0d", "#242c38", "#101620", "#3a4552"],
    scale: 1.4,
  },
  trellis: {
    kind: "trellis",
    palette: ["#090b0f", "#28303b", "#131922", "#3d4753"],
    scale: 1.5,
  },
  moire: {
    kind: "moire",
    palette: ["#080a0e", "#222934", "#10151c", "#37404c"],
    scale: 1.5,
  },
  stripe: {
    kind: "stripe",
    palette: ["#090b0f", "#242b36", "#12171e", "#353e4a"],
    scale: 1.6,
  },
  marble: {
    kind: "marble",
    palette: ["#080a0d", "#2a323e", "#111720", "#414b58"],
    scale: 1.5,
  },
  grasscloth: {
    kind: "grasscloth",
    palette: ["#090b0f", "#232a35", "#12171f", "#333c47"],
    scale: 1.4,
  },
  botanical: {
    kind: "botanical",
    palette: ["#080a0d", "#26303a", "#111820", "#3b4653"],
    scale: 1.35,
  },
};
