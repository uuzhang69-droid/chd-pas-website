import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import schedule from "../public/schedule.json";
import { siteContent } from "../src/content/site";
import { searchSite } from "../src/lib/search/search";

const styles = siteContent.pages.classes.styles;
const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Every piece of text a visitor reads on a class page. */
function allText(style: (typeof styles)[number]): string[] {
    return [
        style.hero.subtitle,
        style.metaDescription,
        ...style.about.paragraphs,
        ...style.formats.flatMap((format) => [format.name, format.summary]),
        style.formatsNote ?? "",
        ...(style.expect?.items ?? []).flatMap((item) => [item.title, item.description]),
        style.closing.title,
        style.closing.body,
        style.instructorHeading,
    ];
}

test("every class has the sections the page needs, with real text", () => {
    assert.equal(styles.length, 5);
    for (const style of styles) {
        assert.ok(style.about.paragraphs.length >= 2, `${style.slug}: about`);
        assert.ok(style.formats.length >= 1, `${style.slug}: formats`);
        if (style.expect) assert.ok(style.expect.items.length > 0, `${style.slug}: empty optional section`);
        assert.ok(style.instructor.name && style.instructor.bio.length > 60, `${style.slug}: instructor`);
        const formatNames = new Set(style.formats.map((format) => format.name));
        for (const text of allText(style).filter((entry) => entry !== "")) {
            assert.ok(formatNames.has(text) || text.trim().length > 8, `${style.slug}: empty or tiny text "${text}"`);
            assert.ok(!text.includes("[MISSING"), `${style.slug}: missing copy id`);
        }
    }
});

test("page order: hero, about, classes, what to expect, instructor, next step", () => {
    const source = readFileSync("src/app/classes/[slug]/page.tsx", "utf8");
    const order = ['id="about"', 'id="classes"', 'id="expect"', 'id="instructor"', 'id="next"'].map((marker) =>
        source.indexOf(marker),
    );
    assert.ok(order.every((index) => index > 0), "a section is missing");
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
    assert.ok(source.indexOf("{/* 1. Hero */}") < order[0]);
});

test("the classes listed match the timetable: every class running in its latest period is described", () => {
    const entries = schedule.classes as Array<{ name: string; style: string; endDate?: string }>;
    for (const style of styles) {
        const own = entries.filter((entry) => norm(entry.style) === norm(style.name));
        assert.ok(own.length > 0, `${style.slug}: no timetable entries`);
        const latestEnd = own.map((entry) => entry.endDate ?? "").sort().at(-1);
        const current = own.filter((entry) => (entry.endDate ?? "") === latestEnd);
        for (const entry of current) {
            // "Yoga (Gentle Flow)" -> "gentle flow"; a name without brackets matches the format of the same name.
            const detail = /\(([^)]+)\)/.exec(entry.name)?.[1] ?? "";
            const wanted = norm(detail || entry.name);
            const covered = style.formats.some((format) => norm(format.name).includes(wanted) || wanted.includes(norm(format.name)));
            assert.ok(covered, `${style.slug}: "${entry.name}" is on the timetable but has no description`);
        }
        // And nothing is described that never appears on the timetable.
        for (const format of style.formats) {
            const key = norm(format.name).split(" ").slice(-2).join(" ");
            const lastWord = norm(format.name).split(" ").at(-1)!;
            assert.ok(
                own.some((entry) => norm(entry.name).includes(key) || norm(entry.name).includes(lastWord) || norm(format.name) === norm(style.name)),
                `${style.slug}: "${format.name}" is not on the timetable`,
            );
        }
    }
});

test("yoga lists Gentle Flow, Vinyasa Flow and Inside Flow, each described on its own", () => {
    const yoga = styles.find((style) => style.slug === "yoga")!;
    assert.deepEqual(yoga.formats.map((format) => format.name), ["Gentle Flow", "Vinyasa Flow", "Inside Flow"]);
    assert.equal(new Set(yoga.formats.map((format) => format.summary)).size, 3);
});

test("copy rules: British spelling, no inflated phrases, no promises about levels or health", () => {
    const american = /\b(color|center|program|favorite|recognized|organization|realize|练习)\b/i;
    const hype = /(state-of-the-art|world-class|unlock|embark|elevate|transform your|journey|passion for|like never before|take your .* to the next level)/i;
    const promises = /(all levels|every level|suitable for everyone|for everyone|any fitness level|every fitness level|will improve|will cure|heal)/i;
    for (const style of styles)
        for (const text of allText(style)) {
            assert.ok(!american.test(text), `${style.slug}: American spelling in "${text}"`);
            assert.ok(!hype.test(text), `${style.slug}: inflated wording in "${text}"`);
            assert.ok(!promises.test(text), `${style.slug}: unsupported promise in "${text}"`);
        }
});

