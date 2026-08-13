import type { SwatchSpec } from "@/components/art/WallpaperSwatch";

/**
 * The 25 manufacturers Wall King imports, grouped exactly as they appear in
 * the company's own brand-portfolio brochure.
 *
 * Deliberately no founding years: several of these houses are 150+ years old
 * and a wrong date on a client's public site is worse than no date. Add them
 * to `since` once the partner list is confirmed with each manufacturer.
 */

export type Country =
  | "Germany"
  | "Italy"
  | "Netherlands"
  | "Belgium"
  | "United States"
  | "Japan"
  | "South Korea";

export type Brand = {
  slug: string;
  name: string;
  country: Country;
  /** One-line positioning shown on cards. */
  signature: string;
  /** Longer note for the brand page. */
  note: string;
  since?: number;
  /** Drives the brand card artwork until real logos/photography land. */
  art: SwatchSpec;
};

export const countryOrder: Country[] = [
  "Germany",
  "Italy",
  "Netherlands",
  "Belgium",
  "United States",
  "Japan",
  "South Korea",
];

export const countryNote: Record<Country, string> = {
  Germany: "Engineering-grade non-wovens and the deepest archive libraries in Europe.",
  Italy: "Colour, surface and pattern drawn from the Como and Bergamo textile tradition.",
  Netherlands: "Restrained Dutch design with an eye for texture and tonality.",
  Belgium: "Wall fashion at scale — coordinated ranges built for interior schemes.",
  "United States": "American document archives, wide-width murals and contract vinyls.",
  Japan: "Precision finishes, functional surfaces and quiet, disciplined pattern.",
  "South Korea": "Fast-moving design cycles, embossed textures and exceptional value.",
};

