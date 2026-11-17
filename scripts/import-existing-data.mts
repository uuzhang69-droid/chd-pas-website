
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { siteSource } from "../src/content/site.source";
import { eventSessions } from "../src/content/event-sessions";

const APPLY = process.argv.includes("--apply");

const projectId = process.env.SANITY_PROJECT_ID
    ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const dataset = process.env.SANITY_DATASET
    ?? process.env.NEXT_PUBLIC_SANITY_DATASET
    ?? "production";

const token = process.env.SANITY_API_TOKEN;

if (!projectId) {
    throw new Error("Missing SANITY_PROJECT_ID");
}

if (APPLY && !token) {
    throw new Error("Missing SANITY_API_TOKEN");
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: "2025-02-19",
    useCdn: false,
    token,
});

const schedule = JSON.parse(
    readFileSync(resolve("public/schedule.json"), "utf8")
);

/** The few fields this script reads; Sanity documents carry many more. */
type Document = {
    _id?: string;
    _type?: string;
    name?: string;
    slug?: { current?: string };
    [key: string]: unknown;
};

const existing: Document[] = await client.fetch(
    `*[_type in [
        "danceStyle",
        "teacher",
        "timetableClass",
        "oneOffClass",
        "event",
        "venue"
    ]]`
);

const planned: Document[] = [];
const skipped: string[] = [];
const conflicts: string[] = [];
const notes: string[] = [];

