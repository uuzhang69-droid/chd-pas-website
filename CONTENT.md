# Website copy (spreadsheet workflow)

Page copy can be edited through the CSV workflow below. Structural changes, new event fields and concert occurrences are authored in `src/content/site.source.ts`; the timetable is maintained separately in `public/schedule.json`.

## Files

| File | Purpose |
|------|---------|
| `content/website-copy.csv` | **Edit this** — the master copy spreadsheet |
| `src/content/copy.ts` | Generated TypeScript map (do not edit by hand) |
| `src/content/site.structure.ts` | Generated structure and copy references; do not edit by hand |
| `src/content/site.source.ts` | Authoring source for content, event metadata and new fields |
| `src/content/site.ts` | Resolves structure + copy at build time |

## Home page only (recommended starting point)

A smaller, easy-to-read spreadsheet with **just the homepage** text:

**File:** `content/home-page-copy.xlsx`

| Column | Editable? | Description |
|--------|-----------|-------------|
| `id` | **No** | Stable key — do not change |
| `location` | No | Plain-English note (e.g. "Slide 1 — big title at the top") |
| `text` | **Yes** | The wording on the page |

Sections are grouped and spaced in the sheet: Hero → Get Started → Events → Class Styles → About → Private Events → Newsletter.

After editing, copy your changed `text` values back into the matching rows in `content/website-copy.csv`, then run `npm run content:import`. (A dedicated home-page import script can be added when you're ready.)

Regenerate the home spreadsheet anytime:

```bash
npm run content:export-home
```

## How to edit copy (full site)

1. Open `content/website-copy.csv` in Excel, Google Sheets, or Numbers.
2. Edit **only** the `text` column. Do not change `id` or `location`.
3. Save as CSV (UTF-8).
4. Run: `npm run content:import`
5. Restart the dev server or rebuild.

## Spreadsheet columns

| Column | Editable? | Description |
|--------|-----------|-------------|
| `id` | **No** | Stable key used by the site (e.g. `home.hero.slides.classes.headline`) |
| `location` | No | Plain-English note showing where the text appears |
| `text` | **Yes** | The wording shown on the website |

## Regenerating from code

If you add new pages or text fields in `site.source.ts`, regenerate the spreadsheet:

```bash
npm run content:export
```

This updates `website-copy.csv`, `copy.ts`, and `site.structure.ts`. Review the CSV diff before committing — new rows will appear for new strings.


## Export and import are different workflows

`content:export` regenerates CSV, `copy.ts` and `site.structure.ts` from `site.source.ts`. `content:import` only updates `copy.ts` from CSV; it does not write changes back into the source. Before exporting, reconcile any CSV-only edits into `site.source.ts` so they are not overwritten. Commit generated files alongside the source. `website-copy.md` is a historical editorial brief, not the current runtime source.

## Event information (added 1 November 2026)

Keep `listingCategory` (`event`, `workshop`, `masterclass`) independent of these optional fields:

| Field | Meaning / display |
| --- | --- |
| `relationship` | `organised`: school-led; `collaboration`: jointly produced; `hosted`: school provides the venue |
| `organiser` | Full organisation name, under Organised by |
| `partners` | Full partner names, under In collaboration with |
| `hostedAt` | Confirmed hosting venue; displayed only when relationship is `hosted` |
| `promotedBy` | Promotion support only; does not imply hosting or co-organisation |

One-off events show this information at the bottom of their detail page. Four Seasons Festival is organised by County Hall Arts and hosted at County Hall Dance & Performing Arts School. Memory of China and Dance Meets Arts are school-led, with their collaborators listed separately. Do not invent promotion or partnership credits for events without confirmation.

### Recurring concerts

Use `pages.events.items[].occurrences` to retain individual programmes:

```ts
{
  id: "2026-10-23",
  title: "Fandango! Italian Virtuosity Meets Spanish Dance",
  date: "Friday 23 October 2026, 1pm",
  dateIso: "2026-10-23",
  location: "County Hall Dance & Performing Arts School, 2nd Floor, County Hall Main Entrance, Belvedere Road, London SE1 7PB",
  relationship: "hosted",
  organiser: "County Hall Arts",
  hostedAt: "County Hall Dance & Performing Arts School",
  description: ["Programme details…"],
}
```

Each occurrence supports its own `location`, `organiser`, `partners`, `relationship`, `hostedAt` and `promotedBy`. These are displayed inside that concert's card and are never inherited from the series. Omit unknown venues or relationships. Only 23 October's school venue is confirmed; do not apply it to September or future concerts.

When adding a confirmed concert, retain older entries, update the series introduction/Next Concert text, and update the listing `date`/`dateIso` in both `home.events.items` and `pages.events.items`. Those summary fields are maintained manually. Occurrences are grouped into upcoming and past on render; production prerendered pages require a rebuild/redeployment to refresh time-based groups. Never invent a next monthly date. Run `npm run content:export` and `npm run build`.

## Timetable data

`public/schedule.json` accepts legacy weekly tuples `[day, start, end, name, style]`, or weekly objects with optional inclusive `startDate`, `endDate` and `cancelledDates`. Day indices run Monday = 0 through Sunday = 6.

```json
{
  "classes": [
    { "day": 5, "start": "13:00", "end": "14:30", "name": "Yoga (Inside Flow)", "style": "Yoga", "startDate": "2026-11-01", "endDate": "2026-11-30" }
  ],
  "datedClasses": [
    { "date": "2026-11-14", "start": "14:30", "end": "19:30", "name": "Tango Workshop", "style": "Tango" }
  ]
}
```

Merge entries into the existing schedule; do not replace unrelated classes with this example. A dated entry may set `cancelled: true`. Dates use `YYYY-MM-DD`; times use London local `HH:mm`. Week/List show one week; Month shows all dates in the selected month. Both apply the same date bounds, cancellation rules and filters. November-only Yoga must not appear in December. New styles also need a filter option in `ClassCalendar.tsx` and, optionally, a colour in `src/lib/class-calendar/utils.ts`.
