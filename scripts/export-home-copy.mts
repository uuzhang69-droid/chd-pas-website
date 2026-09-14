/**
 * Export home-page copy to a formatted Excel spreadsheet.
 * Run: npx tsx scripts/export-home-copy.mts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { copy } from "../src/content/copy";
import { siteSource } from "../src/content/site.source";

function getText(id: string): string | undefined {
  if (id in copy) return copy[id as keyof typeof copy];
  // UI strings may still live in site.source until the next full content export
  const ui = siteSource.ui;
  const uiFallback: Record<string, string> = {
    "ui.hero.featuredhighlights": ui.hero.featuredHighlights,
    "ui.hero.slidenavigation": ui.hero.slideNavigation,
    "ui.hero.slideprefix": ui.hero.slidePrefix,
  };
  return uiFallback[id];
}

type RowDef = { id: keyof typeof copy; location: string };

/** Home page rows in top-to-bottom reading order on the page. */
const HOME_ROWS: Array<{ section: string; rows: RowDef[] }> = [
  {
    section: "HERO CAROUSEL (big banner at the top)",
    rows: [
      {
        id: "home.hero.slides.hero_intro.headline",
        location: "Slide 1 (intro) — big title at the top",
      },
      {
        id: "home.hero.slides.hero_intro.blurb",
        location: "Slide 1 (intro) — description under the title",
      },
      {
        id: "home.hero.slides.hero_intro.cta.label",
        location: "Slide 1 (intro) — button label",
      },
      {
        id: "home.hero.slides.hero_intro.image.alt",
        location: "Slide 1 (intro) — image description (accessibility)",
      },
      {
        id: "home.hero.slides.hero_classes.headline",
        location: "Slide 2 (Classes) — big title",
      },
      {
        id: "home.hero.slides.hero_classes.blurb",
        location: "Slide 2 (Classes) — description under the title",
      },
      {
        id: "home.hero.slides.hero_classes.cta.label",
        location: "Slide 2 (Classes) — button label",
      },
      {
        id: "home.hero.slides.hero_classes.image.alt",
        location: "Slide 2 (Classes) — image description (accessibility)",
      },
      {
        id: "home.hero.slides.hero_events.headline",
        location: "Slide 3 (Events) — big title",
      },
      {
        id: "home.hero.slides.hero_events.blurb",
        location: "Slide 3 (Events) — description under the title",
      },
      {
        id: "home.hero.slides.hero_events.cta.label",
        location: "Slide 3 (Events) — button label",
      },
      {
        id: "home.hero.slides.hero_events.image.alt",
        location: "Slide 3 (Events) — image description (accessibility)",
      },
      {
        id: "home.hero.slides.hero_private_lessons.headline",
        location: "Slide 4 (Private Lessons) — big title",
      },
      {
        id: "home.hero.slides.hero_private_lessons.blurb",
        location: "Slide 4 (Private Lessons) — description under the title",
      },
      {
        id: "home.hero.slides.hero_private_lessons.cta.label",
        location: "Slide 4 (Private Lessons) — button label",
      },
      {
        id: "home.hero.slides.hero_private_lessons.image.alt",
        location: "Slide 4 (Private Lessons) — image description (accessibility)",
      },
      {
        id: "home.hero.slides.hero_studio_hire.headline",
        location: "Slide 5 (Studio Hire) — big title",
      },
      {
        id: "home.hero.slides.hero_studio_hire.blurb",
        location: "Slide 5 (Studio Hire) — description under the title",
      },
      {
        id: "home.hero.slides.hero_studio_hire.cta.label",
        location: "Slide 5 (Studio Hire) — button label",
      },
      {
        id: "home.hero.slides.hero_studio_hire.image.alt",
        location: "Slide 5 (Studio Hire) — image description (accessibility)",
      },
      {
        id: "home.hero.slides.hero_membership.headline",
        location: "Slide 6 (Membership) — big title",
      },
      {
        id: "home.hero.slides.hero_membership.blurb",
        location: "Slide 6 (Membership) — description under the title",
      },
      {
        id: "home.hero.slides.hero_membership.cta.label",
        location: "Slide 6 (Membership) — button label",
      },
      {
        id: "home.hero.slides.hero_membership.image.alt",
        location: "Slide 6 (Membership) — image description (accessibility)",
      },
      {
        id: "home.hero.previouslabel",
        location: "Hero carousel — Previous slide button (accessibility)",
      },
      {
        id: "home.hero.nextlabel",
        location: "Hero carousel — Next slide button (accessibility)",
      },
      {
        id: "ui.hero.featuredhighlights",
        location: "Hero carousel — screen-reader label for the banner",
      },
      {
        id: "ui.hero.slidenavigation",
        location: "Hero carousel — screen-reader label for slide dots",
      },
      {
        id: "ui.hero.slideprefix",
        location: "Hero carousel — screen-reader prefix before slide number",
      },
    ],
  },
  {
    section: "GET STARTED (three quick-link cards below the hero)",
    rows: [
      { id: "home.quickactions.overline", location: "Small label above the section title" },
      { id: "home.quickactions.items.book_a_class.label", location: "Card 1 — title (Book a Class)" },
      {
        id: "home.quickactions.items.book_a_class.description",
        location: "Card 1 — short description",
      },
      { id: "home.quickactions.items.book_a_course.label", location: "Card 2 — title (Book a Course)" },
      {
        id: "home.quickactions.items.book_a_course.description",
        location: "Card 2 — short description",
      },
      { id: "home.quickactions.items.free_trial.label", location: "Card 3 — title (Free Trial)" },
      {
        id: "home.quickactions.items.free_trial.description",
        location: "Card 3 — short description",
      },
      { id: "home.quickactions.linksuffix", location: "Link text at the bottom of each card (e.g. Learn more →)" },
    ],
  },
  {
    section: "UPCOMING EVENTS (event cards section)",
    rows: [
      { id: "home.events.overline", location: "Small label above the section title" },
      { id: "home.events.title", location: "Section heading" },
      { id: "home.events.viewall.label", location: "View all events — link at the end of the row" },
      {
        id: "home.events.items.contemporary_intensive_maya_chen.title",
        location: "Event card 1 — event name",
      },
      {
        id: "home.events.items.contemporary_intensive_maya_chen.date",
        location: "Event card 1 — date",
      },
      {
        id: "home.events.items.contemporary_intensive_maya_chen.location",
        location: "Event card 1 — location",
      },
      {
        id: "home.events.items.contemporary_intensive_maya_chen.booknow.label",
        location: "Event card 1 — Book Now button",
      },
      {
        id: "home.events.items.contemporary_intensive_maya_chen.image.alt",
        location: "Event card 1 — image description (accessibility)",
      },
      {
        id: "home.events.items.junior_ballet_masterclass.title",
        location: "Event card 2 — event name",
      },
      {
        id: "home.events.items.junior_ballet_masterclass.date",
        location: "Event card 2 — date",
      },
      {
        id: "home.events.items.junior_ballet_masterclass.location",
        location: "Event card 2 — location",
      },
      {
        id: "home.events.items.junior_ballet_masterclass.booknow.label",
        location: "Event card 2 — Book Now button",
      },
      {
        id: "home.events.items.junior_ballet_masterclass.image.alt",
        location: "Event card 2 — image description (accessibility)",
      },
      {
        id: "home.events.items.musical_theatre_workshop_day.title",
        location: "Event card 3 — event name",
      },
      {
        id: "home.events.items.musical_theatre_workshop_day.date",
        location: "Event card 3 — date",
      },
      {
        id: "home.events.items.musical_theatre_workshop_day.location",
        location: "Event card 3 — location",
      },
      {
        id: "home.events.items.musical_theatre_workshop_day.booknow.label",
        location: "Event card 3 — Book Now button",
      },
      {
        id: "home.events.items.musical_theatre_workshop_day.image.alt",
        location: "Event card 3 — image description (accessibility)",
      },
      {
        id: "home.events.items.winter_showcase.title",
        location: "Event card 4 — event name",
      },
      {
        id: "home.events.items.winter_showcase.date",
        location: "Event card 4 — date",
      },
      {
        id: "home.events.items.winter_showcase.location",
        location: "Event card 4 — location",
      },
      {
        id: "home.events.items.winter_showcase.booknow.label",
        location: "Event card 4 — Book Now button",
      },
      {
        id: "home.events.items.winter_showcase.image.alt",
        location: "Event card 4 — image description (accessibility)",
      },
    ],
  },
  {
    section: "CLASS STYLES (row of five dance style tiles)",
    rows: [
      { id: "home.classstyles.overline", location: "Small label above the section title" },
      { id: "home.classstyles.title", location: "Section heading" },
      { id: "home.classstyles.subtitle", location: "Short line under the heading" },
      { id: "home.classstyles.items.contemporary.name", location: "Tile 1 — style name (Contemporary)" },
      {
        id: "home.classstyles.items.contemporary.image.alt",
        location: "Tile 1 — image description (accessibility)",
      },
      { id: "home.classstyles.items.chinese_dance.name", location: "Tile 2 — style name (Chinese Dance)" },
      {
        id: "home.classstyles.items.chinese_dance.image.alt",
        location: "Tile 2 — image description (accessibility)",
      },
      { id: "home.classstyles.items.tango.name", location: "Tile 3 — style name (Tango)" },
      { id: "home.classstyles.items.tango.image.alt", location: "Tile 3 — image description (accessibility)" },
      { id: "home.classstyles.items.yoga.name", location: "Tile 4 — style name (Yoga)" },
      { id: "home.classstyles.items.yoga.image.alt", location: "Tile 4 — image description (accessibility)" },
      { id: "home.classstyles.items.tai_chi.name", location: "Tile 5 — style name (Tai Chi)" },
      { id: "home.classstyles.items.tai_chi.image.alt", location: "Tile 5 — image description (accessibility)" },
    ],
  },
  {
    section: "ABOUT TEASER (Our story section with photo)",
    rows: [
      { id: "home.aboutteaser.overline", location: "Small label above the section title" },
      { id: "home.aboutteaser.title", location: "Section heading" },
      { id: "home.aboutteaser.body.0", location: "First paragraph" },
      { id: "home.aboutteaser.body.1", location: "Second paragraph" },
      { id: "home.aboutteaser.cta.label", location: "Button label (About the school)" },
      {
        id: "home.aboutteaser.image.alt",
        location: "Photo description (accessibility)",
      },
    ],
  },
  {
    section: "PRIVATE EVENTS (Celebrate with us promo block)",
    rows: [
      { id: "home.privateevents.overline", location: "Small label above the section title" },
      { id: "home.privateevents.title", location: "Section heading" },
      { id: "home.privateevents.body", location: "Description paragraph" },
      { id: "home.privateevents.cta.label", location: "Button label (Enquire)" },
      {
        id: "home.privateevents.image.alt",
        location: "Photo description (accessibility)",
      },
    ],
  },
  {
    section: "NEWSLETTER & SOCIAL (sign-up band at the bottom)",
    rows: [
      { id: "home.newsletter.overline", location: "Small label above the section title" },
      { id: "home.newsletter.title", location: "Section heading" },
      { id: "home.newsletter.description", location: "Description under the heading" },
      { id: "home.newsletter.placeholder", location: "Email input placeholder text" },
      { id: "home.newsletter.submitlabel", location: "Sign up button label" },
      { id: "home.newsletter.socialheading", location: "Heading above social media icons" },
    ],
  },
];

