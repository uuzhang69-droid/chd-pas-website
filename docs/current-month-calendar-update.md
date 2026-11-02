# Current-month timetable update — 2 November 2026

## Completed
- November dated workshops: 14/21 November Tango 15:00–20:00; 28 November Performance 14:45–17:45. Exactly three one-off records.
- Homepage and timetable use request-time server timestamps, an uncached time endpoint and a shared monotonic client clock. Europe/London determines today and month; GMT/BST and midnight/month rollover are covered. Period navigation is removed. Month/List show current month; Week is clipped to current month.
- Retired public slugs: milonga-ojo-opening-night and ceramics-workshop-with-yasemin. Actual HTTP 404 verified; original data/media retained. Generic /events/milonga returns 200.
- Explicit calendarVisible allows approved public external discovery entries, while unknown venues, private external events, cancellations and unpublished entries remain excluded. These are not school occupancy.
- Existing historical data remain stored, but August/September/October activities cannot appear in the current November-only calendar.

## Verified event evidence
- Memory of China: 3 and 4 October 2026, 12:00–17:30 each day, Members’ Terrace. Both original programme image headings confirm these times. Image filenames appear reversed. Sunday internal calligraphy row ends at 18:00, conflicting with the overall heading and existing prose; retained overall 17:30 pending clarification.
- Opening Day: 10 September 2026, confirmed all-day, school venue. No invented clock times.
- Dance Meets Arts: 8 August 2026, 19:00–20:30, Members’ Terrace.
- Existing concert end times remain unknown; no new times inferred.
- No new school timetable overlaps found by the regression suite. Previous unknown September starts were not backfilled.

## Validation
- content:export: passed, 989 strings.
- TypeScript: passed.
- 24 regression tests passed, including historic boundaries, duplicate prevention, booking expiry, foreign offsets, GMT/BST, London midnight/month rollover and device clock independence.
- Production build: passed with npm run build -- --webpack; homepage, /timetable and /api/time are dynamic.
- Changed-file lint: no errors after correcting the request-time Server Component lint exception; existing unused _i warning in event page remains.
- Full npm run lint: 3 pre-existing errors in scripts/import-existing-data.mts, MembershipSection.tsx and TimetableGrid.tsx; 5 warnings. These unrelated files were not changed.
- git diff --check: passed (line-ending notices only).
- Browser: November 2026 displayed, three workshops with corrected times, no period navigation, empty dates blank, no captured console errors. Screenshot saved. Mobile styling retained; no new device-size visual test in this final verification.
- Local HTTP: time endpoint 200 with no-store; retired routes 404; generic milonga 200.
- SHA256 comparison against the start-of-turn inventory confirms Sanity files, CMS import scripts, package files and media unchanged.
- No commit, push, deployment or CMS import performed.

## Files changed this turn
- `CONTENT.md`
- `README.md`
- `content/website-copy.csv`
- `docs/current-month-calendar-update.md`
- `public/schedule.json`
- `scripts/test-current-month.mts`
- `scripts/test-timetable.mts`
- `src/app/api/time/route.ts`
- `src/app/events/[slug]/page.tsx`
- `src/components/tester-classes/ClassCard.tsx`
- `src/components/timetable/BookingOptionsDialog.tsx`
- `src/components/timetable/ClassCalendar.tsx`
- `src/components/timetable/Timetable.tsx`
- `src/content/copy.ts`
- `src/content/event-sessions.ts`
- `src/content/event-visibility.ts`
- `src/content/site.source.ts`
- `src/content/site.structure.ts`
- `src/content/site.ts`
- `src/content/types.ts`
- `src/lib/class-calendar/current-month.ts`
- `src/lib/class-calendar/server-clock.ts`
- `src/lib/class-calendar/sessions.ts`
- `src/lib/class-calendar/use-now.ts`

