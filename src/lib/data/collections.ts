import type { SwatchSpec } from "@/components/art/WallpaperSwatch";

/**
 * THE CATALOGUE.
 *
 * This file is the one your team edits. Everything on the site — the
 * collections grid, the filters, design-number search, New Arrivals, related
 * ranges, the sitemap and every collection page — is generated from this array.
 *
 * To add a collection: copy any block below, change the values, save.
 * `slug` must be unique and URL-safe; it becomes /collections/<slug>.
 * `brand` must match a `slug` in brands.ts.
 *
 * When the admin panel lands (phase 2) this array is replaced by a database
 * read with the identical shape, so nothing downstream changes.
 */

export const STYLES = [
  "Damask",
  "Floral & Botanical",
  "Geometric",
  "Stripe",
  "Texture & Plain",
  "Mural",
  "Abstract",
  "Heritage",
  "Kids",
] as const;

export const COLOURS = [
  "Neutral",
  "White & Cream",
  "Grey",
  "Blue",
  "Green",
  "Gold & Brass",
  "Black",
  "Terracotta",
  "Pink",
  "Multi",
] as const;

export const TEXTURES = [
  "Embossed",
  "Grasscloth",
  "Silk Effect",
  "Metallic",
  "Matte",
  "Concrete",
  "Vinyl",
  "Handmade",
  "Flock",
] as const;

export const APPLICATIONS = [
  "Residential",
  "Commercial",
  "Hospitality",
  "Healthcare",
  "Retail",
  "Institutional",
  "Luxury Projects",
] as const;

export const TAGS = ["new", "trending", "best-seller", "limited", "featured"] as const;

export type Style = (typeof STYLES)[number];
export type Colour = (typeof COLOURS)[number];
export type Texture = (typeof TEXTURES)[number];
export type Application = (typeof APPLICATIONS)[number];
export type Tag = (typeof TAGS)[number];
export type Stock = "in" | "limited" | "out";

export type Colourway = {
  name: string;
  designNo: string;
  art: SwatchSpec;
  stock: Stock;
};

export type Collection = {
  slug: string;
  name: string;
  brand: string;
  summary: string;
  story: string[];
  styles: Style[];
  colours: Colour[];
  textures: Texture[];
  applications: Application[];
  tags: Tag[];
  colourways: Colourway[];
  spec: {
    rollWidthCm: number;
    rollLengthM: number;
    /** Pattern repeat in cm; 0 = free match. */
    repeatCm: number;
    match: "Straight" | "Offset" | "Free" | "Reverse";
    substrate: string;
    washability: string;
    fireRating?: string;
  };
  /** ISO date the range landed. Drives "Recently added" ordering. */
  addedOn: string;
  /** Optional PDF placed in /public/catalogues. */
  catalogue?: string;
  /** Indicative price band, 1 (accessible) → 4 (luxury). */
  band: 1 | 2 | 3 | 4;
};