const root = join(process.cwd());
const outPath = join(root, "content/home-page-copy.xlsx");

const workbook = new ExcelJS.Workbook();
workbook.creator = "County Hall Dance Centre";
workbook.created = new Date();

const sheet = workbook.addWorksheet("Home page", {
  views: [{ state: "frozen", ySplit: 1 }],
});

sheet.columns = [
  { header: "id", key: "id", width: 42 },
  { header: "location", key: "location", width: 52 },
  { header: "text", key: "text", width: 72 },
];

const header = sheet.getRow(1);
header.height = 24;
header.font = { bold: true, size: 12, color: { argb: "FF292526" } };
header.fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF8F4F0" },
};
header.alignment = { vertical: "middle", wrapText: true };
header.eachCell((cell) => {
  cell.border = {
    bottom: { style: "thin", color: { argb: "FFCFA7A3" } },
  };
});

let rowNumber = 2;
const missing: string[] = [];

for (const section of HOME_ROWS) {
  const sectionRow = sheet.getRow(rowNumber);
  sectionRow.height = 22;
  sheet.mergeCells(rowNumber, 1, rowNumber, 3);
  const sectionCell = sectionRow.getCell(1);
  sectionCell.value = section.section;
  sectionCell.font = { bold: true, size: 11, color: { argb: "FF5A1F2B" } };
  sectionCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8D3D0" },
  };
  sectionCell.alignment = { vertical: "middle", wrapText: true };
  rowNumber += 1;

  // Spacer row between section header and content
  sheet.getRow(rowNumber).height = 6;
  rowNumber += 1;

  for (const row of section.rows) {
    const text = getText(row.id);
    if (text === undefined) {
      missing.push(row.id);
      continue;
    }

    const dataRow = sheet.getRow(rowNumber);
    dataRow.height = 28;
    dataRow.getCell(1).value = row.id;
    dataRow.getCell(2).value = row.location;
    dataRow.getCell(3).value = text;

    dataRow.getCell(1).font = { size: 10, color: { argb: "FF888888" } };
    dataRow.getCell(2).font = { size: 11, color: { argb: "FF292526" } };
    dataRow.getCell(3).font = { size: 11, color: { argb: "FF292526" } };

    [1, 2, 3].forEach((col) => {
      dataRow.getCell(col).alignment = { vertical: "top", wrapText: true };
    });

    rowNumber += 1;
  }

  // Spacer between sections
  sheet.getRow(rowNumber).height = 10;
  rowNumber += 1;
}

sheet.autoFilter = { from: "A1", to: "C1" };

await workbook.xlsx.writeFile(outPath);

// Also write a simple CSV backup for easy diffing
const csvLines = ["id,location,text"];
for (const section of HOME_ROWS) {
  for (const row of section.rows) {
    const text = getText(row.id);
    if (text === undefined) continue;
    const escaped = `"${text.replace(/"/g, '""')}"`;
    csvLines.push(`${row.id},"${row.location.replace(/"/g, '""')}",${escaped}`);
  }
}
writeFileSync(join(root, "content/home-page-copy.csv"), `${csvLines.join("\n")}\n`);

if (missing.length) {
  console.warn("Missing copy ids:", missing.join(", "));
}

console.log(`Wrote ${rowNumber - 1} rows to content/home-page-copy.xlsx`);
