import { SEED_CLASSES } from "@/lib/tester-classes/seed-data";
import { sortTesterClasses } from "@/lib/tester-classes/sort";
import type {
  ClassDay,
  ClassDiscipline,
  TesterClass,
} from "@/lib/tester-classes/types";
import { DEFAULT_BOOKING_URL } from "@/lib/tester-classes/types";

type AirtableAttachment = {
  url: string;
};

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableResponse = {
  records: AirtableRecord[];
  offset?: string;
};

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[£,]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asDay(value: unknown): ClassDay {
  const day = asString(value, "Mon") as ClassDay;
  return day;
}

function asDiscipline(value: unknown): ClassDiscipline {
  return asString(value, "Contemporary") as ClassDiscipline;
}

function mapAirtableRecord(record: AirtableRecord): TesterClass | null {
  const fields = record.fields;
  const title = asString(fields.Title);
  if (!title) return null;

  const attachments = fields.Image;
  const imageUrl =
    Array.isArray(attachments) && attachments.length > 0
      ? asString((attachments[0] as AirtableAttachment).url)
      : "/images/hero/slide-1.jpg";

  const bookingUrl = asString(fields["Booking URL"], DEFAULT_BOOKING_URL);

  return {
    id: record.id,
    title,
    day: asDay(fields.Day),
    startTime: asString(fields["Start Time"]),
    endTime: asString(fields["End Time"]),
    dateRange: asString(fields["Date Range"]),
    ageGroup: asString(fields["Age Group"], "Any age"),
    location: asString(fields.Location, "County Hall Dance Centre"),
    price: asNumber(fields.Price, 10),
    discipline: asDiscipline(fields.Discipline),
    level: asString(fields.Level) || undefined,
    imageUrl,
    bookingUrl: bookingUrl || DEFAULT_BOOKING_URL,
    sortOrder:
      typeof fields["Sort Order"] === "number"
        ? fields["Sort Order"]
        : undefined,
  };
}

async function fetchAirtableRecords(): Promise<AirtableRecord[] | null> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_CLASSES_TABLE ?? "Classes";

  if (!apiKey || !baseId) return null;

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    );
    url.searchParams.set("filterByFormula", "{Active}=TRUE()");
    url.searchParams.set("sort[0][field]", "Day");
    url.searchParams.set("sort[0][direction]", "asc");
    url.searchParams.set("sort[1][field]", "Start Time");
    url.searchParams.set("sort[1][direction]", "asc");
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(
        `Airtable fetch failed (${response.status}): ${await response.text()}`,
      );
      return null;
    }

    const data = (await response.json()) as AirtableResponse;
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

export async function fetchTesterClasses(): Promise<TesterClass[]> {
  try {
    const records = await fetchAirtableRecords();
    if (records === null) {
      return sortTesterClasses(SEED_CLASSES);
    }

    const classes = records
      .map(mapAirtableRecord)
      .filter((item): item is TesterClass => item !== null);

    return sortTesterClasses(classes);
  } catch (error) {
    console.error("Failed to fetch tester classes:", error);
    return sortTesterClasses(SEED_CLASSES);
  }
}

export function formatClassPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}
