# OLD website update report — 2 November 2026

Implemented directly in E:/Website/CHDC-Old. No commit or push performed.

## Delivered

- Shared structured event sessions and exact canonical venue matching, used by event detail pages and the homepage/timetable.
- Only confirmed school sessions with published dates and complete times enter the timetable. Other County Hall venues remain separate.
- Week/Month/List preserved; Type/Day/Style filtering, independent Venue Booking attribute, internal event links and existing ClassManager workflow.
- Private occupancy supports anonymous labels without customer details or public booking actions. No private records invented.
- Festival programme retains all nine sessions; exactly three school sessions enter 24 October.
- Session-specific concert venues and organiser details; no series-wide school venue assumption.
- Empty date cells remain blank; old disclaimer removed; London time note retained.
- Venue Hire timetable link and availability explanation; shared licensed TikTok/Xiaohongshu icons.
- Authoring and maintenance documentation updated.

## Validation

- npm run content:export: PASS, 956 strings.
- npx tsx --test scripts/test-timetable.mts: PASS, 10 tests.
- Changed/new TypeScript files ESLint: PASS with 0 errors and 2 existing unused-variable warnings (extract-copy rootLabels and event page _i).
- Full npm run lint: NOT clean; 4 existing errors in unchanged MembershipSection.tsx, BookingOptionsDialog.tsx and TimetableGrid.tsx, plus 5 warnings. Errors concern set-state-in-effect and render-time refs.
- Final default npm run build: failed with Turbopack CSS worker process startup error (also reproduced outside sandbox).
- npm run build -- --webpack with network access: PASS, including TypeScript and 37 generated pages. No bundler configuration changes made. The initial sandbox Webpack attempt could not resolve Google Fonts.
- git diff --check: PASS.
- Browser: Week/Month/List navigation, combined Type/Day/Style filters, November 39 sessions, December exclusions, exact festival inclusion, internal session links and ClassManager dialog/link checked.
- Mobile Month at 390x844: readable stacked dates; no horizontal page overflow.
- Today marker: Mon 2 November, aria-current=date.
- Header/footer social URLs and accessible link labels preserved; decorative brand SVGs hidden from assistive technology.
- The ClassManager destination was checked without making a booking.

## Unresolved factual data

- Fandango, 23 October: confirmed school venue and 13:00 start, no confirmed end. Preserved on series page, excluded from timetable pending end time.
- Encounters, 25 September: Atrium, 13:00 start, end unknown; excluded because it is not at the school.
- Memory of China dates retained but session times unknown; Members' Terrace excluded regardless.
- No confirmed room IDs, private reservations or setup/teardown intervals supplied.
- No commercial rental flags inferred. Venue Bookings filter is supported but no current record is marked as a confirmed rental.
- Future monthly concerts have no invented dates, times or venues.

## Exact changed files

All paths below are relative to E:/Website/CHDC-Old; this report is included.
- `CONTENT.md`
- `content/website-copy.csv`
- `docs/licenses/simple-icons-CC0.md`
- `docs/old-website-update-report.md`
- `public/schedule.json`
- `README.md`
- `scripts/extract-copy.mts`
- `scripts/test-timetable.mts`
- `src/app/events/[slug]/page.tsx`
- `src/app/timetable/page.tsx`
- `src/app/venue-hire/page.tsx`
- `src/components/events/EventProgramme.tsx`
- `src/components/home/HomeTimetable.tsx`
- `src/components/icons/SocialIcons.tsx`
- `src/components/timetable/class-calendar.css`
- `src/components/timetable/ClassCalendar.tsx`
- `src/components/timetable/Timetable.tsx`
- `src/content/copy.ts`
- `src/content/event-sessions.ts`
- `src/content/site.source.ts`
- `src/content/site.structure.ts`
- `src/content/types.ts`
- `src/content/venues.ts`
- `src/lib/class-calendar/sessions.ts`
- `THIRD_PARTY_NOTICES.md`
- `website-copy.md`

## Subsequent user-requested inclusion change

School-organised events now appear regardless of venue. Memory of China (3–4 October), Dance Meets Arts (8 August), and Opening Day (10 September) are included. Event cards show actual venues; missing times are explicitly unconfirmed, not all-day occupancy. External venues never match the school Venue Bookings filter. This supersedes the original school-only rules above. Opening Day retains the documented County Hall venue, with the exact space and times unresolved.
