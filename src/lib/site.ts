/**
 * Single source of truth for company facts, navigation and locations.
 *
 * Contact details were taken from the existing wallking.in contact page and
 * public listings — VERIFY the Jubilee Hills entry and the WhatsApp number
 * before go-live, they came from a directory listing rather than from you.
 */

export const site = {
  name: "Wall King",
  tagline: "House of Wallpaper",
  founded: 1984,
  legalLine: "Wall King — India's largest importer & distributor of international wallpapers",
  description:
    "Established 1984. India's largest importer and distributor of international wallpapers, with 25+ global brands, 90+ cities served and three Hyderabad showrooms.",
  url: "https://wallking.in",
  email: "wallking1@gmail.com",
  /** Digits only, country code first — used to build wa.me links. */
  whatsapp: "919014561780",
  whatsappDisplay: "+91 90145 61780",
  primaryPhone: "+914023202255",
  primaryPhoneDisplay: "+91 40 2320 2255",
} as const;

export type Showroom = {
  id: string;
  role: string;
  name: string;
  lines: string[];
  city: string;
  pin: string;
  phones: string[];
  hours: string;
  /** Google Maps search query. */
  mapQuery: string;
  flagship?: boolean;
  blurb: string;
};

export const showrooms: Showroom[] = [
  {
    id: "abids",
    role: "Corporate Head Office",
    name: "Abids",
    lines: ["9 & 10 Unity House", "Jagdish Market, Abids"],
    city: "Hyderabad",
    pin: "500 002",
    phones: ["+91 40 2320 2255", "+91 40 2320 2277", "+91 40 2320 0344"],
    hours: "Mon–Sat · 10:30 – 20:00",
    mapQuery: "Wall King Wallpapers, Unity House, Jagdish Market, Abids, Hyderabad 500002",
    blurb:
      "Where Wall King began in 1984. The head office handles national distribution, project supply and dealer accounts, alongside a working display of current stock ranges.",
  },
  {
    id: "secunderabad",
    role: "Branch Office & Showroom",
    name: "Secunderabad",
    lines: ["Ground Floor, H M Ishaq Complex", "Adj. General Bazaar Lane"],
    city: "Secunderabad",
    pin: "500 035",
    phones: ["+91 40 6632 7799", "+91 40 6638 1515"],
    hours: "Mon–Sat · 10:30 – 20:00",
    mapQuery: "Wall King, H M Ishaq Complex, General Bazaar, Secunderabad 500035",
    blurb:
      "Our twin-city counter, serving Secunderabad and Cantonment trade with fast off-the-shelf availability from ready stock.",
  },
  {
    id: "jubilee-hills",
    role: "Flagship Experience Centre",
    name: "Jubilee Hills",
    lines: ["Empire Square, Road No. 36", "Jawahar Colony, Jubilee Hills"],
    city: "Hyderabad",
    pin: "500 033",
    phones: ["+91 93962 02277"],
    hours: "Mon–Sun · 10:30 – 20:30",
    mapQuery: "Wall King Wallpapers, Empire Square, Road No 36, Jubilee Hills, Hyderabad 500033",
    flagship: true,
    blurb:
      "The main show gallery. International wallpapers, wall murals, handmade wallcoverings and project collections displayed at full drop, with consultants on hand for architects, designers and homeowners.",
  },
];

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
};

export const nav: NavItem[] = [
  {
    label: "Collections",
    href: "/collections",
    description: "Browse the full catalogue by brand, style, colour and application",
    children: [
      { label: "All Collections", href: "/collections", description: "Filter across every range in stock" },
      { label: "New Arrivals", href: "/new-arrivals", description: "This season's launches, updated monthly" },
      { label: "Brands", href: "/brands", description: "25+ manufacturers across 7 countries" },
    ],
  },
  {
    label: "Tools",
    href: "/calculator",
    description: "Practical tools for specifiers and homeowners",
    children: [
      { label: "Live Stock Availability", href: "/stock", description: "24×7 real-time warehouse roll stock & Excel updates" },
      { label: "Wallpaper Calculator", href: "/calculator", description: "Rolls, adhesive and budget in one pass" },
      { label: "Design No. Search", href: "/collections?focus=search", description: "Find any reference instantly" },
      { label: "Download Centre", href: "/downloads", description: "Catalogues, guides and technical sheets" },
      { label: "Video Gallery", href: "/videos", description: "Installation, launches and walkthroughs" },
    ],
  },
  { label: "Showrooms", href: "/showrooms", description: "Three galleries in Hyderabad" },
  { label: "Trade", href: "/trade", description: "Dealers, architects, builders and project teams" },
  { label: "Journal", href: "/journal", description: "Trends, ideas and specification notes" },
  { label: "About", href: "/about", description: "Four decades of the Parekh family business" },
];

export const stats = [
  { value: 1984, label: "Established", format: "year" as const },
  { value: 25, label: "International brands", suffix: "+" },
  { value: 90, label: "Cities served", suffix: "+" },
  { value: 3, label: "Hyderabad showrooms" },
];

export const strengths = [
  {
    title: "Four decades, one family",
    body: "Founded in 1984 by Mr. Tarun Parekh and built alongside his brother Mr. Chandresh Parekh. The same family still signs off on every range we bring into the country.",
  },
  {
    title: "India's largest importer",
    body: "Direct relationships with 25+ manufacturers across Germany, Italy, the Netherlands, Belgium, the USA, Japan and South Korea — not a reseller in the chain.",
  },
  {
    title: "Ready stock, not lead times",
    body: "Deep warehouse inventory across fast-moving ranges, so a specification signed on Monday can be on a wall the same week.",
  },
  {
    title: "Project specialists",
    body: "Hospitality, healthcare, retail, corporate and institutional supply with fire-rated, scrubbable and heavy-contract substrates.",
  },
  {
    title: "90+ cities covered",
    body: "An authorised dealer and distributor network reaching every major market in India, backed by our own logistics and service desk.",
  },
  {
    title: "Handpicked, never bulk-bought",
    body: "Every collection is personally selected at source. If it does not meet the standard we set in 1984, it does not get a Wall King label.",
  },
];

export const applications = [
  "Residential",
  "Commercial",
  "Hospitality",
  "Healthcare",
  "Retail",
  "Institutional",
  "Luxury Projects",
] as const;

export function whatsappLink(message: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || site.whatsapp;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function mapsLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
