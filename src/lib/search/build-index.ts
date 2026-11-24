import { siteContent } from "../../content/site";
import schedule from "../../../public/schedule.json";
import type { ClassStylePage } from "../../content/types";
import type { SearchDoc } from "./types";

/**
 * Builds the site search index from what the website actually publishes: the page content in
 * `siteContent` (classes, courses, events, venue hire, membership and the other pages) and the public
 * weekly timetable file. Every document is a real public page; the test suite checks each one
 * against the sitemap, so private, admin, draft and internal pages can never appear.
 */

/** Keys whose text is not something a visitor would search for. */
const SKIP_KEYS = new Set([
    "image", "images", "gallery", "inlineGalleries", "photoCarousel", "src", "alt", "href", "url",
    "id", "slug", "variant", "external", "icon", "embedUrl", "directionsHref", "bookingUrl",
    "dateIso", "action", "cta", "bookNow", "tickets", "descriptionCtas", "calendar",
]);

function collectText(value: unknown, out: string[], depth = 0): void {
    if (depth > 8 || value === null || value === undefined) return;
    if (typeof value === "string") {
        /* **bold** markers are emphasis for the page, not words to search or show in a snippet. */
        const text = value.replaceAll("**", "").replace(/\s+/g, " ").trim();
        if (text) out.push(text);
    } else if (Array.isArray(value)) {
        for (const item of value) collectText(item, out, depth + 1);
    } else if (typeof value === "object") {
        for (const [key, inner] of Object.entries(value as Record<string, unknown>))
            if (!SKIP_KEYS.has(key)) collectText(inner, out, depth + 1);
    }
}

function textOf(...values: unknown[]): string {
    const out: string[] = [];
    for (const value of values) collectText(value, out);
    // One fragment per line, so a snippet can be a whole sentence instead of a run of list items.
    return [...new Set(out)].join("\n");
}

function clean(text: string | undefined): string {
    return (text ?? "").replace(/\s+/g, " ").trim();
}

type PageLike = {
    meta?: { title?: string; description?: string };
    hero?: { title?: string; subtitle?: string };
    intro?: unknown;
};

function firstText(...values: unknown[]): string {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) return clean(value);
        if (Array.isArray(value)) {
            const first = value.find((item) => typeof item === "string" && item.trim());
            if (typeof first === "string") return clean(first);
        }
    }
    return "";
}

/** Link text from the main menu, so a result is titled the way the visitor knows the page. */
function navigationTitles(): Map<string, string> {
    const titles = new Map<string, string>();
    const walk = (items: ReadonlyArray<{ label: string; href: string; children?: ReadonlyArray<{ label: string; href: string }> }>) => {
        for (const item of items) {
            if (!item.href.includes("?") && !titles.has(item.href)) titles.set(item.href, item.label);
            if (item.children) walk(item.children);
        }
    };
    walk(siteContent.global.navigation.items);
    return titles;
}

/** Weekly timetable class names grouped by style, from the public schedule file. */
function timetableNames(): { all: string[]; byStyle: Map<string, string[]> } {
    const byStyle = new Map<string, string[]>();
    const all = new Set<string>();
    for (const entry of schedule.classes as Array<{ name: string; style: string }>) {
        all.add(entry.name);
        all.add(entry.style);
        const list = byStyle.get(entry.style.toLowerCase()) ?? [];
        if (!list.includes(entry.name)) list.push(entry.name);
        byStyle.set(entry.style.toLowerCase(), list);
    }
    return { all: [...all], byStyle };
}

const EVENT_TYPE_LABEL = {
    event: "Event",
    workshop: "Workshop",
    masterclass: "Masterclass",
} as const;

/** Phrases a visitor may type when they mean this page. They help ranking; they never redirect. */
const HUB_ALIASES: Record<string, string[]> = {
    "/": ["home", "homepage", "main page"],
    "/events": ["events", "event", "activities", "what's on", "upcoming", "whats on", "festival", "concerts"],
    "/classes-info": ["classes", "class", "lessons", "dance lessons", "dance classes", "styles", "dance styles", "instructors", "teachers"],
    "/timetable": ["schedule", "timetable", "times", "weekly", "calendar"],
    "/class-booking": ["book", "booking", "book a class", "trial", "reserve"],
    "/courses": ["courses", "course", "term", "terms", "programme"],
    "/venue-hire": ["studio hire", "venue hire", "hire", "rental", "rent", "room hire", "space", "studio", "venue"],
    "/private-lessons": ["private lessons", "private lesson", "one to one", "1 to 1", "coaching", "wedding dance", "first dance"],
    "/membership": ["membership", "member", "members", "join", "pass", "discount"],
    "/contact": ["contact", "phone", "email", "address", "location", "directions", "enquiry", "call", "find us", "map", "opening hours"],
    "/about": ["about", "about us", "who we are", "our story"],
};

