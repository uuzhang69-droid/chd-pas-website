# Website copy (spreadsheet workflow)

All visitor-facing text is managed through a single spreadsheet.

## Files

| File | Purpose |
|------|---------|
| `content/website-copy.csv` | **Edit this** — the master copy spreadsheet |
| `src/content/copy.ts` | Generated TypeScript map (do not edit by hand) |
| `src/content/site.structure.ts` | Layout, URLs, images — non-text structure |
| `src/content/site.source.ts` | Source snapshot used to regenerate structure |
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
