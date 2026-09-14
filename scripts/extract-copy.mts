/**
 * Extracts user-facing strings from site.source.ts into:
 * - src/content/copy.ts
 * - content/website-copy.csv
 * - src/content/site.structure.ts
 *
 * Run: npx tsx scripts/extract-copy.mts
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { siteSource } from "../src/content/site.source";

const COPY_PREFIX = "@@COPY:";

const TEXT_KEYS = new Set([
  "label",
  "title",
  "subtitle",
  "overline",
  "headline",
  "blurb",
  "intro",
  "body",
  "description",
  "placeholder",
  "submitLabel",
  "successMessage",
  "selectPlaceholder",
  "text",
  "question",
  "answer",
  "terms",
  "copyright",
  "nameLine1",
  "nameLine2",
  "alt",
  "excerpt",
  "siteName",
  "shortName",
  "defaultDescription",
  "previousLabel",
  "nextLabel",
  "linkSuffix",
  "viewAll",
  "socialHeading",
  "providerNote",
  "placeholderLabel",
  "placeholderHint",
  "backLink",
  "location",
  "date",
  "duration",
  "schedule",
  "price",
  "level",
  "term",
  "amount",
  "bio",
  "role",
  "name",
  "email",
  "phone",
  "hours",
  "directionsLabel",
  "viewCourseLink",
  "eventDetailsLink",
  "metaDescription",
]);

const copyEntries: Array<{ id: string; location: string; text: string }> = [];

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function humanLocation(id: string): string {
  const parts = id.split(".");
  const root = parts[0];

  const rootLabels: Record<string, string> = {
    meta: "Site metadata (SEO defaults)",
    global: "Global shell (header, footer, utility bar)",
    home: "Homepage",
    pages: "Inner page",
    ui: "Site-wide UI label",
  };

  if (root === "ui") {
    return `Site-wide UI — ${parts.slice(1).join(" ").replace(/_/g, " ")}`;
  }

  if (root === "meta") {
    return `Site metadata — ${parts.slice(1).join(" ").replace(/_/g, " ")}`;
  }

  if (root === "global") {
    const area = parts[1]?.replace(/_/g, " ") ?? "global";
    const detail = parts.slice(2).join(" › ").replace(/_/g, " ");
    return `Global — ${area}${detail ? ` › ${detail}` : ""}`;
  }

  if (root === "home") {
    const section = parts[1]?.replace(/_/g, " ") ?? "home";
    const detail = parts.slice(2).join(" › ").replace(/_/g, " ");
    return `Homepage — ${section}${detail ? ` › ${detail}` : ""}`;
  }

  if (root === "pages") {
    const page = parts[1]?.replace(/_/g, " ") ?? "page";
    const detail = parts.slice(2).join(" › ").replace(/_/g, " ");
    return `${page.charAt(0).toUpperCase() + page.slice(1)} page${detail ? ` › ${detail}` : ""}`;
  }

  return parts.join(" › ").replace(/_/g, " ");
}

function isStructuralString(key: string, value: string, parent: unknown): boolean {
  if (key === "href" || key === "src" || key === "headerSrc" || key === "footerSrc") return true;
  if (key === "action" || key === "embedUrl" || key === "directionsHref") return true;
  if (key === "dateIso" || key === "value") return true;
  if (key === "name" && parent && typeof parent === "object" && "type" in parent) return true;
  if (value.startsWith("/") || value.startsWith("http") || value.startsWith("tel:") || value.startsWith("mailto:")) {
    return key !== "label" && key !== "email" && key !== "phone";
  }
  if (key === "platform" || key === "variant" || key === "external" || key === "required") return true;
  if (/^[a-z0-9-]+$/.test(value) && (key === "slug" || key === "id")) return true;
  return false;
}

function arrayItemSegment(item: unknown, index: number): string {
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    if (typeof record.slug === "string") return sanitizeSegment(record.slug);
    if (typeof record.id === "string") return sanitizeSegment(record.id);
    if (typeof record.platform === "string") return sanitizeSegment(record.platform);
    if (typeof record.label === "string") return sanitizeSegment(record.label);
  }
  return String(index);
}

function registerCopy(id: string, text: string) {
  if (copyEntries.some((entry) => entry.id === id)) {
    const suffix = copyEntries.filter((entry) => entry.id.startsWith(id)).length;
    id = `${id}_${suffix}`;
  }
  copyEntries.push({ id, location: humanLocation(id), text });
  return `${COPY_PREFIX}${id}`;
}

function extractValue(value: unknown, path: string[], parent?: unknown): unknown {
  if (typeof value === "string") {
    const key = path[path.length - 1] ?? "text";
    if (!TEXT_KEYS.has(key) || isStructuralString(key, value, parent)) {
      return value;
    }
    const id = path.map(sanitizeSegment).join(".");
    return registerCopy(id, value);
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) {
      return value.map((item, index) => {
        const id = [...path, String(index)].map(sanitizeSegment).join(".");
        return registerCopy(id, item as string);
      });
    }
    return value.map((item, index) => {
      const segment = arrayItemSegment(item, index);
      return extractValue(item, [...path, segment], value);
    });
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = extractValue(child, [...path, key], value);
    }
    return result;
  }

  return value;
}

const siteStructure = extractValue(siteSource, []);

copyEntries.sort((a, b) => a.id.localeCompare(b.id));

const copyObject = Object.fromEntries(copyEntries.map((entry) => [entry.id, entry.text]));

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const csv = [
  "id,location,text",
  ...copyEntries.map((entry) =>
    [escapeCsv(entry.id), escapeCsv(entry.location), escapeCsv(entry.text)].join(","),
  ),
].join("\n");

const root = join(process.cwd());

writeFileSync(
  join(root, "src/content/copy.ts"),
  `/** Auto-generated from site.source.ts — edit content/website-copy.csv then run: npm run content:import */\n\nexport const copy = ${JSON.stringify(copyObject, null, 2)} as const;\n\nexport type CopyId = keyof typeof copy;\n`,
);

writeFileSync(
  join(root, "src/content/site.structure.ts"),
  `/** Auto-generated structure — non-text fields and copy references. Regenerate via: npm run content:export */\n\nexport const siteStructure = ${JSON.stringify(siteStructure, null, 2)} as const;\n`,
);

writeFileSync(join(root, "content/website-copy.csv"), `${csv}\n`);

console.log(`Extracted ${copyEntries.length} strings to content/website-copy.csv`);
