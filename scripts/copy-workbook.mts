/**
 * Shared Excel / CSV helpers for website copy.
 */

import { writeFileSync } from "node:fs";
import ExcelJS from "exceljs";

export type CopyRow = { id: string; location: string; text: string };

export const COPY_HEADERS = ["id", "location", "text"] as const;

const SECTION_FILL = "FFE8D3D0";
const HEADER_FILL = "FFF8F4F0";
const ID_FILL = "FFF3F1EF";
const TEXT_FILL = "FFFFFBEA";
const BURGUNDY = "FF5A1F2B";
const CHARCOAL = "FF292526";
const MUTED = "FF888888";

export function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: CopyRow[]): string {
  return [
    COPY_HEADERS.join(","),
    ...rows.map((row) =>
      [escapeCsv(row.id), escapeCsv(row.location), escapeCsv(row.text)].join(","),
    ),
  ].join("\n");
}

export function writeCsvFile(path: string, rows: CopyRow[]): void {
  writeFileSync(path, `${toCsv(rows)}\n`);
}

function sectionTitleForId(id: string): string {
  if (id.startsWith("meta.")) return "SITE METADATA (browser tab & search engines)";
  if (id.startsWith("global.utilitybar.")) return "TOP BAR (phone, email, find us, social)";
  if (id.startsWith("global.logo.")) return "LOGO & SCHOOL NAME";
  if (id.startsWith("global.navigation.")) return "MAIN NAVIGATION (header menu)";
  if (id.startsWith("global.footer.")) return "FOOTER";
  if (id.startsWith("home.hero.")) return "HOMEPAGE — HERO CAROUSEL";
  if (id.startsWith("home.quickactions.")) return "HOMEPAGE — GET STARTED";
  if (id.startsWith("home.events.")) return "HOMEPAGE — UPCOMING EVENTS";
  if (id.startsWith("home.classstyles.")) return "HOMEPAGE — CLASS STYLES";
  if (id.startsWith("home.aboutteaser.")) return "HOMEPAGE — ABOUT TEASER";
  if (id.startsWith("home.privateevents.")) return "HOMEPAGE — PRIVATE EVENTS";
  if (id.startsWith("home.newsletter.")) return "HOMEPAGE — NEWSLETTER";
  if (id.startsWith("pages.common.")) return "SHARED PAGE LABELS";
  if (id.startsWith("pages.studiohire.")) return "STUDIO HIRE";
  if (id.startsWith("pages.classesinfo.")) return "CLASS DESCRIPTIONS & INSTRUCTORS";
  if (id.startsWith("pages.classbooking.")) return "CLASS BOOKING";
  if (id.startsWith("pages.classes.")) return "CLASSES";
  if (id.startsWith("pages.tasterclasses.")) return "TASTER CLASSES";
  if (id.startsWith("pages.timetable.")) return "TIMETABLE & BOOKING";
  if (id.startsWith("pages.courses.")) return "COURSES";
  if (id.startsWith("pages.membershipterms.")) return "MEMBERSHIP TERMS";
  if (id.startsWith("pages.membership.")) return "MEMBERSHIP";
  if (id.startsWith("pages.privatelessons.")) return "PRIVATE LESSONS & EXPERIENCES";
  if (id.startsWith("pages.shop.")) return "SHOP";
  if (id.startsWith("pages.about.")) return "ABOUT US";
  if (id.startsWith("pages.joinus.")) return "JOIN US";
  if (id.startsWith("pages.events.")) return "EVENTS";
  if (id.startsWith("pages.booking.")) return "BOOKING & ENQUIRIES";
  if (id.startsWith("pages.contact.")) return "CONTACT";
  if (id.startsWith("pages.faq.")) return "FAQ";
  if (id.startsWith("pages.giftcards.")) return "GIFT CARDS";
  if (id.startsWith("ui.")) return "SITE-WIDE UI (buttons, forms, accessibility labels)";
  return "OTHER";
}

function applyHeaderRow(row: ExcelJS.Row): void {
  row.height = 24;
  row.font = { bold: true, size: 12, color: { argb: CHARCOAL } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  row.alignment = { vertical: "middle", wrapText: true };
  row.eachCell((cell) => {
    cell.border = { bottom: { style: "thin", color: { argb: "FFCFA7A3" } } };
    cell.protection = { locked: true };
  });
}

function applySectionRow(sheet: ExcelJS.Worksheet, rowNumber: number, title: string): void {
  sheet.mergeCells(rowNumber, 1, rowNumber, 3);
  const row = sheet.getRow(rowNumber);
  row.height = 22;
  const cell = row.getCell(1);
  cell.value = title;
  cell.font = { bold: true, size: 11, color: { argb: BURGUNDY } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SECTION_FILL } };
  cell.alignment = { vertical: "middle", wrapText: true };
  cell.protection = { locked: true };
  row.getCell(2).protection = { locked: true };
  row.getCell(3).protection = { locked: true };
}