export const brands: Brand[] = [
  {
    slug: "as-creation",
    name: "A.S. Création",
    country: "Germany",
    signature: "Europe's volume leader in non-woven wallcoverings",
    note: "One of the largest wallpaper manufacturers in Europe and a Wall King mainstay. Enormous breadth — plains, textures, florals and licensed design lines — with the consistency and delivery reliability that project work demands.",
    art: { kind: "geometric", palette: ["#1d2b36", "#c9b184", "#5d7183", "#e8dcc4"], scale: 1 },
  },
  {
    slug: "marburg",
    name: "Marburg",
    country: "Germany",
    signature: "Designer collaborations and heavyweight contract ranges",
    note: "A German house known for putting serious design names on the wall and for contract-grade substrates that survive hotel corridors and hospital wings.",
    art: { kind: "damask", palette: ["#2a2119", "#c19a4f", "#6d5a3c", "#efe3ca"], scale: 0.85 },
  },
  {
    slug: "rasch",
    name: "Rasch",
    country: "Germany",
    signature: "A design archive stretching back to the 19th century",
    note: "Rasch pairs a genuinely historic pattern archive with a modern textile hand. Strong on statement florals, graphic repeats and its long-running designer editions.",
    art: { kind: "botanical", palette: ["#f2ece0", "#3f5a45", "#8ba17e", "#c8873f"], scale: 0.9 },
  },
  {
    slug: "caselio",
    name: "Caselio",
    country: "Germany",
    signature: "Light, contemporary pattern for residential schemes",
    note: "Fresh, liveable design — botanical motifs, soft geometrics and a colour sense that suits Indian daylight. A favourite for bedrooms, nurseries and apartment interiors.",
    art: { kind: "trellis", palette: ["#faf5ec", "#b98f5a", "#dfc9a4", "#7d9384"], scale: 1 },
  },
  {
    slug: "casadeco",
    name: "Casadeco",
    country: "Germany",
    signature: "Coordinated wallpaper and fabric schemes",
    note: "Ranges designed to be specified as a whole room rather than a single wall, with wallpapers that sit alongside matching drapery and upholstery.",
    art: { kind: "arabesque", palette: ["#1c2a2e", "#b6c9c4", "#4f6d70", "#d9b877"], scale: 0.9 },
  },
  {
    slug: "erismann",
    name: "Erismann",
    country: "Germany",
    signature: "Paintable textures and dependable everyday ranges",
    note: "A long-established German mill with deep strength in embossed, paintable and washable surfaces — the practical end of the German catalogue.",
    art: { kind: "grasscloth", palette: ["#efe9df", "#a8987f", "#cdc0aa", "#7c705d"], scale: 1 },
  },
  {
    slug: "ugepa",
    name: "Ugépa",
    country: "Germany",
    signature: "Trend-led vinyls with a strong graphic hand",
    note: "Quick to read a trend and quick to bring it to market. Bold geometrics, concrete and metallic effects, and murals that suit commercial fit-outs.",
    art: { kind: "herringbone", palette: ["#22262b", "#8d9aa4", "#4b545c", "#c5a86e"], scale: 1.1 },
  },

  {
    slug: "sirpi",
    name: "Sirpi",
    country: "Italy",
    signature: "Italian surface design with real depth of finish",
    note: "Sirpi's strength is the surface itself — layered inks, mica grounds and embossing that give a wall genuine relief under raking light.",
    art: { kind: "moire", palette: ["#171a1f", "#c8a44e", "#5a4f3b", "#efe0bd"], scale: 1 },
  },
  {
    slug: "emiliana-parati",
    name: "Emiliana Parati",
    country: "Italy",
    signature: "Classical Italian pattern, modern colour",
    note: "Damasks, medallions and architectural motifs reworked in contemporary palettes. A natural fit for hospitality and formal residential interiors.",
    art: { kind: "damask", palette: ["#f4efe4", "#8f2f2f", "#c9a05e", "#3d3226"], scale: 1 },
  },
  {
    slug: "zambaiti-parati",
    name: "Zambaiti Parati",
    country: "Italy",
    signature: "Luxury textiles translated to the wall",
    note: "Silk-effect grounds, heavy embossing and metallic detailing from one of Italy's best-known wallcovering names. Where a scheme calls for opulence, this is the book to open.",
    art: { kind: "damask", palette: ["#1a1d2b", "#b99a5d", "#3c4055", "#e6d6ae"], scale: 1.15 },
  },

  {
    slug: "bn-international",
    name: "B.N. International",
    country: "Netherlands",
    signature: "Dutch restraint, exceptional texture",
    note: "Quietly confident ranges built around material honesty — linen weaves, plasters, stone and fine plains that finish a room without shouting.",
    art: { kind: "grasscloth", palette: ["#e7e3da", "#8a8375", "#b6ae9d", "#5e594d"], scale: 1.1 },
  },

  {
    slug: "grandeco",
    name: "Grandeco",
    country: "Belgium",
    signature: "Wall fashion, designed as complete schemes",
    note: "Belgian design house producing coordinated collections where every paper in the book is intended to work with the others — efficient for large residential and hospitality specification.",
    art: { kind: "botanical", palette: ["#101a18", "#5f8f74", "#2c463c", "#d8c48a"], scale: 1 },
  },

  {
    slug: "wallquest",
    name: "Wallquest",
    country: "United States",
    signature: "American document archives and heritage revivals",
    note: "Historic American pattern documents reissued at proper scale and colour, alongside contemporary grasscloths and wide-width work.",
    art: { kind: "arabesque", palette: ["#f6f1e6", "#33566a", "#9db6c2", "#bf9243"], scale: 1.05 },
  },
  {
    slug: "york-wallcoverings",
    name: "York Wallcoverings",
    country: "United States",
    signature: "America's oldest wallpaper mill",
    note: "A vast library spanning traditional documents, designer collaborations and commercial Type II vinyls — one of the most complete single-source catalogues we carry.",
    art: { kind: "stripe", palette: ["#f3ede1", "#2f4858", "#c0a26a", "#8ba0ad"], scale: 1.1 },
  },
  {
    slug: "studio-465",
    name: "Studio 465",
    country: "United States",
    signature: "Contemporary murals and oversized artwork",
    note: "Large-scale, art-led wall panels for feature walls, lobbies and reception spaces where the wall is meant to be the first thing you see.",
    art: { kind: "marble", palette: ["#12151a", "#c7ab72", "#3b4652", "#e9e0cb"], scale: 1 },
  },
  {
    slug: "collins-company",
    name: "Collins & Company",
    country: "United States",
    signature: "Contract-grade commercial wallcoverings",
    note: "Built for the specification sheet: heavy-duty vinyls, acoustic and digitally printed surfaces engineered for hospitality and corporate contract use.",
    art: { kind: "ashlar", palette: ["#1e2227", "#7d858e", "#3a4149", "#b39a6b"], scale: 1 },
  },

  {
    slug: "sangetsu",
    name: "Sangetsu",
    country: "Japan",
    signature: "Japanese precision and functional surfaces",
    note: "Sangetsu's catalogue is engineering as much as design — anti-bacterial, scratch-resistant, moisture-controlling and fire-retardant surfaces, finished to a standard that is genuinely hard to match.",
    art: { kind: "moire", palette: ["#eeeae2", "#9a9689", "#c4bfb2", "#5c5a51"], scale: 1.2 },
  },

  {
    slug: "shd",
    name: "SHD Wallcoverings",
    country: "South Korea",
    signature: "Deep-embossed textures at pace",
    note: "Korean manufacturing at its most productive — heavily textured, wide-width papers with rapid design turnover and reliable stock depth.",
    art: { kind: "herringbone", palette: ["#f0ece3", "#a08f74", "#cdc2ab", "#6b6252"], scale: 1.2 },
  },
  {
    slug: "kcc",
    name: "KCC",
    country: "South Korea",
    signature: "Industrial-scale quality and technical substrates",
    note: "Part of one of Korea's major materials groups, with the technical backing that brings — consistent batches, tested substrates and dependable supply.",
    art: { kind: "geometric", palette: ["#161b21", "#4c6b82", "#2a3743", "#c2cdd6"], scale: 1.1 },
  },
  {
    slug: "cosmos",
    name: "Cosmos",
    country: "South Korea",
    signature: "Everyday ranges with exceptional value",
    note: "The workhorse of many Indian residential projects: broad plain and texture ranges, sensible pricing and colours chosen for the local market.",
    art: { kind: "grasscloth", palette: ["#f4efe5", "#b0a289", "#d5cab4", "#7f7461"], scale: 0.95 },
  },
  {
    slug: "did",
    name: "DID",
    country: "South Korea",
    signature: "Contemporary residential pattern",
    note: "Modern, apartment-scale design — soft geometrics, subtle metallics and textures that photograph well in compact rooms.",
    art: { kind: "trellis", palette: ["#1b1f24", "#c9a86c", "#39424c", "#e4dcc9"], scale: 1.1 },
  },
  {
    slug: "andre-kim",
    name: "Andre Kim",
    country: "South Korea",
    signature: "A designer signature range",
    note: "Carrying the name of one of Korea's most celebrated designers — decorative, occasion-led papers for interiors that want a point of view.",
    art: { kind: "damask", palette: ["#f7f2e6", "#2f3a4a", "#b99553", "#8d99a8"], scale: 0.95 },
  },
  {
    slug: "seoul-wallpaper",
    name: "Seoul Wallpaper",
    country: "South Korea",
    signature: "Broad residential catalogue, quick to stock",
    note: "A dependable, wide-ranging book covering plains, textures and light pattern — one of our fastest-moving Korean sources.",
    art: { kind: "stripe", palette: ["#eef0ec", "#5c6f5f", "#9aab97", "#c6b183"], scale: 0.9 },
  },
  {
    slug: "jeil",
    name: "JEIL Wallpaper",
    country: "South Korea",
    signature: "Design for living — practical, liveable ranges",
    note: "Focused squarely on the home: warm neutrals, workable textures and wipeable surfaces built for family interiors.",
    art: { kind: "terrazzo", palette: ["#f3efe6", "#c58b3f", "#7f8b7a", "#3a3a35"], scale: 0.85 },
  },
  {
    slug: "gni",
    name: "GNI",
    country: "South Korea",
    signature: "Textured plains and modern neutrals",
    note: "Where a scheme needs a wall to recede rather than perform — refined plains, micro-textures and stone effects in a disciplined neutral palette.",
    art: { kind: "marble", palette: ["#eae6dd", "#a49b8b", "#cbc3b4", "#6d6558"], scale: 1.1 },
  },
];

export const brandsByCountry = countryOrder.map((country) => ({
  country,
  note: countryNote[country],
  brands: brands.filter((b) => b.country === country),
}));

export function getBrand(slug: string) {
  return brands.find((b) => b.slug === slug);
}

export const brandNames = brands.map((b) => b.name);
