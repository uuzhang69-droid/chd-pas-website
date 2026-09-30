import { createClient } from "next-sanity";
import { TIMETABLE_SEED_SESSIONS } from "./seed-data";
import type { TimetableSession, TimetableStyleId } from "./types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

const STYLE_IDS: TimetableStyleId[] = [
  "contemporary",
  "chinese-dance",
  "tango",
  "yoga",
  "tai-chi",
];

function isStyleId(value: string): value is TimetableStyleId {
  return STYLE_IDS.includes(value as TimetableStyleId);
}

type SanityTimetableRow = {
  _id: string;
  title: string;
  style: string;
  dayOfWeek: number;
  slotId: string;
  instructor?: string;
  level?: string;
  cancelledDates?: string[];
};

const QUERY = `*[_type == "timetableClass"] | order(dayOfWeek asc, slotId asc) {
  _id,
  title,
  style,
  dayOfWeek,
  slotId,
  instructor,
  level,
  "cancelledDates": cancelledDates[]
}`;

function mapRow(row: SanityTimetableRow): TimetableSession | null {
  if (!isStyleId(row.style)) return null;
  return {
    id: row._id,
    title: row.title,
    style: row.style,
    dayOfWeek: row.dayOfWeek,
    slotId: row.slotId,
    instructor: row.instructor,
    level: row.level,
    cancelledDates: (row.cancelledDates ?? []).filter(Boolean),
  };
}

export async function fetchTimetableSessions(): Promise<TimetableSession[]> {
  if (!projectId) {
    return TIMETABLE_SEED_SESSIONS;
  }

  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    });
    const rows = await client.fetch<SanityTimetableRow[]>(QUERY);
    const mapped = rows.map(mapRow).filter((row): row is TimetableSession => row !== null);
    return mapped.length > 0 ? mapped : TIMETABLE_SEED_SESSIONS;
  } catch {
    return TIMETABLE_SEED_SESSIONS;
  }
}
