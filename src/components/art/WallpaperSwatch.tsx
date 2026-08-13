import type { CSSProperties } from "react";

/**
 * Procedural wallcovering artwork.
 *
 * Wall King's real photography drops in later (see `public/collections/README`).
 * Until then every collection renders as an actual repeating pattern built from
 * its own palette and tile geometry, so the catalogue reads as a catalogue
 * rather than as a grid of grey boxes.
 *
 * Palettes are deliberately NOT theme-reactive: a wallpaper is a physical
 * product and its colour does not change because the reader dimmed the site.
 * Each swatch instead carries its own ground colour and a soft raking-light
 * overlay so it sits convincingly on either canvas.
 */

export type PatternKind =
  | "damask"
  | "botanical"
  | "geometric"
  | "stripe"
  | "terrazzo"
  | "grasscloth"
  | "arabesque"
  | "herringbone"
  | "marble"
  | "trellis"
  | "moire"
  | "ashlar";

export type SwatchSpec = {
  kind: PatternKind;
  /** [ground, primary, secondary, highlight] */
  palette: [string, string, string, string];
  /** Tile scale multiplier; 1 is the drawn size. */
  scale?: number;
};

/* -- Deterministic noise --------------------------------------------------
   `r(i)` is a PURE function of (seed, i): the same index always yields the
   same float. A stateful generator would look equivalent but is not — React
   can re-render a tile without re-running its parent, and a sequence that has
   already advanced then produces different geometry on the client than the
   server sent, which is a hydration mismatch. Index-addressed noise cannot
   drift no matter how many times a component is re-entered.                */
function makeNoise(seed: number) {
  return (i: number) => {
    let t = (seed + i * 0x9e3779b9) >>> 0;
    t = Math.imul(t ^ (t >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type TileProps = {
  p: [string, string, string, string];
  r: (i: number) => number;
};

/* ---------------------------------------------------------------- tiles */

function DamaskTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  return (
    <g>
      {/* ogee frame */}
      <path
        d="M60 4 C96 24 116 56 116 88 C116 122 92 148 60 172 C28 148 4 122 4 88 C4 56 24 24 60 4 Z"
        fill="none"
        stroke={mid}
        strokeWidth="1.1"
        opacity="0.75"
      />
      {/* central acanthus */}
      <path
        d="M60 34 C48 50 44 66 52 80 C44 78 36 82 34 92 C42 96 52 94 58 88 C56 102 62 116 60 132 C58 116 64 102 62 88 C68 94 78 96 86 92 C84 82 76 78 68 80 C76 66 72 50 60 34 Z"
        fill={ink}
        opacity="0.9"
      />
      <path
        d="M60 118 C50 128 44 140 46 154 C54 150 60 142 60 132 C60 142 66 150 74 154 C76 140 70 128 60 118 Z"
        fill={mid}
      />
      {/* scrolls */}
      <path
        d="M30 96 C18 100 12 112 16 124 C24 120 30 110 30 96 Z M90 96 C102 100 108 112 104 124 C96 120 90 110 90 96 Z"
        fill={light}
        opacity="0.85"
      />
      <circle cx="60" cy="26" r="3.4" fill={light} />
      <circle cx="60" cy="166" r="3.4" fill={light} />
    </g>
  );
}

function BotanicalTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  const leaf = (x: number, y: number, r: number, s: number, fill: string) => (
    <path
      key={`${x}-${y}-${r}`}
      d="M0 0 C14 -10 30 -6 38 6 C26 18 8 16 0 0 Z"
      fill={fill}
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
    />
  );
  return (
    <g>
      <path
        d="M18 190 C22 150 40 122 34 84 C30 54 46 30 70 10"
        fill="none"
        stroke={mid}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M130 190 C126 156 108 130 116 92 C122 62 108 34 88 12"
        fill="none"
        stroke={mid}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {leaf(34, 84, -32, 1, ink)}
      {leaf(34, 84, 148, 0.8, mid)}
      {leaf(26, 132, -18, 0.9, mid)}
      {leaf(26, 132, 162, 0.7, light)}
      {leaf(52, 44, -48, 0.85, ink)}
      {leaf(116, 92, 200, 0.9, ink)}
      {leaf(116, 92, 24, 0.7, light)}
      {leaf(120, 142, 190, 0.75, mid)}
      {leaf(100, 44, 214, 0.8, mid)}
      <circle cx="70" cy="12" r="4" fill={light} />
      <circle cx="88" cy="14" r="2.6" fill={light} opacity="0.8" />
      <circle cx="20" cy="186" r="3" fill={light} opacity="0.7" />
    </g>
  );
}

function GeometricTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  const hex = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    return pts;
  };
  return (
    <g>
      <polygon points={hex(50, 50, 30)} fill="none" stroke={mid} strokeWidth="1.1" />
      <polygon points={hex(50, 50, 19)} fill={ink} opacity="0.16" />
      <polygon points={hex(50, 50, 9)} fill={light} />
      <polygon points={hex(0, 100, 30)} fill="none" stroke={mid} strokeWidth="1.1" />
      <polygon points={hex(100, 100, 30)} fill="none" stroke={mid} strokeWidth="1.1" />
      <polygon points={hex(0, 0, 30)} fill="none" stroke={mid} strokeWidth="1.1" />
      <polygon points={hex(100, 0, 30)} fill="none" stroke={mid} strokeWidth="1.1" />
      <g stroke={ink} strokeWidth="0.7" opacity="0.5">
        <path d="M50 20 L50 4 M50 80 L50 96 M24 35 L10 27 M76 65 L90 73 M24 65 L10 73 M76 35 L90 27" />
      </g>
    </g>
  );
}

function StripeTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  return (
    <g>
      <rect x="0" y="0" width="17" height="120" fill={ink} opacity="0.9" />
      <rect x="22" y="0" width="3" height="120" fill={mid} />
      <rect x="29" y="0" width="1.4" height="120" fill={mid} opacity="0.7" />
      <rect x="38" y="0" width="9" height="120" fill={light} opacity="0.85" />
      <rect x="52" y="0" width="1.4" height="120" fill={mid} opacity="0.55" />
      <rect x="58" y="0" width="5" height="120" fill={mid} opacity="0.6" />
      {/* faint slub texture so flat stripes still read as cloth */}
      <g stroke={ink} strokeWidth="0.5" opacity="0.14">
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d={`M0 ${i * 5 + 2} H70`} />
        ))}
      </g>
    </g>
  );
}

function TerrazzoTile({ p, r }: TileProps) {
  const [, ink, mid, light] = p;
  const chips = Array.from({ length: 46 }, (_, i) => {
    const b = i * 16;
    const cx = r(b) * 160;
    const cy = r(b + 1) * 160;
    const size = 2 + r(b + 2) * 7;
    const rot = r(b + 3) * 360;
    const fill = [ink, mid, light, mid][i % 4];
    const sides = 3 + Math.floor(r(b + 4) * 4);
    const pts = Array.from({ length: sides }, (_, k) => {
      const a = ((Math.PI * 2) / sides) * k;
      const rr = size * (0.6 + r(b + 5 + k) * 0.7);
      return `${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    return (
      <polygon
        key={i}
        points={pts}
        fill={fill}
        opacity={(0.55 + r(b + 12) * 0.45).toFixed(2)}
        transform={`translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${rot.toFixed(1)})`}
      />
    );
  });
  return <g>{chips}</g>;
}

function GrassclothTile({ p, r }: TileProps) {
  const [, ink, mid, light] = p;
  const fibres = Array.from({ length: 58 }, (_, i) => {
    const b = i * 6;
    const y = (i / 58) * 120 + r(b) * 1.6;
    const w = 0.5 + r(b + 1) * 1.5;
    const o = 0.12 + r(b + 2) * 0.5;
    const pickFibre = r(b + 3);
    const fill = pickFibre > 0.72 ? light : pickFibre > 0.4 ? mid : ink;
    return (
      <rect
        key={i}
        x={-4}
        y={y.toFixed(2)}
        width={128}
        height={w.toFixed(2)}
        fill={fill}
        opacity={o.toFixed(2)}
      />
    );
  });
  const slubs = Array.from({ length: 16 }, (_, i) => {
    const b = 900 + i * 6;
    return (
      <rect
        key={`s${i}`}
        x={(r(b) * 120).toFixed(1)}
        y={(r(b + 1) * 120).toFixed(1)}
        width={(6 + r(b + 2) * 22).toFixed(1)}
        height={(0.8 + r(b + 3) * 1.4).toFixed(1)}
        fill={light}
        opacity={(0.2 + r(b + 4) * 0.35).toFixed(2)}
      />
    );
  });
  return (
    <g>
      {fibres}
      {slubs}
    </g>
  );
}

function ArabesqueTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  const quatrefoil =
    "M60 12 C74 12 84 22 84 36 C98 36 108 46 108 60 C108 74 98 84 84 84 C84 98 74 108 60 108 C46 108 36 98 36 84 C22 84 12 74 12 60 C12 46 22 36 36 36 C36 22 46 12 60 12 Z";
  return (
    <g>
      <path d={quatrefoil} fill="none" stroke={mid} strokeWidth="1.4" />
      <path d={quatrefoil} fill={ink} opacity="0.12" transform="translate(60 60) scale(0.62) translate(-60 -60)" />
      <circle cx="60" cy="60" r="7" fill={light} />
      <g stroke={mid} strokeWidth="0.9" opacity="0.6">
        <path d="M60 0 V12 M60 108 V120 M0 60 H12 M108 60 H120" />
      </g>
      <path d={quatrefoil} fill="none" stroke={mid} strokeWidth="1.4" transform="translate(60 60)" opacity="0.35" />
    </g>
  );
}

function HerringboneTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  return (
    <g>
      <g fill={ink} opacity="0.85">
        <rect x="0" y="0" width="34" height="9" transform="rotate(45 0 0)" />
        <rect x="0" y="34" width="34" height="9" transform="rotate(-45 0 34)" />
      </g>
      <g fill={mid}>
        <rect x="24" y="0" width="34" height="9" transform="rotate(45 24 0)" />
        <rect x="24" y="34" width="34" height="9" transform="rotate(-45 24 34)" />
      </g>
      <g fill={light} opacity="0.9">
        <rect x="12" y="17" width="30" height="6" transform="rotate(45 12 17)" />
      </g>
    </g>
  );
}

function MarbleTile({ p, r }: TileProps) {
  const [, ink, mid, light] = p;
  const veins = Array.from({ length: 9 }, (_, i) => {
    const b = i * 32;
    let x = r(b) * 40 - 20;
    let y = r(b + 1) * 200;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let k = 0; k < 5; k++) {
      const c = b + 4 + k * 4;
      const cx1 = x + 20 + r(c) * 40;
      const cy1 = y + (r(c + 1) - 0.5) * 70;
      x += 40 + r(c + 2) * 40;
      y += (r(c + 3) - 0.5) * 60;
      d += ` S${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return (
      <path
        key={i}
        d={d}
        fill="none"
        stroke={i % 3 === 0 ? light : i % 3 === 1 ? mid : ink}
        strokeWidth={(0.5 + r(b + 28) * 1.9).toFixed(2)}
        opacity={(0.28 + r(b + 29) * 0.5).toFixed(2)}
        strokeLinecap="round"
      />
    );
  });
  const drifts = Array.from({ length: 5 }, (_, i) => {
    const b = 700 + i * 8;
    return (
      <ellipse
        key={`d${i}`}
        cx={(r(b) * 200).toFixed(1)}
        cy={(r(b + 1) * 200).toFixed(1)}
        rx={(30 + r(b + 2) * 60).toFixed(1)}
        ry={(18 + r(b + 3) * 40).toFixed(1)}
        fill={mid}
        opacity="0.07"
        transform={`rotate(${(r(b + 4) * 180).toFixed(1)} 100 100)`}
      />
    );
  });
  return (
    <g>
      {drifts}
      {veins}
    </g>
  );
}

function TrellisTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  return (
    <g>
      <g stroke={mid} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M0 0 L80 80 M80 0 L0 80" />
        <path d="M40 -40 L120 40 M-40 40 L40 120" opacity="0.6" />
      </g>
      <g fill={ink}>
        <circle cx="40" cy="40" r="4.5" />
        <circle cx="0" cy="0" r="3" />
        <circle cx="80" cy="80" r="3" />
        <circle cx="80" cy="0" r="3" />
        <circle cx="0" cy="80" r="3" />
      </g>
      <circle cx="40" cy="40" r="1.8" fill={light} />
    </g>
  );
}

function MoireTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  return (
    <g fill="none" strokeLinecap="round">
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          cx="70"
          cy="70"
          r={6 + i * 7}
          stroke={i % 4 === 0 ? light : i % 2 === 0 ? mid : ink}
          strokeWidth={i % 4 === 0 ? 1.5 : 0.8}
          opacity={0.9 - i * 0.045}
        />
      ))}
      <circle cx="70" cy="70" r="4" fill={light} stroke="none" />
    </g>
  );
}

