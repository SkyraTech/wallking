import type { SwatchSpec } from "@/components/art/WallpaperSwatch";

/**
 * The Journal — Wall King's design centre.
 *
 * Written to be genuinely useful to the people who specify wallpaper, which
 * is also what earns the search rankings. Add posts by copying a block.
 * Body is an array of blocks so the renderer stays simple and typed.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  dek: string;
  category: "Trends" | "Ideas" | "Specification" | "Care" | "Projects";
  date: string;
  readingMinutes: number;
  author: string;
  art: SwatchSpec;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "wallpaper-trends-2026",
    title: "The 2026 wallpaper trends worth acting on",
    dek: "Five directions we are seeing across European and Asian launches this season — and the two we would not specify for an Indian project.",
    category: "Trends",
    date: "2026-07-24",
    readingMinutes: 7,
    author: "Wall King Design Desk",
    art: { kind: "botanical", palette: ["#f2eee2", "#3d5f45", "#8ba57c", "#c68a3c"], scale: 1 },
    body: [
      { type: "p", text: "Every January the European mills publish and every March we sit in Frankfurt and Milan deciding what actually travels. Trend forecasting is easy; knowing what survives a Hyderabad summer and a client's fifteen-year horizon is the harder part. Here is where 2026 landed." },
      { type: "h", text: "1. Plaster is the new plain" },
      { type: "p", text: "The flat plain is finally on the way out. What is replacing it is not pattern but surface — lime plaster, raked stucco, mineral wash. The appeal is obvious: it gives a wall depth without committing a room to a motif, and it photographs beautifully in the raking light most Indian apartments get in the late afternoon." },
      { type: "p", text: "Specify it where you have a large uninterrupted plane and good side light. Avoid it in a corridor lit only from above, where the texture flattens out and you have paid for something nobody can see." },
      { type: "h", text: "2. Botanicals have grown up" },
      { type: "p", text: "The tropical leaf print that dominated 2019 has finally exhausted itself. What has taken its place is looser and more painterly — gouache studies, herbarium plates, single-stem repeats with long irregular intervals. The scale is larger and the colour is more muted, which makes them far easier to live with." },
      { type: "h", text: "3. Metallics, but matte" },
      { type: "p", text: "Gold is back and shine is not. The new metallics are mica-ground rather than foil, so the effect is a shift in temperature rather than a glint. It reads as expensive at close range and as a warm neutral from across a room, which is exactly the combination hospitality clients keep asking for." },
      { type: "h", text: "4. Heritage documents, reissued honestly" },
      { type: "p", text: "American and British mills are reopening their archives and — importantly — reprinting at the original scale and colour rather than a softened modern interpretation. The results are louder than people expect. Used in a single room with confident joinery, they are extraordinary." },
      { type: "h", text: "5. Made-to-measure murals" },
      { type: "p", text: "Printing economics have shifted far enough that a bespoke mural is now competitive with a mid-range roll for a single feature wall. The advantage is that the horizon sits at the client's eye level rather than the factory's, and there is no repeat anywhere in the room." },
      { type: "h", text: "Two we would skip" },
      { type: "list", items: [
        "Very high-gloss vinyls. They telegraph every imperfection in the plaster beneath, and Indian site conditions rarely deliver the substrate they need.",
        "Oversized geometric graphics. They look decisive on a mood board and overwhelming on a 3.2 metre wall. Halve the scale you think you want.",
      ]},
      { type: "quote", text: "The test we apply to every collection before we import it: will the client still like this in year eight?", cite: "Wall King buying policy, since 1984" },
    ],
  },
  {
    slug: "how-to-choose-bedroom-wallpaper",
    title: "Choosing wallpaper for a bedroom that you will still like in five years",
    dek: "Scale, light and the headboard problem — a practical method rather than a mood board.",
    category: "Ideas",
    date: "2026-06-30",
    readingMinutes: 6,
    author: "Wall King Design Desk",
    art: { kind: "trellis", palette: ["#faf5ec", "#b98f5a", "#dfc9a4", "#7d9384"], scale: 1 },
    body: [
      { type: "p", text: "Bedrooms are where most wallpaper decisions go wrong, because they are chosen the way art is chosen — emotionally, in a showroom, at eye level — and then lived with horizontally in low light for a decade." },
      { type: "h", text: "Start with the wall you actually see" },
      { type: "p", text: "From the bed you mostly see the wall opposite, not the one behind your head. Yet nearly everyone papers the headboard wall. That is not wrong — it frames the room from the doorway — but be honest about which surface you will spend more hours looking at, and pick the pattern's intensity accordingly." },
      { type: "h", text: "Halve the scale" },
      { type: "p", text: "A motif that reads as elegant on an A4 sample reads as busy across three metres. Our rule of thumb: hold the sample at arm's length, then imagine it nine times bigger. If it still calms you, it will work." },
      { type: "h", text: "Mind the light" },
      { type: "p", text: "North-facing bedrooms in India get flat, cool light for most of the year. Cool greys and blues go leaden in it. Warm neutrals, clay, muted greens and anything with a mica ground will hold up far better. South and west rooms can take cooler tones because the afternoon light does the warming for you." },
      { type: "h", text: "The headboard problem" },
      { type: "p", text: "An upholstered headboard covers 40–60% of a feature wall's most visible area. If you are specifying both, choose the wallpaper after the headboard, and pick a pattern whose repeat still reads when the middle of it is hidden. Free-match textures and irregular botanicals handle this far better than a strict damask." },
      { type: "h", text: "Practical checks before you commit" },
      { type: "list", items: [
        "Take the sample home and look at it at 7am, 3pm and under your actual bedside lamp.",
        "Confirm the roll width — 53cm, 70cm and 106cm papers give very different seam counts on the same wall.",
        "Ask for the washability rating if the room has children or the wall meets a bedside table.",
        "Order 10% over your calculated quantity, from the same batch. Dye lots do not repeat.",
      ]},
    ],
  },
  {
    slug: "specifying-wallpaper-for-hotels",
    title: "Specifying wallcoverings for hotels: what the spec sheet must say",
    dek: "Fire rating, abrasion class, seam strategy and the maintenance conversation nobody has early enough.",
    category: "Specification",
    date: "2026-05-18",
    readingMinutes: 9,
    author: "Wall King Projects Team",
    art: { kind: "ashlar", palette: ["#1e2227", "#7d858e", "#3a4149", "#b39a6b"], scale: 1 },
    body: [
      { type: "p", text: "A hotel corridor takes more abuse in a year than a bedroom takes in a decade. Trolleys, luggage, shoulders, cleaning chemicals and a housekeeping team working at speed. Residential-grade paper in that environment fails within eighteen months, and the replacement cost dwarfs whatever was saved at specification." },
      { type: "h", text: "Fire rating comes first, not last" },
      { type: "p", text: "Establish the required classification before you look at a single sample. In most Indian hospitality projects that means European EN 13501-1 Class B-s1,d0 or American ASTM E84 Class A for public areas. Ask for the certificate, not the claim — and check it covers the substrate and adhesive as a system, not just the face material." },
      { type: "h", text: "Type II is the baseline for public areas" },
      { type: "p", text: "For corridors, lift lobbies and any circulation space, specify Type II (approximately 20–22 oz/sq yd) commercial vinyl on an Osnaburg or non-woven backing. Type I is acceptable in guest rooms above dado height. Below dado, in a corridor, nothing lighter than Type II is defensible." },
      { type: "h", text: "Plan the seams before you pick the pattern" },
      { type: "p", text: "Wide-width goods at 137cm reduce seam count dramatically over a 53cm residential roll, and every seam is a future failure point. On a long corridor this alone can decide the specification. Free-match and random-match patterns also let the installer optimise around door frames rather than forcing alignment." },
      { type: "h", text: "The maintenance conversation" },
      { type: "p", text: "Housekeeping will clean your wall with whatever is on the trolley. If the surface is not bleach-cleanable, say so in writing, provide the care sheet at handover, and specify a surface that survives what will actually happen rather than what should." },
      { type: "h", text: "A minimum spec sheet" },
      { type: "list", items: [
        "Fire classification and test standard, with certificate reference",
        "Type / weight and backing construction",
        "Roll width, length and match type",
        "Abrasion and scrub resistance rating",
        "Mould and mildew resistance for humid coastal sites",
        "Adhesive type and substrate preparation standard",
        "Attic stock quantity — we recommend 5% held on site, same batch",
      ]},
      { type: "quote", text: "Order the attic stock at the same time as the main order. A perfect batch match two years later is not something anyone can promise you.", cite: "Wall King Projects Team" },
    ],
  },
  {
    slug: "wallpaper-care-and-cleaning",
    title: "Looking after wallpaper: what actually works",
    dek: "The short, unglamorous guide we wish every client read at handover.",
    category: "Care",
    date: "2026-04-09",
    readingMinutes: 4,
    author: "Wall King Service Desk",
    art: { kind: "grasscloth", palette: ["#efe9df", "#a8987f", "#cdc0aa", "#7c705d"], scale: 1 },
    body: [
      { type: "p", text: "Most wallpaper damage we are called about is not wear. It is cleaning — the wrong cloth, the wrong chemical, or water left to sit on a seam." },
      { type: "h", text: "Know which of the four you have" },
      { type: "list", items: [
        "Spongeable — a barely damp cloth, no product, no pressure.",
        "Washable — a damp cloth with a drop of neutral soap. Dry immediately.",
        "Scrubbable — a soft brush and mild detergent will not harm it.",
        "Dry clean only — flocks, silks and hand-finished papers. A soft dry brush or vacuum upholstery head, nothing more.",
      ]},
      { type: "h", text: "Rules that apply to all of them" },
      { type: "p", text: "Always test in a hidden corner first. Always work from the bottom of the wall upward, so runs do not leave streaks on dry paper. Never let water sit on a seam — blot it dry within seconds. Never use a solvent, a scouring pad, or anything advertised as a magic eraser; they are abrasive and will polish the texture off." },
      { type: "h", text: "Humidity and the monsoon" },
      { type: "p", text: "If a wall has an external face, check it at the start and end of the monsoon. Bubbling along a seam is nearly always moisture in the substrate rather than adhesive failure, and it is far cheaper to trace the leak than to re-paper twice." },
      { type: "h", text: "Keep the offcuts" },
      { type: "p", text: "Store a metre of every paper flat, in the dark, with the batch number written on the back. A patched repair from the same batch is invisible; one from a new batch never quite is." },
    ],
  },
  {
    slug: "kids-room-wallpaper-that-lasts",
    title: "Children's rooms: designing for the child they will become",
    dek: "How to avoid re-papering at age seven, and which surfaces survive a felt-tip pen.",
    category: "Ideas",
    date: "2026-03-12",
    readingMinutes: 5,
    author: "Wall King Design Desk",
    art: { kind: "terrazzo", palette: ["#f3efe6", "#c58b3f", "#7f8b7a", "#3a3a35"], scale: 0.85 },
    body: [
      { type: "p", text: "The nursery you paper for a two-year-old will be occupied by a nine-year-old before the adhesive is fully cured, in perceptual terms. The most common mistake is theming — and the most common regret is having to strip it." },
      { type: "h", text: "Pattern, not narrative" },
      { type: "p", text: "A trellis, a small geometric, a scattered star or a soft botanical will read as charming at three and as merely nice at eleven. A named cartoon character will not. If you want narrative, put it on something you can change: bedding, a poster rail, a single removable panel." },
      { type: "h", text: "Specify washable, at minimum" },
      { type: "p", text: "Nothing below a washable rating belongs in a child's room. Scrubbable is better. A wipeable vinyl at dado height with a lighter paper above is a genuinely good compromise that most people never consider." },
      { type: "h", text: "Check the inks" },
      { type: "p", text: "Ask for low-VOC, water-based inks and a breathable non-woven substrate. Several of our European ranges carry explicit certification for children's environments; we are happy to point you at them." },
      { type: "h", text: "Scale down" },
      { type: "p", text: "Children's rooms are usually the smallest in the house. Keep the repeat under 50mm and the room will feel larger, not busier." },
    ],
  },
  {
    slug: "wallpaper-vs-paint-cost",
    title: "Wallpaper versus paint: the honest cost comparison",
    dek: "Over ten years the numbers are closer than most people assume — and occasionally the other way round.",
    category: "Specification",
    date: "2026-02-02",
    readingMinutes: 6,
    author: "Wall King Projects Team",
    art: { kind: "stripe", palette: ["#f3ede1", "#2f4858", "#c0a26a", "#8ba0ad"], scale: 1.1 },
    body: [
      { type: "p", text: "Paint looks cheaper because the comparison is usually made at day one, on material cost alone. It is a fair comparison for a rental. It is a poor one for a home or a hotel." },
      { type: "h", text: "What paint actually costs over ten years" },
      { type: "p", text: "A quality emulsion in an occupied Indian home realistically wants recoating every three to four years — sooner in a corridor or a child's room. That is two to three repaints in a decade, each requiring surface preparation, labour, and the household working around it. Wallpaper of the right specification will comfortably run the full ten." },
      { type: "h", text: "Where paint genuinely wins" },
      { type: "list", items: [
        "Walls with active damp. Fix the wall first; paper it later, or not at all.",
        "Spaces you expect to reconfigure within two or three years.",
        "Ceilings, in almost every case.",
        "Very small budgets where the wall condition would need significant preparation either way.",
      ]},
      { type: "h", text: "Where wallpaper wins clearly" },
      { type: "p", text: "Any wall where texture or pattern is doing design work that paint would need joinery or art to achieve. Any high-traffic commercial surface, where a Type II vinyl outlasts paint by a factor of three. And any wall with minor surface imperfection, which a textured paper hides and a flat paint advertises." },
      { type: "h", text: "Ask us for the number" },
      { type: "p", text: "Send us the wall dimensions and we will give you a supplied-and-fitted figure and a ten-year comparison against repainting, with no obligation. Our calculator will get you most of the way there in a minute." },
    ],
  },
];

export const postsByNewest = [...posts].sort(
  (a, b) => Date.parse(b.date) - Date.parse(a.date),
);

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export const categories = Array.from(new Set(posts.map((p) => p.category)));

export function formatPostDate(iso: string) {
  // Fixed locale + UTC so server and client always agree.
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