function slugify(value: string): string {
    return value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function normalized(value: unknown): string {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function ref(id: string) {
    return {
        _type: "reference",
        _ref: id,
    };
}

function documents(type: string): Document[] {
    return [
        ...existing,
        ...planned,
    ].filter((item) => item._type === type);
}

function add(
    document: Document,
    label: string,
    match: (item: Document) => boolean
) {
    const matches = documents(document._type).filter(match);

    if (matches.length === 1) {
        skipped.push(label);
        return matches[0]._id as string;
    }

    if (matches.length > 1) {
        conflicts.push(`${label}: multiple matches`);
        return null;
    }

    const idTaken = existing.some(
        (item) => item._id === document._id
    );

    if (idTaken) {
        conflicts.push(`${label}: document ID already exists`);
        return null;
    }

    planned.push(document);
    return document._id as string;
}

// --------------------------------------------------
// 1. Dance Styles
// --------------------------------------------------

const styleNames = new Set<string>();

for (const item of schedule.classes ?? []) {
    const style = Array.isArray(item) ? item[4] : item.style;
    if (style) styleNames.add(style);
}

for (const item of schedule.datedClasses ?? []) {
    if (item.style) styleNames.add(item.style);
}

for (const item of siteSource.pages.classes.styles) {
    styleNames.add(item.name);
}

const styleIds = new Map<string, string>();

for (const name of styleNames) {
    const slug = slugify(name);

    const id = add(
        {
            _id: `import.danceStyle.${slug}`,
            _type: "danceStyle",
            name,
            slug: { _type: "slug", current: slug },
        },
        `Dance Style: ${name}`,
        (item) =>
            normalized(item.name) === normalized(name) ||
            item.slug?.current === slug
    );

    if (id) styleIds.set(normalized(name), id);
}

// --------------------------------------------------
// 2. Teachers
// --------------------------------------------------

const teacherCandidates = [
    {
        name: "Ka Ki Christina Lai",
        style: "Contemporary",
        bio: "",
    },
    {
        name: "Ying Yen (Yvonne) Wang",
        style: "Contemporary",
        bio: "",
    },
];

for (const item of siteSource.pages.classes.styles) {
    if (!item.instructor) continue;

    if (item.slug === "contemporary") {
        notes.push(
            "Contemporary: shared biography and photo need review."
        );
        continue;
    }

    teacherCandidates.push({
        name: item.instructor.name,
        style: item.name,
        bio: item.instructor.bio ?? "",
    });
}

for (const teacher of teacherCandidates) {
    const slug = slugify(teacher.name);
    const styleId = styleIds.get(normalized(teacher.style));

    add(
        {
            _id: `import.teacher.${slug}`,
            _type: "teacher",
            name: teacher.name,
            slug: { _type: "slug", current: slug },
            bio: teacher.bio,
            isActive: true,
            displayOrder: 100,
            ...(styleId
                ? {
                    danceStyles: [{
                        _key: slugify(teacher.style),
                        ...ref(styleId),
                    }],
                }
                : {}),
        },
        `Teacher: ${teacher.name}`,
        (item) =>
            item.slug?.current === slug ||
            normalized(item.name) === normalized(teacher.name)
    );
}

// --------------------------------------------------
// 3. Regular Classes
// --------------------------------------------------

for (const [index, raw] of (schedule.classes ?? []).entries()) {
    const item = Array.isArray(raw)
        ? {
            day: raw[0],
            start: raw[1],
            end: raw[2],
            name: raw[3],
            style: raw[4],
        }
        : raw;

    const styleId = styleIds.get(normalized(item.style));

    if (!styleId) {
        conflicts.push(`Regular Class: ${item.name} - missing style`);
        continue;
    }

    const identity = [
        item.name,
        item.day,
        item.start,
        item.end,
        item.startDate ?? "",
        item.endDate ?? "",
    ].join("|");

    const id = `import.regular.${slugify(identity)}`;

    add(
        {
            _id: id,
            _type: "timetableClass",
            title: item.name,
            danceStyle: ref(styleId),
            dayOfWeek: item.day,
            startTime: item.start,
            endTime: item.end,
            ...(item.startDate ? { startDate: item.startDate } : {}),
            ...(item.endDate ? { endDate: item.endDate } : {}),
        },
        `Regular Class ${index + 1}: ${item.name}`,
        (doc) =>
            normalized(doc.title) === normalized(item.name) &&
            doc.dayOfWeek === item.day &&
            (doc.startTime ?? "") === item.start &&
            (doc.endTime ?? "") === item.end &&
            (doc.startDate ?? "") === (item.startDate ?? "") &&
            (doc.endDate ?? "") === (item.endDate ?? "")
    );
}

// --------------------------------------------------
// 4. One-off Classes
// --------------------------------------------------

const dated = schedule.datedClasses ?? [];

const oneOffClasses = dated.filter(
    (item: Document) =>
        item.type !== "event" &&
        item.type !== "workshop"
);

const workshopEntries = dated.filter(
    (item: Document) => item.type === "workshop"
);

for (const item of oneOffClasses) {
    const styleId = styleIds.get(normalized(item.style));

    if (!styleId) {
        conflicts.push(`One-off Class: ${item.name} - missing style`);
        continue;
    }

    const identity = [
        item.date,
        item.name,
        item.start,
        item.end,
    ].join("|");

    add(
        {
            _id: `import.oneoff.${slugify(identity)}`,
            _type: "oneOffClass",
            title: item.name,
            displayName: item.name,
            date: item.date,
            startTime: item.start,
            endTime: item.end,
            danceStyle: ref(styleId),
            status: "confirmed",
            calendarVisible: true,
        },
        `One-off Class: ${item.name} (${item.date})`,
        (doc) =>
            normalized(doc.title) === normalized(item.name) &&
            doc.date === item.date &&
            doc.startTime === item.start &&
            doc.endTime === item.end
    );
}

// --------------------------------------------------
// 5. Events and Workshops - audit only
// --------------------------------------------------

const sourceEvents = siteSource.pages.events.items;

for (const event of sourceEvents) {
    const matches = existing.filter(
        (doc) =>
            doc._type === "event" &&
            doc.slug?.current === event.slug
    );

    if (matches.length > 1) {
        conflicts.push(`Event: duplicate slug ${event.slug}`);
    } else {
        notes.push(
            `Event: ${event.title} | ${matches.length ? "exists" : "pending import"}`
        );
    }
}

for (const item of workshopEntries) {
    notes.push(
        `Workshop: ${item.name} | ${item.date} | ${item.start}-${item.end}`
    );
}

notes.push(
    `Legacy event sessions: ${eventSessions.length}`
);

// --------------------------------------------------
// 6. Report
// --------------------------------------------------

console.log("\n=== SANITY IMPORT ===");
console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
console.log(`Dataset: ${dataset}`);
console.log(`Existing documents: ${existing.length}`);
console.log(`Planned documents: ${planned.length}`);
console.log(`Skipped: ${skipped.length}`);
console.log(`Conflicts: ${conflicts.length}`);

console.log("\nPlanned:");
planned.forEach((doc) => {
    console.log(`  + ${doc._type}: ${doc.title ?? doc.name}`);
});

console.log("\nSkipped:");
skipped.forEach((item) => console.log(`  = ${item}`));

console.log("\nConflicts:");
conflicts.forEach((item) => console.log(`  ! ${item}`));

console.log("\nNotes:");
notes.forEach((item) => console.log(`  - ${item}`));

// --------------------------------------------------
// 7. Optional write
// --------------------------------------------------

if (!APPLY) {
    console.log("\nDRY RUN: no changes made.");
} else if (conflicts.length > 0) {
    throw new Error(
        "Import stopped because conflicts need review."
    );
} else {
    for (const doc of planned) {
        await client.createIfNotExists(doc);
        console.log(`Created if absent: ${doc._id}`);
    }

    console.log("\nImport completed.");
}

if (conflicts.length > 0) {
    throw new Error(
        "Import stopped because conflicts need review."
    );
}

for (const doc of planned) {
    await client.createIfNotExists(doc);
    console.log(`Created if absent: ${doc._id}`);
}

console.log("\nImport completed.");