function AshlarTile({ p }: TileProps) {
  const [, ink, mid, light] = p;
  return (
    <g>
      <rect x="1" y="1" width="76" height="34" rx="1.5" fill={ink} opacity="0.55" />
      <rect x="81" y="1" width="76" height="34" rx="1.5" fill={mid} opacity="0.45" />
      <rect x="-38" y="39" width="76" height="34" rx="1.5" fill={mid} opacity="0.5" />
      <rect x="42" y="39" width="76" height="34" rx="1.5" fill={light} opacity="0.4" />
      <rect x="122" y="39" width="76" height="34" rx="1.5" fill={ink} opacity="0.4" />
      <g stroke={light} strokeWidth="0.6" opacity="0.35">
        <path d="M0 37.5 H160 M0 75.5 H160" />
      </g>
    </g>
  );
}

/* ---------------------------------------------------------- tile registry */

const TILES: Record<
  PatternKind,
  { w: number; h: number; Tile: (props: TileProps) => React.ReactElement }
> = {
  damask: { w: 120, h: 176, Tile: DamaskTile },
  botanical: { w: 148, h: 190, Tile: BotanicalTile },
  geometric: { w: 100, h: 100, Tile: GeometricTile },
  stripe: { w: 70, h: 120, Tile: StripeTile },
  terrazzo: { w: 160, h: 160, Tile: TerrazzoTile },
  grasscloth: { w: 120, h: 120, Tile: GrassclothTile },
  arabesque: { w: 120, h: 120, Tile: ArabesqueTile },
  herringbone: { w: 48, h: 48, Tile: HerringboneTile },
  marble: { w: 200, h: 200, Tile: MarbleTile },
  trellis: { w: 80, h: 80, Tile: TrellisTile },
  moire: { w: 140, h: 140, Tile: MoireTile },
  ashlar: { w: 160, h: 76, Tile: AshlarTile },
};