function applyDataRow(row: ExcelJS.Row, entry: CopyRow): void {
  row.height = Math.min(72, 22 + Math.floor(entry.text.length / 80) * 14);
  row.getCell(1).value = entry.id;
  row.getCell(2).value = entry.location;
  row.getCell(3).value = entry.text;

  row.getCell(1).font = { size: 10, color: { argb: MUTED }, name: "Calibri" };
  row.getCell(2).font = { size: 11, color: { argb: CHARCOAL } };
  row.getCell(3).font = { size: 11, color: { argb: CHARCOAL } };

  row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: ID_FILL } };
  row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: ID_FILL } };
  row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEXT_FILL } };

  row.getCell(1).protection = { locked: true };
  row.getCell(2).protection = { locked: true };
  row.getCell(3).protection = { locked: false };

  [1, 2, 3].forEach((col) => {
    row.getCell(col).alignment = { vertical: "top", wrapText: true };
  });
}

export async function writeWorkbook(path: string, rows: CopyRow[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "County Hall Dance & Performing Arts School";
  workbook.created = new Date();

  const guide = workbook.addWorksheet("How to use", {
    views: [{ showGridLines: false }],
  });
  guide.columns = [{ width: 92 }];
  const guideLines = [
    "How to edit website text",
    "",
    "1. Open the “Website copy” sheet.",
    "2. Edit ONLY the yellow “text” column. That is the wording visitors see.",
    "3. Do not change the grey “id” column — the website uses it to find each string.",
    "4. “location” is a note of where the text appears. You do not need to edit it.",
    "5. Save this file, then a developer runs: npm run content:import",
    "",
    "Tips",
    "• The copyright line can include {year} — the site replaces that with the current year.",
    "• Filter the location column to jump to a page (e.g. type “Homepage” or “FAQ”).",
    "• After import, restart or refresh the local site to see your wording.",
  ];
  guideLines.forEach((line, index) => {
    const row = guide.getRow(index + 1);
    row.getCell(1).value = line;
    row.getCell(1).font =
      index === 0
        ? { bold: true, size: 16, color: { argb: BURGUNDY } }
        : { size: 12, color: { argb: CHARCOAL } };
    row.height = index === 0 ? 28 : 20;
  });

  const sheet = workbook.addWorksheet("Website copy", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "id", key: "id", width: 54 },
    { header: "location", key: "location", width: 62 },
    { header: "text", key: "text", width: 78 },
  ];
  applyHeaderRow(sheet.getRow(1));

  let rowNumber = 2;
  let lastSection = "";
  for (const entry of rows) {
    const section = sectionTitleForId(entry.id);
    if (section !== lastSection) {
      if (lastSection) {
        sheet.getRow(rowNumber).height = 8;
        rowNumber += 1;
      }
      applySectionRow(sheet, rowNumber, section);
      rowNumber += 1;
      lastSection = section;
    }
    applyDataRow(sheet.getRow(rowNumber), entry);
    rowNumber += 1;
  }

  sheet.autoFilter = { from: "A1", to: "C1" };

  await sheet.protect("", {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: true,
    formatColumns: true,
    formatRows: true,
    sort: true,
    autoFilter: true,
  });

  await workbook.xlsx.writeFile(path);
}

export function parseCsv(content: string): CopyRow[] {
  const rows: CopyRow[] = [];
  const normalised = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalised.split("\n");
  if (!lines.length) return rows;

  const header = lines.shift()?.replace(/^\uFEFF/, "");
  if (header !== "id,location,text") {
    throw new Error('Expected header row: id,location,text');
  }

  let i = 0;
  while (i < lines.length) {
    const { fields, nextIndex } = readCsvRecord(lines, i);
    i = nextIndex;
    if (!fields.length || fields.every((field) => field.trim() === "")) continue;
    const [id, location, ...textParts] = fields;
    if (!id || !id.includes(".")) continue;
    rows.push({ id, location: location ?? "", text: textParts.join(",") });
  }
  return rows;
}

function readCsvRecord(lines: string[], start: number): { fields: string[]; nextIndex: number } {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === "," && fields.length < 2) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    if (inQuotes) {
      current += "\n";
      index += 1;
      continue;
    }
    fields.push(current);
    return { fields, nextIndex: index + 1 };
  }

  fields.push(current);
  return { fields, nextIndex: lines.length };
}

export async function readWorkbook(path: string): Promise<CopyRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const sheet =
    workbook.getWorksheet("Website copy") ??
    workbook.worksheets.find((item) => item.name !== "How to use") ??
    workbook.worksheets[0];
  if (!sheet) {
    throw new Error("Spreadsheet has no worksheets");
  }

  const header = sheet.getRow(1);
  const idCol = findColumn(header, "id") ?? 1;
  const locationCol = findColumn(header, "location") ?? 2;
  const textCol = findColumn(header, "text") ?? 3;

  const rows: CopyRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const id = cellString(row.getCell(idCol));
    if (!id || !id.includes(".")) return;
    rows.push({
      id,
      location: cellString(row.getCell(locationCol)),
      text: cellString(row.getCell(textCol)),
    });
  });
  return rows;
}

function findColumn(header: ExcelJS.Row, name: string): number | undefined {
  let found: number | undefined;
  header.eachCell((cell, colNumber) => {
    if (String(cell.value ?? "").trim().toLowerCase() === name) {
      found = colNumber;
    }
  });
  return found;
}

function cellString(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part: { text?: string }) => part.text ?? "").join("");
  }
  return String(value);
}
