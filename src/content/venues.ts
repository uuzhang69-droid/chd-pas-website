export const SCHOOL_VENUE_ID = "county-hall-dance-school";
export const TIMETABLE_TIME_ZONE = "Europe/London";

export const venues = {
  [SCHOOL_VENUE_ID]: {
    name: "County Hall Dance & Performing Arts School",
    address: "2nd Floor, County Hall Main Entrance, Belvedere Road, London SE1 7PB",
    aliases: ["County Hall Dance Centre", "CHDC"],
  },
  "county-hall": { name: "County Hall", aliases: ["Riverside Building, County Hall"] },
  "county-hall-atrium": { name: "County Hall Atrium", aliases: ["Atrium, County Hall"] },
  "members-terrace": { name: "Members’ Terrace", aliases: ["Members' Terrace, County Hall"] },
  "kiln-courtyard": { name: "Kiln Courtyard", aliases: ["Kiln Courtyard / Glaze Room", "Glaze Room"] },
  "private-cinema": { name: "Private Cinema", aliases: [] },
} satisfies Record<string, { name: string; address?: string; aliases: string[] }>;

export type VenueId = keyof typeof venues;

/** Exact legacy aliases only; unknown and building-wide venues never become the school. */
export function resolveVenueId(value: string | undefined): VenueId | undefined {
  const normalized = value?.trim().toLowerCase();
  return (Object.keys(venues) as VenueId[]).find((id) =>
    [id, venues[id].name, ...venues[id].aliases].some((name) => name.toLowerCase() === normalized));
}

export function venueName(id: string | undefined): string | undefined {
  const canonical = resolveVenueId(id);
  return canonical ? venues[canonical].name : undefined;
}

// Add only verified rooms. A missing room must never be interpreted as a free room.
export const spaces: Record<string, { name: string; venueId: VenueId }> = {};

export function spaceName(id: string | undefined, venueId: string | undefined): string | undefined {
  const space = id ? spaces[id] : undefined;
  return space?.venueId === resolveVenueId(venueId) ? space?.name : undefined;
}

export function venueAddress(id: string | undefined): string | undefined {
  const canonical = resolveVenueId(id);
  if (!canonical) return undefined;
  const venue = venues[canonical];
  return "address" in venue ? venue.address : undefined;
}