/* --------------------------------------------------------------- surface */

export function WallpaperSwatch({
  spec,
  seed,
  className = "",
  style,
  /** Adds a raking-light gradient so the panel reads as a lit wall. */
  lit = true,
  priority = false,
}: {
  spec: SwatchSpec;
  seed: string;
  className?: string;
  style?: CSSProperties;
  lit?: boolean;
  priority?: boolean;
}) {
  const { kind, palette, scale = 1 } = spec;
  const { w, h, Tile } = TILES[kind];
  const r = makeNoise(hashString(seed + kind));
  const id = `wk-${kind}-${hashString(seed + kind).toString(36)}`;
  const tw = w * scale;
  const th = h * scale;

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 480 600"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${kind} pattern swatch`}
      // Swatches above the fold should not wait on lazy decoding.
      data-priority={priority ? "" : undefined}
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={tw}
          height={th}
          patternTransform={`scale(${scale})`}
        >
          <rect width={w} height={h} fill={palette[0]} />
          <Tile p={palette} r={r} />
        </pattern>

        <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0.45" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
        </linearGradient>

        <radialGradient id={`${id}-vig`} cx="50%" cy="38%" r="78%">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </radialGradient>
      </defs>

      <rect width="480" height="600" fill={palette[0]} />
      <rect width="480" height="600" fill={`url(#${id})`} />
      {lit && (
        <>
          <rect width="480" height="600" fill={`url(#${id}-lit)`} />
          <rect width="480" height="600" fill={`url(#${id}-vig)`} />
        </>
      )}
    </svg>
  );
}