export const collections: Collection[] = [
  {
    slug: "onyx",
    name: "Onyx",
    brand: "zambaiti-parati",
    summary: "Deep stone veining in silk-effect ink, finished with a raking metallic pass.",
    story: [
      "Onyx takes the cross-section of a cut stone slab and stretches it to wall height. The veining is printed in four passes, and only one of them is metallic — which is what gives the surface its depth as you walk past it.",
      "It was built for the wall you see first: lift lobbies, headboard walls, the long side of a dining room. At 70cm width with a free match, big uninterrupted runs go up faster than the drop size suggests.",
    ],
    styles: ["Abstract", "Texture & Plain"],
    colours: ["Black", "Gold & Brass", "Grey"],
    textures: ["Metallic", "Silk Effect", "Embossed"],
    applications: ["Luxury Projects", "Hospitality", "Residential"],
    tags: ["featured", "best-seller"],
    colourways: [
      { name: "Nero Oro", designNo: "7914-05", stock: "in", art: { kind: "marble", palette: ["#0d0f13", "#c9a55e", "#2b3038", "#efe2c0"], scale: 1 } },
      { name: "Grigio", designNo: "7914-11", stock: "in", art: { kind: "marble", palette: ["#2a2e34", "#b9bec6", "#4a505a", "#e6e8ec"], scale: 1 } },
      { name: "Avorio", designNo: "7914-02", stock: "limited", art: { kind: "marble", palette: ["#efe9dd", "#a8916a", "#cfc4ad", "#7a6c52"], scale: 1 } },
    ],
    spec: { rollWidthCm: 70, rollLengthM: 10.05, repeatCm: 0, match: "Free", substrate: "Non-woven, heavy vinyl face", washability: "Scrubbable", fireRating: "EN 13501-1 · B-s1,d0" },
    addedOn: "2026-06-18",
    band: 4,
  },
  {
    slug: "lohas",
    name: "Lohas",
    brand: "sangetsu",
    summary: "Japanese functional plains — anti-bacterial, moisture-regulating, quietly textured.",
    story: [
      "Lohas is the range we reach for when a wall has to perform. The surface is anti-bacterial and scratch resistant, and the substrate actively regulates moisture — which matters more in Hyderabad than most specifications admit.",
      "Visually it does almost nothing, and that is the point. A fine woven texture in fourteen greys, sands and off-whites, designed to sit behind furniture and art rather than compete with them.",
    ],
    styles: ["Texture & Plain"],
    colours: ["Neutral", "White & Cream", "Grey"],
    textures: ["Matte", "Vinyl", "Embossed"],
    applications: ["Healthcare", "Hospitality", "Commercial", "Institutional", "Residential"],
    tags: ["best-seller", "featured"],
    colourways: [
      { name: "Shiro", designNo: "RE-5312", stock: "in", art: { kind: "grasscloth", palette: ["#f3f0ea", "#c8c2b6", "#e0dad0", "#9d968a"], scale: 1.1 } },
      { name: "Suna", designNo: "RE-5318", stock: "in", art: { kind: "grasscloth", palette: ["#e9e2d5", "#b5a893", "#d1c8b7", "#8a7f6b"], scale: 1.1 } },
      { name: "Hai", designNo: "RE-5324", stock: "in", art: { kind: "grasscloth", palette: ["#dcdcda", "#a3a5a3", "#c4c5c3", "#7b7d7b"], scale: 1.1 } },
    ],
    spec: { rollWidthCm: 92, rollLengthM: 50, repeatCm: 0, match: "Free", substrate: "Vinyl on non-woven, anti-bacterial", washability: "Washable, scrub resistant", fireRating: "JIS A 1322 · Class 1" },
    addedOn: "2026-05-02",
    band: 3,
  },
  {
    slug: "belvedere",
    name: "Belvedere",
    brand: "emiliana-parati",
    summary: "A classical Italian damask redrawn at architectural scale.",
    story: [
      "The source document is a 19th-century Italian silk damask. Emiliana Parati kept the drawing and doubled the repeat, so one motif now reads across a whole panel instead of tiling into wallpaper noise.",
      "Printed on heavy non-woven with relief on the motif alone. In the deep colourways it reads almost like a fabric panel; in Avorio it disappears into the wall until the light moves.",
    ],
    styles: ["Damask", "Heritage"],
    colours: ["Gold & Brass", "White & Cream", "Black"],
    textures: ["Embossed", "Silk Effect"],
    applications: ["Hospitality", "Luxury Projects", "Residential"],
    tags: ["trending"],
    colourways: [
      { name: "Oro Antico", designNo: "7351-31", stock: "in", art: { kind: "damask", palette: ["#241d15", "#c8a253", "#6b573a", "#f0e2c4"], scale: 1 } },
      { name: "Avorio", designNo: "7351-02", stock: "in", art: { kind: "damask", palette: ["#e9ebe8", "#c0c4c1", "#d6d9d5", "#989e9a"], scale: 1 } },
      { name: "Bordeaux", designNo: "7351-44", stock: "limited", art: { kind: "damask", palette: ["#3a1418", "#a35a55", "#6a2a2c", "#e2c9a5"], scale: 1 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 64, match: "Offset", substrate: "Non-woven, embossed vinyl", washability: "Washable" },
    addedOn: "2026-03-14",
    band: 3,
  },
  {
    slug: "kinari",
    name: "Kinari",
    brand: "bn-international",
    summary: "Undyed linen weave, scanned and printed one-to-one.",
    story: [
      "Kinari is a straight reproduction of raw, undyed linen — slubs, irregularities and all — captured at full scale so the weave lands life-size on the wall.",
      "It is our most-specified texture for apartments, because it gives a room the warmth of a fabric wall without the cost, the seams, or the dust.",
    ],
    styles: ["Texture & Plain"],
    colours: ["Neutral", "White & Cream", "Blue"],
    textures: ["Grasscloth", "Matte"],
    applications: ["Residential", "Hospitality", "Retail"],
    tags: ["best-seller"],
    colourways: [
      { name: "Natural", designNo: "BN-4820", stock: "in", art: { kind: "grasscloth", palette: ["#eee7d9", "#bdae94", "#d8cfba", "#948665"], scale: 1 } },
      { name: "Ash", designNo: "BN-4823", stock: "in", art: { kind: "grasscloth", palette: ["#e2e0db", "#a9a69d", "#c7c4bd", "#807d74"], scale: 1 } },
      { name: "Indigo", designNo: "BN-4829", stock: "in", art: { kind: "grasscloth", palette: ["#20303f", "#5c7c95", "#33495c", "#93aec3"], scale: 1 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 0, match: "Free", substrate: "Non-woven", washability: "Spongeable" },
    addedOn: "2026-01-22",
    band: 2,
  },
  {
    slug: "hortus",
    name: "Hortus",
    brand: "rasch",
    summary: "A hand-painted garden study, printed with every brush mark intact.",
    story: [
      "Rasch commissioned the original as a two-metre gouache painting. Nothing was vectorised — the scan keeps every brush edge, so at close range you can read the direction of the strokes.",
      "The repeat is long and deliberately irregular, which is what stops a botanical from looking like gift wrap across a large wall.",
    ],
    styles: ["Floral & Botanical"],
    colours: ["Green", "White & Cream", "Multi"],
    textures: ["Matte", "Handmade"],
    applications: ["Residential", "Hospitality", "Retail"],
    tags: ["new", "trending"],
    colourways: [
      { name: "Verdant", designNo: "1092-14", stock: "in", art: { kind: "botanical", palette: ["#f2eee2", "#3d5f45", "#8ba57c", "#c68a3c"], scale: 1 } },
      { name: "Nocturne", designNo: "1092-27", stock: "in", art: { kind: "botanical", palette: ["#131a1c", "#4d7a63", "#26403a", "#d0b06a"], scale: 1 } },
      { name: "Blush", designNo: "1092-08", stock: "limited", art: { kind: "botanical", palette: ["#f7ece8", "#a9635d", "#dcae9f", "#8a9a7c"], scale: 1 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 96, match: "Straight", substrate: "Non-woven", washability: "Spongeable" },
    addedOn: "2026-07-08",
    band: 3,
  },
  {
    slug: "meridian",
    name: "Meridian",
    brand: "as-creation",
    summary: "A fine hexagonal lattice in matte ink with a accent keyline.",
    story: [
      "Meridian is geometry at the scale that actually works in Indian homes — a 60mm hexagon rather than the oversized graphics that overwhelm a 3.2 metre wall.",
      "The keyline is printed in a low-lustre accent that only reads from an angle, so the pattern shifts between graphic and near-plain as you move through the room.",
    ],
    styles: ["Geometric"],
    colours: ["Blue", "Gold & Brass", "Neutral"],
    textures: ["Matte", "Metallic"],
    applications: ["Residential", "Commercial", "Retail"],
    tags: ["trending"],
    colourways: [
      { name: "Deep Sea", designNo: "3821-19", stock: "in", art: { kind: "geometric", palette: ["#152430", "#c9a75e", "#2f4a5c", "#dfe7ec"], scale: 1 } },
      { name: "Bone", designNo: "3821-02", stock: "in", art: { kind: "geometric", palette: ["#f2ece1", "#b18f52", "#cfc3ac", "#8b8272"], scale: 1 } },
      { name: "Slate", designNo: "3821-24", stock: "in", art: { kind: "geometric", palette: ["#282c31", "#9aa3ab", "#454b52", "#d7dbdf"], scale: 1 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 32, match: "Offset", substrate: "Non-woven", washability: "Washable" },
    addedOn: "2026-04-11",
    band: 2,
  },
  {
    slug: "regatta",
    name: "Regatta",
    brand: "york-wallcoverings",
    summary: "An uneven hand-drawn stripe, the way a painted wall actually looks.",
    story: [
      "A stripe is the hardest thing to get right, because a perfect one looks printed. Regatta's edges wobble by a millimetre or two and the ink density varies down the drop, which reads as brushwork rather than machinery.",
      "Six widths in the repeat, from a 4mm pinstripe to a 90mm band. It is the range we recommend for raising a low ceiling without resorting to a bold pattern.",
    ],
    styles: ["Stripe", "Heritage"],
    colours: ["Blue", "White & Cream", "Green"],
    textures: ["Matte"],
    applications: ["Residential", "Hospitality", "Retail"],
    tags: ["best-seller"],
    colourways: [
      { name: "Harbour", designNo: "SR-1140", stock: "in", art: { kind: "stripe", palette: ["#f2efe6", "#2e4c63", "#93aabb", "#c3b48c"], scale: 1.1 } },
      { name: "Olive", designNo: "SR-1146", stock: "in", art: { kind: "stripe", palette: ["#f0efe3", "#54613c", "#9aa77c", "#c8b98d"], scale: 1.1 } },
      { name: "Ink", designNo: "SR-1152", stock: "out", art: { kind: "stripe", palette: ["#eeece6", "#22262c", "#7d838b", "#b6b2a6"], scale: 1.1 } },
    ],
    spec: { rollWidthCm: 68.6, rollLengthM: 8.2, repeatCm: 0, match: "Straight", substrate: "Paper-backed vinyl", washability: "Scrubbable" },
    addedOn: "2025-11-30",
    band: 2,
  },
  {
    slug: "sanctum",
    name: "Sanctum",
    brand: "sirpi",
    summary: "Mica-ground plaster effect with a fine crushed-shell shimmer.",
    story: [
      "Sanctum starts with a mica-coated ground, over which a lime plaster texture is printed in three tonal passes. The shimmer is in the ground rather than the ink, so it never looks glittery — it simply changes temperature across the day.",
      "Specified extensively in hospitality: the mottling hides the small knocks a corridor takes, and the surface wipes clean.",
    ],
    styles: ["Texture & Plain", "Abstract"],
    colours: ["Neutral", "Gold & Brass", "Grey"],
    textures: ["Metallic", "Concrete", "Embossed"],
    applications: ["Hospitality", "Luxury Projects", "Commercial", "Retail"],
    tags: ["featured", "new"],
    colourways: [
      { name: "Travertine", designNo: "SP-6602", stock: "in", art: { kind: "marble", palette: ["#d9dde1", "#9aa3ac", "#bfc5cc", "#727b85"], scale: 1.2 } },
      { name: "Bronze", designNo: "SP-6608", stock: "in", art: { kind: "marble", palette: ["#2a231a", "#b98d4c", "#4a3e2c", "#e3cfa4"], scale: 1.2 } },
      { name: "Pewter", designNo: "SP-6614", stock: "in", art: { kind: "marble", palette: ["#33373c", "#9fa6ad", "#4d545b", "#d5dade"], scale: 1.2 } },
    ],
    spec: { rollWidthCm: 70, rollLengthM: 10.05, repeatCm: 0, match: "Free", substrate: "Non-woven, mica ground", washability: "Scrubbable", fireRating: "EN 13501-1 · B-s1,d0" },
    addedOn: "2026-07-21",
    band: 4,
  },
  {
    slug: "atrium",
    name: "Atrium",
    brand: "collins-company",
    summary: "Type II contract vinyl engineered for corridors that never rest.",
    story: [
      "Atrium is a specification product first and a design second. Type II weight, Class A fire rating, mould and mildew resistant, and tested to take an impact from a service trolley without showing it.",
      "The face carries a subtle broken-linen texture in eighteen colours, chosen to coordinate with the neutral palettes most hotel and hospital schemes are built on.",
    ],
    styles: ["Texture & Plain"],
    colours: ["Neutral", "Grey", "Green", "Blue"],
    textures: ["Vinyl", "Embossed", "Matte"],
    applications: ["Healthcare", "Hospitality", "Institutional", "Commercial", "Retail"],
    tags: ["best-seller"],
    colourways: [
      { name: "Limestone", designNo: "CC-2210", stock: "in", art: { kind: "grasscloth", palette: ["#e8e4da", "#b0aa9c", "#cbc6ba", "#8b8578"], scale: 1.15 } },
      { name: "Fern", designNo: "CC-2234", stock: "in", art: { kind: "grasscloth", palette: ["#dfe3d8", "#8b9a80", "#b6bfab", "#67735c"], scale: 1.15 } },
      { name: "Graphite", designNo: "CC-2248", stock: "in", art: { kind: "grasscloth", palette: ["#3a3e42", "#8b9198", "#54595e", "#c0c5ca"], scale: 1.15 } },
    ],
    spec: { rollWidthCm: 137, rollLengthM: 27.4, repeatCm: 0, match: "Free", substrate: "Type II vinyl, Osnaburg backing", washability: "Scrubbable, bleach cleanable", fireRating: "ASTM E84 · Class A" },
    addedOn: "2025-09-15",
    band: 3,
  },
  {
    slug: "cinta",
    name: "Cinta",
    brand: "grandeco",
    summary: "Soft-focus botanicals with a coordinating plain in every colourway.",
    story: [
      "Cinta was drawn as a scheme rather than a pattern: every botanical ships with a texture plain mixed from the same three inks, so feature wall and surround are guaranteed to sit together.",
      "The drawing is deliberately out of focus at the edges, which lets it sit behind a headboard without fighting the bedding.",
    ],
    styles: ["Floral & Botanical", "Texture & Plain"],
    colours: ["Green", "Pink", "Neutral"],
    textures: ["Matte", "Embossed"],
    applications: ["Residential", "Hospitality"],
    tags: ["new"],
    colourways: [
      { name: "Sage", designNo: "GR-5501", stock: "in", art: { kind: "botanical", palette: ["#eef0e8", "#6f8a6c", "#a8bda1", "#c9b585"], scale: 1.05 } },
      { name: "Rosewater", designNo: "GR-5507", stock: "in", art: { kind: "botanical", palette: ["#f7edea", "#b5807c", "#dcbcb3", "#93a186"], scale: 1.05 } },
      { name: "Clay", designNo: "GR-5512", stock: "in", art: { kind: "botanical", palette: ["#f0e6da", "#9c6844", "#c9a382", "#7d8468"], scale: 1.05 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 53, match: "Straight", substrate: "Non-woven", washability: "Washable" },
    addedOn: "2026-06-29",
    band: 2,
  },
  {
    slug: "shibui",
    name: "Shibui",
    brand: "sangetsu",
    summary: "Raked plaster in the Japanese manner — one gesture, repeated.",
    story: [
      "A single trowel sweep, captured and repeated so precisely that the joins are invisible. Shibui is what you specify when a wall should read as a material rather than a finish.",
      "Wide-width and free match, which makes it unusually economical to install across large uninterrupted planes.",
    ],
    styles: ["Texture & Plain", "Abstract"],
    colours: ["Neutral", "White & Cream", "Grey"],
    textures: ["Concrete", "Matte"],
    applications: ["Commercial", "Luxury Projects", "Residential", "Retail"],
    tags: ["trending"],
    colourways: [
      { name: "Kaolin", designNo: "SG-8801", stock: "in", art: { kind: "marble", palette: ["#f0ece4", "#c6bfb2", "#ddd7cc", "#a09a8d"], scale: 1.4 } },
      { name: "Smoke", designNo: "SG-8806", stock: "in", art: { kind: "marble", palette: ["#4a4d51", "#9ba0a5", "#5f6469", "#c8cdd2"], scale: 1.4 } },
      { name: "Charcoal", designNo: "SG-8811", stock: "limited", art: { kind: "marble", palette: ["#1e2124", "#6b7076", "#2e3236", "#a7adb3"], scale: 1.4 } },
    ],
    spec: { rollWidthCm: 92, rollLengthM: 50, repeatCm: 0, match: "Free", substrate: "Vinyl on non-woven", washability: "Washable", fireRating: "JIS A 1322 · Class 1" },
    addedOn: "2026-02-19",
    band: 3,
  },
  {
    slug: "arcadia",
    name: "Arcadia",
    brand: "wallquest",
    summary: "An 1840s American document, reissued at its original scale and colour.",
    story: [
      "Wallquest pulled the original block-printed document from its archive and matched the colours to the least-faded corner of the surviving fragment, rather than to how the sheet looks today.",
      "The result is louder than most people expect a heritage paper to be — which is exactly how these rooms were meant to look.",
    ],
    styles: ["Heritage", "Floral & Botanical"],
    colours: ["Terracotta", "Green", "Gold & Brass"],
    textures: ["Matte", "Handmade"],
    applications: ["Residential", "Hospitality", "Luxury Projects"],
    tags: ["featured"],
    colourways: [
      { name: "Madder", designNo: "WQ-3302", stock: "in", art: { kind: "arabesque", palette: ["#f3e9da", "#a8503a", "#cf9a6d", "#5c6b4a"], scale: 1 } },
      { name: "Verdigris", designNo: "WQ-3308", stock: "in", art: { kind: "arabesque", palette: ["#eef0e6", "#4a7a68", "#93b3a3", "#c2a468"], scale: 1 } },
      { name: "Document", designNo: "WQ-3311", stock: "limited", art: { kind: "arabesque", palette: ["#efe6d2", "#8c6f42", "#c4ae86", "#6d5a3a"], scale: 1 } },
    ],
    spec: { rollWidthCm: 68.6, rollLengthM: 8.2, repeatCm: 64, match: "Straight", substrate: "Paper-backed", washability: "Spongeable" },
    addedOn: "2025-12-08",
    band: 3,
  },
  {
    slug: "ferro",
    name: "Ferro",
    brand: "ugepa",
    summary: "Oxidised metal and poured concrete, at one-to-one scale.",
    story: [
      "Ferro is the industrial end of the catalogue: rust bloom, cold-rolled steel, board-marked concrete. Everything photographed from real material, nothing simulated.",
      "It works hardest in retail and F&B fit-outs, where a raw surface is wanted but the substrate underneath needs to stay dry and light.",
    ],
    styles: ["Abstract", "Texture & Plain"],
    colours: ["Grey", "Terracotta", "Black"],
    textures: ["Concrete", "Metallic", "Matte"],
    applications: ["Retail", "Commercial", "Hospitality"],
    tags: ["trending"],
    colourways: [
      { name: "Oxide", designNo: "UG-7702", stock: "in", art: { kind: "ashlar", palette: ["#3a2a20", "#a25c33", "#5d4030", "#d9b48a"], scale: 1 } },
      { name: "Board", designNo: "UG-7708", stock: "in", art: { kind: "ashlar", palette: ["#54585c", "#9aa0a6", "#6d7379", "#c3c8cd"], scale: 1 } },
      { name: "Blackened", designNo: "UG-7714", stock: "in", art: { kind: "ashlar", palette: ["#191c1f", "#5a6167", "#2c3135", "#8e959b"], scale: 1 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 64, match: "Offset", substrate: "Vinyl on non-woven", washability: "Scrubbable" },
    addedOn: "2026-05-27",
    band: 2,
  },
  {
    slug: "palazzo",
    name: "Palazzo",
    brand: "marburg",
    summary: "Flock damask with a genuine raised pile.",
    story: [
      "Palazzo is a true flock: the motif carries a short velvet pile that you can feel, applied over a satin ground. It is the oldest trick in wallcovering and still the most effective in a formal room.",
      "Because the pile catches light, the pattern reads dark from one end of a room and pale from the other.",
    ],
    styles: ["Damask", "Heritage"],
    colours: ["Black", "Gold & Brass", "Grey"],
    textures: ["Flock", "Silk Effect", "Embossed"],
    applications: ["Luxury Projects", "Hospitality", "Residential"],
    tags: ["limited"],
    colourways: [
      { name: "Onyx & Gold", designNo: "MB-9104", stock: "limited", art: { kind: "damask", palette: ["#131417", "#bd9a55", "#33363c", "#e8d7ae"], scale: 1.1 } },
      { name: "Pearl", designNo: "MB-9108", stock: "in", art: { kind: "damask", palette: ["#eceae4", "#b8b2a4", "#d5d0c6", "#8d887c"], scale: 1.1 } },
    ],
    spec: { rollWidthCm: 70, rollLengthM: 10.05, repeatCm: 70, match: "Offset", substrate: "Flock on non-woven", washability: "Dry clean only" },
    addedOn: "2025-10-20",
    band: 4,
  },
  {
    slug: "boreal",
    name: "Boreal",
    brand: "casadeco",
    summary: "A forest mural in five panels, printed to order at wall height.",
    story: [
      "Boreal is supplied as a made-to-measure mural rather than a roll. Send us the wall dimensions and it is printed and trimmed to fit, with the horizon set at your eye level rather than the factory's.",
      "The depth comes from three separate atmospheric layers, which keeps the far trees genuinely soft instead of merely blurred.",
    ],
    styles: ["Mural", "Floral & Botanical"],
    colours: ["Green", "Grey", "Blue"],
    textures: ["Matte", "Vinyl"],
    applications: ["Residential", "Hospitality", "Commercial"],
    tags: ["new", "featured"],
    colourways: [
      { name: "Dawn", designNo: "CD-4401", stock: "in", art: { kind: "botanical", palette: ["#e6ecea", "#5e7d74", "#9db6ac", "#c3a97a"], scale: 1.3 } },
      { name: "Dusk", designNo: "CD-4404", stock: "in", art: { kind: "botanical", palette: ["#182226", "#3f6158", "#28403c", "#96a89a"], scale: 1.3 } },
    ],
    spec: { rollWidthCm: 100, rollLengthM: 3, repeatCm: 0, match: "Free", substrate: "Non-woven, made to measure", washability: "Spongeable" },
    addedOn: "2026-07-16",
    band: 4,
  },
  {
    slug: "tessera",
    name: "Tessera",
    brand: "kcc",
    summary: "Terrazzo chip, scaled down to something a room can live with.",
    story: [
      "Most terrazzo wallpapers use chips sized for a floor, which look absurd at eye level. Tessera's aggregate is deliberately fine — 6 to 18mm — so it reads as a considered surface rather than a novelty.",
      "Four grounds, each with its own chip mix. The pale ones are quietly excellent in a kitchen or a utility corridor.",
    ],
    styles: ["Abstract", "Geometric"],
    colours: ["White & Cream", "Neutral", "Multi", "Pink"],
    textures: ["Matte", "Vinyl"],
    applications: ["Residential", "Retail", "Commercial", "Institutional"],
    tags: [],
    colourways: [
      { name: "Chalk", designNo: "KC-1802", stock: "in", art: { kind: "terrazzo", palette: ["#f4f2ec", "#b0a894", "#8d99a3", "#c98f5d"], scale: 0.85 } },
      { name: "Ash", designNo: "KC-1806", stock: "in", art: { kind: "terrazzo", palette: ["#e0dfda", "#8a8d8c", "#5f6265", "#b99a6a"], scale: 0.85 } },
      { name: "Coral", designNo: "KC-1810", stock: "in", art: { kind: "terrazzo", palette: ["#f6ece7", "#c4756a", "#8a9d92", "#3f4348"], scale: 0.85 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 53, match: "Offset", substrate: "Vinyl on non-woven", washability: "Scrubbable" },
    addedOn: "2026-01-09",
    band: 1,
  },
  {
    slug: "nimbus",
    name: "Nimbus",
    brand: "gni",
    summary: "Micro-textured plains in twenty-four disciplined neutrals.",
    story: [
      "Nimbus exists for the ninety percent of a project that is not the feature wall. Twenty-four neutrals, each with a fine sand texture that stops a large plain area from going flat.",
      "Deep stock across the range means a shortfall on site can be covered from Hyderabad the same day.",
    ],
    styles: ["Texture & Plain"],
    colours: ["Neutral", "White & Cream", "Grey"],
    textures: ["Matte", "Embossed"],
    applications: ["Residential", "Commercial", "Institutional", "Healthcare"],
    tags: ["best-seller"],
    colourways: [
      { name: "Linen", designNo: "GN-2201", stock: "in", art: { kind: "grasscloth", palette: ["#e2e5e9", "#b6bcc3", "#ced3d9", "#8f969e"], scale: 1.3 } },
      { name: "Dove", designNo: "GN-2209", stock: "in", art: { kind: "grasscloth", palette: ["#dfe0de", "#b0b2b0", "#c9cbc9", "#8d8f8d"], scale: 1.3 } },
      { name: "Stone", designNo: "GN-2216", stock: "in", art: { kind: "grasscloth", palette: ["#c8cdd3", "#969ea7", "#b1b8bf", "#6f7780"], scale: 1.3 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 0, match: "Free", substrate: "Vinyl on non-woven", washability: "Washable" },
    addedOn: "2025-08-14",
    band: 1,
  },
  {
    slug: "vasanta",
    name: "Vasanta",
    brand: "andre-kim",
    summary: "An arabesque lattice with hand-gilded highlights.",
    story: [
      "Vasanta layers a fine quatrefoil lattice over a satin ground, with the intersections picked out by hand in gold or pewter leaf. The gilding is applied after printing, which is why no two rolls are identical.",
      "Supplied in limited batches. If a project needs quantity, reserve it early — we cannot reorder mid-run.",
    ],
    styles: ["Damask", "Geometric", "Heritage"],
    colours: ["Gold & Brass", "White & Cream", "Blue"],
    textures: ["Handmade", "Metallic", "Silk Effect"],
    applications: ["Luxury Projects", "Hospitality", "Residential"],
    tags: ["limited", "featured"],
    colourways: [
      { name: "Gilt", designNo: "AK-6601", stock: "limited", art: { kind: "arabesque", palette: ["#f5eede", "#b08b3e", "#dcc79a", "#7c6538"], scale: 0.95 } },
      { name: "Midnight", designNo: "AK-6604", stock: "limited", art: { kind: "arabesque", palette: ["#141a26", "#a98d4e", "#2c3648", "#d8cba5"], scale: 0.95 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 53, match: "Straight", substrate: "Non-woven, hand-finished", washability: "Dry clean only" },
    addedOn: "2026-04-30",
    band: 4,
  },
  {
    slug: "kestrel",
    name: "Kestrel",
    brand: "shd",
    summary: "Deep-embossed herringbone with a wool hand.",
    story: [
      "Kestrel's emboss is genuinely deep — close to a millimetre — so the herringbone catches shadow rather than relying on printed contrast. Run your hand across it and it feels like a suit.",
      "Wide width and generous roll length make it one of the better value textures in the catalogue for whole-room application.",
    ],
    styles: ["Geometric", "Texture & Plain"],
    colours: ["Grey", "Neutral", "Blue"],
    textures: ["Embossed", "Vinyl"],
    applications: ["Residential", "Commercial", "Hospitality"],
    tags: [],
    colourways: [
      { name: "Flannel", designNo: "SH-4402", stock: "in", art: { kind: "herringbone", palette: ["#e4e3df", "#9b9d9c", "#bcbebc", "#75787a"], scale: 1.3 } },
      { name: "Camel", designNo: "SH-4408", stock: "in", art: { kind: "herringbone", palette: ["#d4d8dd", "#9ba3ac", "#bcc3ca", "#757d86"], scale: 1.3 } },
      { name: "Navy", designNo: "SH-4414", stock: "in", art: { kind: "herringbone", palette: ["#1d2733", "#54687e", "#2f3d4d", "#93a5b6"], scale: 1.3 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 26.5, match: "Straight", substrate: "Vinyl on non-woven, deep emboss", washability: "Scrubbable" },
    addedOn: "2025-07-11",
    band: 1,
  },
  {
    slug: "aurelia",
    name: "Aurelia",
    brand: "caselio",
    summary: "A fine trellis for nurseries and small rooms.",
    story: [
      "Aurelia keeps its trellis under 50mm so it works in a room where the walls are close — a nursery, a study, a powder room — without the pattern closing in.",
      "Printed in low-VOC water-based inks on a breathable non-woven, which is the practical reason it ends up in children's rooms as often as it does.",
    ],
    styles: ["Geometric", "Kids"],
    colours: ["Pink", "Blue", "White & Cream", "Green"],
    textures: ["Matte"],
    applications: ["Residential"],
    tags: ["new"],
    colourways: [
      { name: "Powder", designNo: "CS-1201", stock: "in", art: { kind: "trellis", palette: ["#fbf2f0", "#d59f9c", "#eecfc9", "#a3b3a4"], scale: 0.9 } },
      { name: "Sky", designNo: "CS-1206", stock: "in", art: { kind: "trellis", palette: ["#eff5f8", "#7ba3bd", "#c2d9e6", "#c4ab7d"], scale: 0.9 } },
      { name: "Meadow", designNo: "CS-1211", stock: "in", art: { kind: "trellis", palette: ["#f1f5ee", "#7d9c76", "#bdd2b6", "#c8b487"], scale: 0.9 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 26.5, match: "Straight", substrate: "Non-woven, low-VOC inks", washability: "Washable" },
    addedOn: "2026-06-05",
    band: 2,
  },
  {
    slug: "corso",
    name: "Corso",
    brand: "erismann",
    summary: "Paintable relief — the texture is yours to colour.",
    story: [
      "Corso ships white. The relief is embossed into a heavy paintable substrate, so the surface takes any emulsion and can be recoated when the scheme changes rather than stripped.",
      "It is the honest answer for rental properties, phased hotel refurbishments, and anyone who intends to change their mind.",
    ],
    styles: ["Texture & Plain", "Geometric"],
    colours: ["White & Cream"],
    textures: ["Embossed", "Matte"],
    applications: ["Residential", "Commercial", "Institutional"],
    tags: [],
    colourways: [
      { name: "Linear", designNo: "ER-3301", stock: "in", art: { kind: "stripe", palette: ["#f6f4f0", "#e2ded6", "#ece8e1", "#d2cdc3"], scale: 1.2 } },
      { name: "Weave", designNo: "ER-3305", stock: "in", art: { kind: "herringbone", palette: ["#f6f4f0", "#e0dcd4", "#ebe7e0", "#d0cbc1"], scale: 1.2 } },
    ],
    spec: { rollWidthCm: 53, rollLengthM: 10.05, repeatCm: 10.6, match: "Offset", substrate: "Paintable heavy relief", washability: "Paint dependent" },
    addedOn: "2025-06-02",
    band: 1,
  },
  {
    slug: "opaline",
    name: "Opaline",
    brand: "did",
    summary: "A moiré watermark that only appears at an angle.",
    story: [
      "Opaline prints concentric moiré rings in a pearlescent ink barely a shade off the ground. Face on, it is a plain. Step aside and the whole wall turns.",
      "It is a good answer for a large hallway where a pattern would be too much but a flat plain would be too little.",
    ],
    styles: ["Abstract", "Texture & Plain"],
    colours: ["White & Cream", "Neutral", "Grey"],
    textures: ["Silk Effect", "Metallic"],
    applications: ["Residential", "Hospitality", "Retail"],
    tags: ["trending"],
    colourways: [
      { name: "Opal", designNo: "DD-7701", stock: "in", art: { kind: "moire", palette: ["#f2efe9", "#dcd5c8", "#e9e4da", "#c5bcab"], scale: 1.2 } },
      { name: "Quartz", designNo: "DD-7705", stock: "in", art: { kind: "moire", palette: ["#e6e7e6", "#c8cac9", "#d8dad9", "#adafae"], scale: 1.2 } },
      { name: "Obsidian", designNo: "DD-7709", stock: "limited", art: { kind: "moire", palette: ["#191b1e", "#3d4247", "#282c30", "#666d74"], scale: 1.2 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 53, match: "Offset", substrate: "Vinyl on non-woven, pearl ink", washability: "Washable" },
    addedOn: "2026-03-02",
    band: 2,
  },
  {
    slug: "hanji",
    name: "Hanji",
    brand: "jeil",
    summary: "Mulberry-paper texture with visible long fibres.",
    story: [
      "Hanji reproduces traditional Korean mulberry paper, fibres and all. The long strands sit at random across the surface, so the eye never finds a repeat even though there is one.",
      "Warm, quiet and unusually forgiving of an imperfect wall beneath it.",
    ],
    styles: ["Texture & Plain"],
    colours: ["White & Cream", "Neutral", "Terracotta"],
    textures: ["Handmade", "Matte", "Grasscloth"],
    applications: ["Residential", "Hospitality", "Retail"],
    tags: [],
    colourways: [
      { name: "Rice", designNo: "JL-5501", stock: "in", art: { kind: "grasscloth", palette: ["#e6e8e5", "#c1c5c2", "#d5d8d4", "#9aa09c"], scale: 0.9 } },
      { name: "Tea", designNo: "JL-5507", stock: "in", art: { kind: "grasscloth", palette: ["#cfd4d0", "#9ba39c", "#b8bfb9", "#77807a"], scale: 0.9 } },
      { name: "Persimmon", designNo: "JL-5512", stock: "in", art: { kind: "grasscloth", palette: ["#eddcca", "#b56a3e", "#d4a880", "#88512c"], scale: 0.9 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 0, match: "Free", substrate: "Vinyl on non-woven", washability: "Spongeable" },
    addedOn: "2025-05-19",
    band: 1,
  },
  {
    slug: "monsoon",
    name: "Monsoon",
    brand: "studio-465",
    summary: "A six-metre ink-wash mural, made for a lobby wall.",
    story: [
      "Monsoon is a single painting six metres wide — a wash of cloud and rain over water — printed across joined panels with no repeat anywhere in it.",
      "Studio 465 supply it as a numbered edition with the panel sequence printed on the reverse, so an installer cannot get the order wrong.",
    ],
    styles: ["Mural", "Abstract"],
    colours: ["Blue", "Grey", "Neutral"],
    textures: ["Matte", "Vinyl"],
    applications: ["Luxury Projects", "Hospitality", "Commercial"],
    tags: ["featured", "limited"],
    colourways: [
      { name: "Storm", designNo: "S465-1101", stock: "limited", art: { kind: "marble", palette: ["#232e38", "#7d95a8", "#3b4a58", "#c4d2dc"], scale: 1.6 } },
      { name: "Mist", designNo: "S465-1104", stock: "in", art: { kind: "marble", palette: ["#e4e9ec", "#a3b2bc", "#c6d0d6", "#7d8b95"], scale: 1.6 } },
    ],
    spec: { rollWidthCm: 100, rollLengthM: 3, repeatCm: 0, match: "Free", substrate: "Non-woven, panelised mural", washability: "Spongeable" },
    addedOn: "2026-02-06",
    band: 4,
  },
  {
    slug: "verano",
    name: "Verano",
    brand: "cosmos",
    summary: "Everyday textures in the colours Indian homes actually buy.",
    story: [
      "Verano is not trying to win a design award. It is a broad, sensibly priced book of textures and light patterns in warm ivories, sands and soft greys — the colours that move fastest across our dealer network.",
      "Where a builder needs four hundred rolls in one shade and needs them this month, this is the range that delivers.",
    ],
    styles: ["Texture & Plain", "Geometric"],
    colours: ["White & Cream", "Neutral", "Grey"],
    textures: ["Vinyl", "Embossed"],
    applications: ["Residential", "Commercial", "Institutional"],
    tags: ["best-seller"],
    colourways: [
      { name: "Ivory", designNo: "CM-9001", stock: "in", art: { kind: "grasscloth", palette: ["#dcdfe3", "#b0b6bd", "#c9ced4", "#8b929a"], scale: 1.2 } },
      { name: "Sand", designNo: "CM-9008", stock: "in", art: { kind: "grasscloth", palette: ["#c6ccd2", "#98a1aa", "#b0b8c0", "#737d87"], scale: 1.2 } },
      { name: "Pebble", designNo: "CM-9015", stock: "in", art: { kind: "grasscloth", palette: ["#d2d6da", "#a3a9b0", "#bcc2c8", "#7d848c"], scale: 1.2 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 0, match: "Free", substrate: "Vinyl on non-woven", washability: "Washable" },
    addedOn: "2025-04-08",
    band: 1,
  },
  {
    slug: "saga",
    name: "Saga",
    brand: "seoul-wallpaper",
    summary: "Broad-brush plains with a linen-press finish.",
    story: [
      "Saga presses a fine linen grain into a matte ground, giving a plain wall just enough surface interest to avoid looking like paint.",
      "Nineteen shades, deliberately overlapping with the neutral ranges from our German and Japanese books so a scheme can mix sources without a visible seam in the palette.",
    ],
    styles: ["Texture & Plain"],
    colours: ["Neutral", "Green", "Grey", "White & Cream"],
    textures: ["Embossed", "Matte"],
    applications: ["Residential", "Commercial", "Hospitality"],
    tags: [],
    colourways: [
      { name: "Oat", designNo: "SW-3301", stock: "in", art: { kind: "stripe", palette: ["#dfe3e7", "#b4bac1", "#cbd1d7", "#8e959d"], scale: 1.4 } },
      { name: "Moss", designNo: "SW-3309", stock: "in", art: { kind: "stripe", palette: ["#e7ebe2", "#8b9b83", "#c0cbb8", "#6a7a63"], scale: 1.4 } },
      { name: "Iron", designNo: "SW-3316", stock: "in", art: { kind: "stripe", palette: ["#3e4247", "#878d93", "#565b61", "#b5bcc2"], scale: 1.4 } },
    ],
    spec: { rollWidthCm: 106, rollLengthM: 15.6, repeatCm: 0, match: "Free", substrate: "Vinyl on non-woven", washability: "Washable" },
    addedOn: "2025-03-25",
    band: 1,
  },
  {
    slug: "ashlar",
    name: "Ashlar",
    brand: "sirpi",
    summary: "Cut-stone coursing, drawn at true building scale.",
    story: [
      "Ashlar reproduces dressed stone blocks at the size a mason would actually cut them, with mortar joints that recede rather than draw attention. Most stone wallpapers fail because the blocks are too small; this one does not.",
      "Used well, it can give a modern apartment wall the weight of a much older building.",
    ],
    styles: ["Heritage", "Abstract"],
    colours: ["Neutral", "Grey", "White & Cream"],
    textures: ["Concrete", "Embossed"],
    applications: ["Residential", "Hospitality", "Retail", "Commercial"],
    tags: [],
    colourways: [
      { name: "Portland", designNo: "SP-4402", stock: "in", art: { kind: "ashlar", palette: ["#e9e3d6", "#b6ad99", "#d1c9b7", "#8d8471"], scale: 1.1 } },
      { name: "Bluestone", designNo: "SP-4407", stock: "in", art: { kind: "ashlar", palette: ["#4c545c", "#8e979f", "#616a72", "#bcc4cb"], scale: 1.1 } },
    ],
    spec: { rollWidthCm: 70, rollLengthM: 10.05, repeatCm: 53, match: "Offset", substrate: "Non-woven, embossed", washability: "Scrubbable" },
    addedOn: "2025-10-02",
    band: 3,
  },
  {
    slug: "cascade",
    name: "Cascade",
    brand: "casadeco",
    summary: "A vertical ombré that pulls the eye upward.",
    story: [
      "Cascade grades from a deep base to a pale ceiling across a single drop, so a standard nine-foot wall gains a good foot of apparent height.",
      "It has to be hung as a set — each roll is printed as a specific position in the gradient — which is noted clearly on every label.",
    ],
    styles: ["Abstract", "Texture & Plain"],
    colours: ["Blue", "Green", "Terracotta"],
    textures: ["Matte", "Silk Effect"],
    applications: ["Residential", "Hospitality", "Retail"],
    tags: ["new"],
    colourways: [
      { name: "Tidal", designNo: "CD-8801", stock: "in", art: { kind: "moire", palette: ["#1e3646", "#7ea3b8", "#345166", "#cfe0e9"], scale: 1.5 } },
      { name: "Canopy", designNo: "CD-8805", stock: "in", art: { kind: "moire", palette: ["#20352a", "#7fa286", "#39543f", "#d3e2cd"], scale: 1.5 } },
    ],
    spec: { rollWidthCm: 70, rollLengthM: 10.05, repeatCm: 0, match: "Free", substrate: "Non-woven, positional print", washability: "Spongeable" },
    addedOn: "2026-07-02",
    band: 3,
  },
];

/* ------------------------------------------------------------------ derived */

export const byNewest = [...collections].sort(
  (a, b) => Date.parse(b.addedOn) - Date.parse(a.addedOn),
);

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function collectionsByBrand(brandSlug: string) {
  return collections.filter((c) => c.brand === brandSlug);
}

export const featured = collections.filter((c) => c.tags.includes("featured"));

/** Every design number in the catalogue, mapped back to its collection. */
export type DesignIndexEntry = {
  designNo: string;
  colourway: string;
  collection: Collection;
  stock: Stock;
};

export const designIndex: DesignIndexEntry[] = collections.flatMap((c) =>
  c.colourways.map((cw) => ({
    designNo: cw.designNo,
    colourway: cw.name,
    collection: c,
    stock: cw.stock,
  })),
);

/** Loose match so "791405", "7914 05" and "7914-05" all find the same paper. */
export function normaliseDesignNo(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function searchDesignNumbers(query: string, limit = 8) {
  const q = normaliseDesignNo(query);
  if (q.length < 2) return [];
  return designIndex
    .filter((entry) => normaliseDesignNo(entry.designNo).includes(q))
    .slice(0, limit);
}

/** Full-text-ish search across names, brands, design numbers and taxonomy. */
export function searchCollections(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return collections;
  const nq = normaliseDesignNo(q);
  return collections.filter((c) => {
    const haystack = [
      c.name,
      c.summary,
      c.brand,
      ...c.styles,
      ...c.colours,
      ...c.textures,
      ...c.applications,
      ...c.colourways.map((cw) => cw.name),
    ]
      .join(" ")
      .toLowerCase();
    if (haystack.includes(q)) return true;
    return c.colourways.some((cw) => normaliseDesignNo(cw.designNo).includes(nq));
  });
}

/** Days since a collection landed — used for the "Recently added" badge. */
export function daysSinceAdded(c: Collection, now = Date.now()) {
  return Math.floor((now - Date.parse(c.addedOn)) / 86_400_000);
}

export const tagLabel: Record<Tag, string> = {
  new: "New",
  trending: "Trending",
  "best-seller": "Best Seller",
  limited: "Limited Stock",
  featured: "Featured",
};

export const stockLabel: Record<Stock, string> = {
  in: "In stock",
  limited: "Limited stock",
  out: "Sold out",
};
