import { collections } from "./collections";

/**
 * PREVIEW IMAGERY — placeholder room-sets.
 *
 * Every image here is an Unsplash interior, used so the site can be shown to
 * a client before Wall King's own photography exists. None of these rooms
 * actually feature the collection they are attached to.
 *
 * TO REPLACE: drop real photography into /public/collections/<slug>.jpg and
 * change `srcFor()` to return `/collections/${slug}.jpg`. Nothing else in the
 * codebase needs to change — every card, hero and journey scene reads through
 * these two helpers.
 */

const UNSPLASH = "https://images.unsplash.com/";

/** Verified to resolve; curated down to room-sets with a dominant wall. */
const ROOMS = [
  "photo-1567016432779-094069958ea5", // rust sofa against a pale wall
  "photo-1616594039964-ae9021a400a0", // dark, dramatic bedroom
  "photo-1586023492125-27b2c045efd7", // yellow chair, gallery wall
  "photo-1618221195710-dd6b41faaea6", // open plan, tall walls
  "photo-1615529182904-14819c35db37", // warm living room, rattan
  "photo-1616486338812-3dadae4b4ace", // elegant neutral living room
  "photo-1583847268964-b28dc8f51f92", // soft grey bedroom
  "photo-1600607687939-ce8a6c25118c", // timber-lined interior
  "photo-1502672260266-1c1ef2d93688", // sofa and plants, white wall
  "photo-1493809842364-78817add7ffb", // bright living room
  "photo-1524758631624-e2822e304c36", // modern living, warm wood
  "photo-1560448204-e02f11c3d0e2", // bright open interior
  "photo-1522708323590-d24dbb6b0267",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1540518614846-7eded433c457",
  "photo-1556909212-d5b604d0c90d",
  "photo-1513694203232-719a280e022f",
  "photo-1484154218962-a197022b5858",
  "photo-1556228720-195a672e8a03",
  "photo-1519710164239-da123dc03ef4",
  "photo-1595526114035-0d45ed16cfbf",
  "photo-1558211583-d26f610c1eb1",
  "photo-1517705008128-361805f42e86",
  "photo-1489269637500-aa0e75768394",
  "photo-1531835551805-16d864c8d311",
  "photo-1502005097973-6a7082348e28",
  // Removed after reviewing the set as a contact sheet: a lilac fabric
  // close-up and a night-time exterior. Neither is a room with a wall in it,
  // and both stood out badly next to 26 genuine interiors.
];

function img(id: string, w: number, q = 72) {
  return `${UNSPLASH}${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

/** Stable per-slug pick, so a collection always shows the same room. */
function indexFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % ROOMS.length;
}

export function srcFor(slug: string, width = 1200) {
  return img(ROOMS[indexFor(slug)], width);
}

export function blurFor(slug: string) {
  return img(ROOMS[indexFor(slug)], 24, 30);
}

/* ------------------------------------------------------------------ journey
   The scroll-through. Eight rooms, each pinned to a real collection so the
   caption, design number and link are all live data rather than lorem. */

export type JourneyScene = {
  slug: string;
  room: string;
  /** Short line set over the scene. */
  line: string;
  /** Where in the house we are — the journey has a narrative order. */
  place: string;
};

/**
 * Five rooms, not eight. Each scene owns 150svh of scroll, so eight of them
 * put ~13,000px of full-bleed photography between the hero and the rest of
 * the site — the journey stopped being a signature moment and became the
 * page. Five is enough to read as a walk and still leave room for the shop.
 */
const JOURNEY_ORDER: { slug: string; room: string; line: string; place: string }[] = [
  { slug: "onyx", room: ROOMS[1], line: "Walk in, and the wall is already talking.", place: "The entrance" },
  { slug: "belvedere", room: ROOMS[5], line: "A drawing room that remembers the nineteenth century.", place: "The drawing room" },
  { slug: "hortus", room: ROOMS[4], line: "A garden that never needs watering.", place: "The morning room" },
  { slug: "monsoon", room: ROOMS[3], line: "Six metres of weather, printed in one piece.", place: "The stairwell" },
  { slug: "palazzo", room: ROOMS[6], line: "Flock you can feel from across the room.", place: "The bedroom" },
];

export const journey: JourneyScene[] = JOURNEY_ORDER.filter((s) =>
  collections.some((c) => c.slug === s.slug),
);

export function journeySrc(room: string, width = 2000) {
  return img(room, width, 74);
}
export function journeyBlur(room: string) {
  return img(room, 20, 25);
}

/** A handful of rooms for showroom / editorial blocks. */
export const showroomRooms = [ROOMS[9], ROOMS[10], ROOMS[11]];

export function roomSrc(id: string, width = 1400) {
  return img(id, width);
}
export function blurRoom(id: string) {
  return img(id, 20, 25);
}

/**
 * Any string → a stable room. Lets a section, a page header, a video card or
 * a journal post ask for imagery without anybody maintaining a mapping.
 */
export function heroRoomFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) >>> 0;
  return ROOMS[h % ROOMS.length];
}

export function srcForKey(key: string, width = 1200) {
  return img(heroRoomFor(key), width);
}
export function blurForKey(key: string) {
  return img(heroRoomFor(key), 20, 25);
}

/** All rooms, for grids that want variety without repeating. */
export const allRooms = ROOMS;