export function buildSearchIndex(): SearchDoc[] {
    const { pages } = siteContent;
    const nav = navigationTitles();
    const timetable = timetableNames();
    const docs = new Map<string, SearchDoc>();

    const add = (doc: SearchDoc) => {
        const summary = clean(doc.summary);
        const body = doc.body.slice(0, 8000);
        // A page with no real content is not a useful result.
        if (!doc.title || summary.length + body.length < 30) return;
        if (!docs.has(doc.url)) docs.set(doc.url, { ...doc, summary, body });
    };

    const hub = (
        url: string,
        page: PageLike,
        type: SearchDoc["type"],
        extraBody: unknown[] = [],
        extraKeywords: string[] = [],
        omit: string[] = [],
    ) => {
        const rest = Object.fromEntries(
            Object.entries(page as Record<string, unknown>).filter(([key]) => !omit.includes(key)),
        );
        add({
            url,
            title: nav.get(url) ?? page.meta?.title ?? page.hero?.title ?? "",
            type,
            summary: firstText(page.meta?.description, page.hero?.subtitle, page.intro),
            keywords: extraKeywords.join(" "),
            body: textOf(rest, extraBody),
            aliases: HUB_ALIASES[url] ?? [],
            hub: true,
        });
    };

    // Home
    add({
        url: "/",
        title: "Home",
        type: "Page",
        summary: "The County Hall Dance Centre home page.",
        keywords: "",
        body: "",
        aliases: HUB_ALIASES["/"],
        hub: true,
    });

    // Main pages
    hub("/timetable", pages.timetable, "Page", [], [timetable.all.join(" ")]);
    hub("/classes-info", pages.classesInfo, "Page", [pages.classes.styles.map((style) => style.name)]);
    hub("/class-booking", pages.classBooking, "Page");
    hub("/private-lessons", pages.privateLessons, "Page");
    hub("/membership", pages.membership.overview, "Page");
    hub("/courses", pages.courses, "Page", [pages.courses.items.map((course) => course.title)], [], ["items"]);
    hub("/venue-hire", pages.venueHire.overview, "Venue hire");
    hub("/about", pages.about, "Page");
    hub("/contact", pages.contact, "Page", [], [], ["form"]);
    hub("/events", pages.events, "Page", [pages.events.items.map((event) => event.title)], [], ["items", "categories", "filters"]);

    // Classes (with the instructor, who has no page of their own)
    for (const style of pages.classes.styles as ClassStylePage[]) {
        add({
            url: `/classes/${style.slug}`,
            title: style.name,
            type: "Class",
            summary: firstText(style.metaDescription, style.hero.subtitle, style.about.paragraphs),
            keywords: textOf(style.instructor.name, style.instructor.role, style.additionalInstructors?.map((person) => [person.name, person.role]), style.hero.overline),
            // The names of the class formats ("Gentle Flow", "Vinyasa Flow") are things people search for,
            // so they rank like intent words: the class page ahead of the timetable that merely lists them.
            aliases: style.formats.map((format) => format.name),
            body: textOf(
                style.hero.title, style.hero.subtitle, style.about, style.formats, style.formatsNote,
                style.expect, style.instructor.bio, style.instructor.moreBio, style.additionalInstructors?.map((person) => [person.bio, person.moreBio]), style.closing,
                timetable.byStyle.get(style.name.toLowerCase()) ?? [],
            ),
        });
    }

    // Courses
    for (const course of pages.courses.items) {
        add({
            url: `/courses/${course.slug}`,
            title: course.title,
            type: "Course",
            summary: firstText(course.metaDescription, course.excerpt),
            keywords: textOf(course.term, course.level),
            body: textOf(course.excerpt, course.description, course.includes, course.schedule, course.duration, course.price),
        });
    }

    // Events, workshops and masterclasses (already limited to public events)
    for (const event of pages.events.items) {
        const label = EVENT_TYPE_LABEL[event.listingCategory ?? "event"];
        add({
            url: `/events/${event.slug}`,
            title: event.title,
            type: label,
            summary: firstText(event.excerpt, event.subtitle, event.description),
            keywords: textOf(
                "Event", label, event.category, event.discipline, event.teacher, event.organiser,
                event.partners, event.teacherBio?.name,
            ),
            body: textOf(
                event.subtitle, event.excerpt, event.description, event.teacherBio?.paragraphs,
                event.location, event.hostedAt, event.date, event.admission,
                event.sessions?.map((session) => session.title),
            ),
        });
    }

    return [...docs.values()];
}

let cached: SearchDoc[] | undefined;

/** Built once per server process. All sources are bundled content, so a new deployment refreshes it. */
export function getSearchIndex(): SearchDoc[] {
    cached ??= buildSearchIndex();
    return cached;
}
