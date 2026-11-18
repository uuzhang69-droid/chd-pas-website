# Timetable history and booking update — 2 November 2026

This report supersedes the earlier external-venue inclusion rule. Work was performed in the existing OLD Next.js project. Git status was clean before this turn. No commit or push was made.

## Current behaviour

- Trial Week (14–20 September): 13 one-off classes exactly matching the supplied table. No regular classes before 14 September.
- Transition (21–30 September): Chinese Dance Class 1 on Thursday 24 September, 19:30–20:00; Soft Training, 20:00–21:30. No other historical starts inferred.
- October: 12 weekly patterns, bounded to 1–31 October; 54 class occurrences. With school events there are 59 calendar entries.
- November: existing eight weekly classes retained, plus Saturday Yoga 13:00–14:30 and the three dated workshops. 39 total entries; every current weekly record is bounded through 30 November.
- December: no confirmed published schedule. A blank calendar is not a statement that classes have stopped permanently or that rooms are available.
- September has 18 calendar entries: 13 Trial Week classes, two Chinese Dance classes, all-day Opening Day, and two Milonga opening-night sessions.
- Only each session's canonical school venue qualifies. Memory of China and Dance Meets Arts remain on What's On at Members' Terrace, excluded from the school timetable.
- Festival programme retains all nine sessions; only its three school sessions on 24 October enter the timetable.
- Opening Day: 10 September at the school, explicitly confirmed all day by the user. Stored as allDay: true, without fabricated clock times.
- Milonga ¡Ojo!: 26 September, Pre-Milonga Workshop 19:00–20:00 and social milonga 20:00–23:00, each links to the new shared event page.
- Ceramics Workshop with Yasemin: 17 October, 16:30–18:00. School-organised with Yasemin Gava credited as collaborator. No rental relationship inferred.

## Evidence and unresolved details

The user's supplied tables are authoritative for Trial Week and October. Existing confirmed November content was preserved, including its differences from October.

ClassManager public pages were reviewed read-only:

- [Public class listing](https://my.classmanager.com/county-hall-dance-centre/classes?mode=enrol)
- [Chinese Dance package](https://my.classmanager.com/county-hall-dance-centre/packages/pkg_01m2zx74a51qfqbmmmgz7st871): 21 September–30 November 2026, Thursdays 19:30–20:00.
- [Chinese Dance Class 1](https://my.classmanager.com/county-hall-dance-centre/classes/cls_01m2vbf1vrkzf8r5rbsypv00sa): Thursday 19:30–20:00, Room 1; current future lessons 5, 12, 19, 26 November.
- The listing also shows the Soft Training package for 21 September–30 November and Thursday 20:00–21:30 classes. The first Thursday in that package is 24 September. Package/weekly pattern evidence supports the two September transition entries; it is not attendance evidence.

Not inferred:

- Exact September start dates for Tai Chi, Contemporary, Yoga and Tango: the public listing exposes a Sept–Nov season, not sufficient lesson-by-lesson historical evidence. Other September transition dates remain blank.
- ClassManager currently lists Contemporary 19:30–20:30, while the user's October table and existing November schedule use 19:40–20:40. The latter confirmed versions are retained.
- October Chinese Dance Class 1 is 18:30–20:00; November/current ClassManager is 19:30–20:00. These are retained as separate versions.
- October Wednesday Yoga ends 19:20 and Tango is Intermediate; the retained November local schedule ends Yoga at 19:30 and labels the later Tango Advanced. No unrequested overwrite.
- ClassManager additionally lists Saturday Tango Advanced 19:00–20:00. Adding this in November would overlap the confirmed 14/21 November workshops until 19:30. It has NOT been added to November pending confirmation of which sessions run. October Saturday Tango remains as supplied.
- Fandango (23 October) retains school venue and 13:00 start, but end time remains unknown and it is excluded from the timed calendar. Encounters remains Atrium, excluded regardless of its unknown end time.
- Tango Fever as Milonga organiser is still tentative; not published as fact. Hosted-at-school information is shown. Ceramics organiser/collaborator follows the user's explanation.
- New events use existing venue photographs, clearly labelled as venue images, rather than invented event photography. No unconfirmed booking links were added.
- No private reservations, setup/teardown or historical room assignments invented. Current Room 1 information was not retroactively imposed on every historical lesson.

## Booking lifecycle

booking-status.ts compares Europe/London local date and time, including summer/winter offsets and the exact end minute. Ongoing sessions are not offered a dated booking because late-entry rules are unconfirmed. Ended classes remain non-interactive; events keep detail links. Refresh occurs every second and on focus. The shared dialog rechecks at open and continuation and closes if booking becomes ineligible while open.

Homepage and /timetable use the same component. Tester-class fallback cards now use confirmed Trial Week dates and the same status helper; the sound-healing card is corrected to end at 13:15. Undated Airtable cards offer a generic upcoming-dates check rather than a session-specific enrolment claim. The legacy TimetableGrid has no imports/callers in the current site. Class style/course navigation and generic current-booking links are not individual dated sessions and remain available.

## Validation

- content:export: PASS, 989 strings generated.
- TypeScript (npx tsc --noEmit): PASS.
- 16 timetable tests: PASS, including all supplied Trial Week entries, historical boundaries, October/November versions, December, same-day start/end, BST/GMT, publication, cancellations, venue filtering, deduplication, private projection and event links.
- Timed interval audit: no overlaps in the implemented September–December school data. The unresolved additional ClassManager Saturday Tango conflict is described above and is not silently inserted.
- Targeted ESLint: PASS with no errors or warnings for changed timetable, booking, session and tester-class code.
- Default npm run build: Turbopack CSS worker startup failure, matching the existing environment issue.
- npm run build -- --webpack: PASS with network access for existing Google Fonts; TypeScript and all 39 generated pages succeeded. No bundler configuration change.
- git diff --check: PASS.
- Browser: September 18 entries, 15 ended class cards, zero dated booking buttons; all-day Opening Day label and both Milonga links verified. Milonga and Ceramics detail routes render correctly, including programme times and attribution. October combined workshop/Saturday filtering shows Ceramics, two festival workshops and Halloween.
- Upcoming Tai Chi dialog opens, membership choice reveals the unchanged ClassManager handoff URL; no booking submitted. Historical List and Week views have no dated booking buttons, while Halloween retains its detail link.
- Mobile Month viewport: 390x844, document width 376 <= viewport 391, no horizontal overflow; viewport restored afterward.
- Existing licensed TikTok/Xiaohongshu SVG paths, accessible labels and profile URLs retained. No asset changes needed.

## Changed files

Paths are relative to E:/Website/CHDC-Old. This is the exact file inventory for this turn.

- `CONTENT.md`
- `content/website-copy.csv`
- `docs/old-website-update-report.md`
- `docs/timetable-history-update.md`
- `public/schedule.json`
- `README.md`
- `scripts/extract-copy.mts`
- `scripts/test-timetable.mts`
- `src/components/events/EventProgramme.tsx`
- `src/components/tester-classes/ClassCard.tsx`
- `src/components/timetable/BookingOptionsDialog.tsx`
- `src/components/timetable/ClassCalendar.tsx`
- `src/content/copy.ts`
- `src/content/event-sessions.ts`
- `src/content/site.source.ts`
- `src/content/site.structure.ts`
- `src/content/types.ts`
- `src/lib/class-calendar/booking-status.ts`
- `src/lib/class-calendar/sessions.ts`
- `src/lib/class-calendar/use-now.ts`
- `src/lib/tester-classes/airtable.ts`
- `src/lib/tester-classes/seed-data.ts`
- `src/lib/tester-classes/types.ts`