test("the pages do not repeat the same sentence patterns or blocks", () => {
    const openers = styles.map((style) => style.about.paragraphs[0].split(" ").slice(0, 3).join(" ").toLowerCase());
    assert.equal(new Set(openers).size, styles.length, "two classes open the same way");
    const everyDescription = styles.flatMap((style) => (style.expect?.items ?? []).map((item) => item.description));
    assert.equal(new Set(everyDescription).size, everyDescription.length, "a feature card is repeated");
    const titles = styles.flatMap((style) => (style.expect?.items ?? []).map((item) => `${style.slug}:${item.title}`));
    assert.equal(new Set(titles).size, titles.length);
});

test("verified teacher details are kept", () => {
    const get = (slug: string) => styles.find((style) => style.slug === slug)!.instructor;
    assert.match(get("yoga").bio, /Sen Yoga/);
    assert.match(get("yoga").bio, /Yoga Alliance/);
    assert.match(get("tango").bio + (get("tango").moreBio ?? []).join(" "), /Tango-Fever/);
    assert.match(get("contemporary").bio, /C\(P\)LAY/);
    assert.match(get("chinese-dance").bio, /Roehampton/);
    assert.match(get("tai-chi").bio, /Shanghai Ballet School/);
    assert.equal(styles.find((style) => style.slug === "contemporary")!.instructorHeading, "Meet your instructors");
});

test("class pages can be found by their format names and teachers", () => {
    const top = (query: string) => searchSite(query).results.map((result) => result.doc.url);
    assert.ok(top("gentle flow").includes("/classes/yoga"));
    assert.equal(top("vinyasa")[0], "/classes/yoga");
    assert.equal(top("inside flow")[0], "/classes/yoga");
    assert.ok(top("soft training").includes("/classes/chinese-dance"));
    assert.ok(top("tango beginner").includes("/classes/tango"));
    assert.ok(top("sen yoga").includes("/classes/yoga"));
    assert.ok(top("C(P)LAY").includes("/classes/contemporary"));
});

test("single-format pages retain searchable class data and multi-format pages retain every option", () => {
    for (const slug of ["contemporary", "tai-chi"]) {
        const style = styles.find((entry) => entry.slug === slug)!;
        assert.equal(style.formats.length, 1);
        assert.ok(style.formats[0].summary.includes("weekly"));
        assert.ok(style.about.title);
        assert.equal(style.expect, undefined);
        assert.ok(searchSite(style.formats[0].name).results.some((result) => result.doc.url === `/classes/${slug}`));
    }
    for (const [slug, count] of [["yoga", 3], ["tango", 2], ["chinese-dance", 2]] as const) {
        const style = styles.find((entry) => entry.slug === slug)!;
        assert.equal(style.formats.length, count);
        assert.ok(style.formatSection?.title);
    }
    const chinese = styles.find((style) => style.slug === "chinese-dance")!;
    assert.ok(chinese.formats[0].image?.src.endsWith("chinese-classical-dance-class.jpg"));
    assert.ok(chinese.formats[1].image?.src.endsWith("chinese-dance-soft-training.jpg"));
});

test("no divider line sits between a class introduction and its formats heading; the list keeps its separators between sessions", () => {
    const page = readFileSync("src/app/classes/[slug]/page.tsx", "utf8");
    const intro = page.slice(page.indexOf('id="about"'), page.indexOf("style.formats.length > 1"));
    const categories = page.slice(page.indexOf("style.formats.length > 1"), page.indexOf('id="instructor"'));
    assert.ok(!/border-t/.test(intro), "no divider inside the introduction, between ordinary paragraphs");
    assert.ok(!/border-t/.test(categories.slice(0, categories.indexOf("<ul"))), "no line above the formats heading");
    assert.match(categories, /<ul className="[^"]*divide-y divide-taupe\/40 border-y border-taupe\/40">/, "separators between the individual sessions are kept");
    assert.equal(styles.filter((style) => style.formats.length > 1).map((style) => style.slug).sort().join(","), "chinese-dance,tango,yoga");
});
