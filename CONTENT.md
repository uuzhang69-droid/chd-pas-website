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

## Shared event sessions (updated 2 November 2026)

`src/content/event-sessions.ts` is the single programme source for both event details and the school timetable. `site.source.ts` attaches `publicSessionsForEvent(eventSlug)` to each relevant event's `sessions`. The exporter produces copy/structure, `site.ts` resolves it, and gallery enrichment preserves the sessions. `EventProgramme` renders each date's venue and attribution. Do not maintain an identical event session in `schedule.json`.

The previous concert `occurrences` have been migrated to this shared `EventSession` model. Existing programmes and descriptions are retained. Add future concerts to the same series slug; never infer the venue of a new concert from an earlier one.

```ts
{
  id: "unique-stable-session-id",
  eventSlug: "existing-parent-event-slug",
  title: "Confirmed programme title",
  date: "YYYY-MM-DD", // Europe/London local date
  start: "HH:mm",    // omit if unknown
  end: "HH:mm",      // omit if unknown; never guess
  venueId: "county-hall-dance-school", // only after confirmation
  type: "event",     // class | workshop | event
  subtype: "concert",
  published: true,
  organiser: "Full organisation name",
  // relationship: organised | collaboration | hosted
  // partners: ["Full organisation name"], promotedBy: "Full organisation name"
  // venueBooking: true ONLY when the venue booking arrangement is confirmed
  // spaceId, bookingUrl, setupStart, teardownEnd: only if confirmed
  description: ["Programme details"],
}
```

### Venue registry and attribution

Canonical IDs live in `src/content/venues.ts`: `county-hall-dance-school`, `county-hall`, `county-hall-atrium`, `members-terrace`, `kiln-courtyard`, `private-cinema`. Full school display name: **County Hall Dance & Performing Arts School**. Legacy aliases use exact matching; unknown strings and generic County Hall never map to the school. `spaces` is empty until actual rooms and venue associations are verified.

The What's On activity filters remain Events / Workshops / Masterclasses. Attribution is separate, shown beneath programme/event details: Organised by, In collaboration with, Hosted at, Promoted by. Use full names. `venueBooking` is an independent attribute, not a type; hosting or collaboration does not prove a paid rental.

### Public timetable inclusion

`Timetable.tsx` is the server wrapper used on the homepage and `/timetable`. It projects resolved event sessions through `schoolEventSessions` and passes only safe calendar fields to `ClassCalendar`. Inclusion requires `published: true`, not cancelled and a valid date. Hosted sessions require the school venue ID and complete valid times. Public sessions explicitly marked `relationship: "organised"` with the full school organiser name also appear at other venues; missing times are shown as Time to be confirmed, never as all-day occupancy. No description keyword matching or parent-level venue inheritance. Overnight activities must be split into dated sessions when that support is needed.

Each unique session ID produces at most one entry, even when it matches both Event and Venue Booking. Regular classes and schedule-only workshops retain their existing ClassManager dialog. Shared event sessions link to `/events/{eventSlug}#session-{id}`. Never duplicate an event session in the legacy schedule.

Private bookings can be recorded with `private: true`, an appropriate activity type, a confirmed date/time/school venue and `published: true` to expose anonymous occupancy. They must contain no customer personal information in this repository. They are excluded from generated client content; the server supplies only a generic Private booking card, with no event link or booking action. `setupStart` and `teardownEnd`, when supplied, are displayed as additional occupancy bounds. Nothing is inferred as free or available. Do not add example/private/maintenance reservations as real production data.

### Confirmed historical coverage and missing data

- Four Seasons has nine programme sessions. Only the three school sessions on 24 October (11:00–12:00, 14:00–15:30, 16:00–17:30) enter the timetable. Autumn Flow and Sound is a collaboration with the school and Sen Yoga, not a confirmed commercial rental. Festival-wide hosting has been removed.
- Encounters, 25 September: County Hall Atrium, start 13:00, end unknown. Excluded.
- Fandango, 23 October: school venue/address retained, start 13:00, end unknown. Programme remains visible; timetable inclusion awaits its end time.
- Memory of China (3–4 October) and Dance Meets Arts (8 August) appear in the timetable as school-organised events, with Members’ Terrace shown on their cards. Opening Day (10 September) also appears; only County Hall is documented as its venue, and its time is unknown.
- Halloween's already documented school session is 31 October, 13:00–17:00.
- No confirmed private bookings, setup/teardown, room IDs, or new future concerts have been invented. Venue Booking is deliberately not enabled for unconfirmed rental arrangements.

After adding a session, attach `publicSessionsForEvent` to its parent event if necessary; update any manually maintained homepage/event summary date and Next Concert text. Run `npm run content:export`, `npx tsx --test scripts/test-timetable.mts` and `npm run build`. Review generated diffs and deploy for production changes. Do not edit generated sessions separately.

## Timetable data

`public/schedule.json` accepts legacy weekly tuples `[day, start, end, name, style]`, or weekly objects with optional inclusive `startDate`, `endDate` and `cancelledDates`. Day indices run Monday = 0 through Sunday = 6.

```json
{
  "classes": [
    { "day": 5, "start": "13:00", "end": "14:30", "name": "Yoga (Inside Flow)", "style": "Yoga", "startDate": "2026-11-01", "endDate": "2026-11-30" }
  ],
  "datedClasses": [
    { "date": "2026-11-14", "start": "14:30", "end": "19:30", "name": "Tango Workshop", "style": "Tango", "type": "workshop" }
  ]
}
```

Merge entries into the existing schedule; do not replace unrelated classes with this example. A dated entry may set `cancelled: true`. Dates use `YYYY-MM-DD`; times use London local `HH:mm`. Week/List show one week; Month shows all dates in the selected month. All views apply the same date bounds, cancellation rules and filters. November-only Yoga must not appear in December. New styles also need a filter option in `ClassCalendar.tsx` and, optionally, a colour in `src/lib/class-calendar/utils.ts`.


The Timetable Type filter offers Classes, Workshops, Events and Venue Bookings. Day/Style filters compose with it. Empty date cells retain the date heading but no placeholder sentence. Today remains highlighted. Month view stacks dates on mobile. Venue Hire links to the timetable as an occupancy overview, explicitly requiring contact to confirm availability; empty slots and unknown rooms are not availability promises.

Social icons share `SocialIcons.tsx` in the header utility bar, footer and newsletter. TikTok and Xiaohongshu use licensed brand paths; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

School-organised events at external venues are discovery entries, not school occupancy. The Venue Bookings filter and setup/teardown bounds apply only to confirmed school sessions with complete times. Calendar cards show event venue names.
