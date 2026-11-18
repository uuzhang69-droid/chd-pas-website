# English content QA audit

Date: 14 November 2026. Scope: the rendered public site, traced back to its source. Text was checked in
`src/content/copy.ts` (what the site shows), `src/content/site.source.ts` (the authoring copy of the same
text), `site.structure.ts`, `public/schedule.json` (Calendar), `src/content/events/*.ts`,
`src/content/event-sessions.ts` and text written directly in components.

Data flow, so edits stay in sync: the site shows `copy.ts` through the `@@COPY:` references in
`site.structure.ts`. `site.source.ts` is the authoring copy. Both were edited by hand for each fix; the
content export/import scripts were **not** run. The Calendar reads `public/schedule.json`. Event pages for
Acting Workshop, Within One Room and Lunchtime Concert Series are written directly in `src/content/events/`.
Membership tiers, prices and booking dialogs are written directly in components.

Severity: High = wrong or misleading for visitors; Medium = visible inconsistency; Low = polish.

## A. Clear errors

| # | Route | Original | Suggestion | Reason | Source | Severity | Status |
|---|-------|----------|------------|--------|--------|----------|--------|
| A1 | /timetable (Calendar, November) | Argentina Tango (Beginner) / (Advanced) | Argentine Tango (Beginner) / (Advanced) | The dance is "Argentine"; "Argentina" is the country | `public/schedule.json` lines 157, 167 | High | **Fixed** |
| A2 | /courses/teen-contemporary-intensive (meta description) | "…for teens at County Hall Dance." | "…at County Hall Dance Centre." | Brand name cut short | `site.source.ts`, `copy.ts` | Medium | **Fixed** |
| A3 | Booking form (select option) | General Enquire | General Enquiry | Wrong word class. The option value `general-enquire` was left alone because it is a form value. This form's page redirects to /contact, so the label is not currently shown | `site.source.ts` ~2348, `copy.ts` 228 | Low | **Fixed** (label only) |
| A4 | /classes/contemporary (instructor name) | "Christina & Yvonne␠" | "Christina & Yvonne" | Trailing space | `site.source.ts` 515, `copy.ts` 330 | Low | **Fixed** |
| A5 | /events (filter button) | Masterclass | Masterclasses | The other filters are plural (Events, Workshops) | `site.source.ts` 951, `site.structure.ts` 986 | Low | **Fixed** |
| A6 | /timetable (not shown) | "Class schedule for 14–20 September 2026 at County Hall Dance & Performing Arts School" | Delete or update | Out of date. `pages.timetable.booking.image.alt` is not used by any page | `copy.ts` 1370 | Low | Not changed (unused) |
| A7 | /membership (not shown) | £[TBC] / month, / quarter, / year | Delete | Placeholder data that is not rendered and contradicts the live tiers (see B1) | `copy.ts` (`pages.membership.overview.plans`) | Low | Not changed |
| A8 | /class-booking, /venue-hire/space-booking | "Content for this section is coming soon." (two sections each) | Write the sections or remove the pages | Unfinished placeholders on public, sitemap-listed pages | `ui.sectionedPage.comingSoon`; `pages.classBooking`, `pages.venueHire.subpages` | **High** | Not changed (content needed) |
| A9 | /events/milonga and five other category pages | Same "coming soon" text | Already `noindex`; finish or retire | Placeholders; not linked anywhere | `pages.events.categories` | Medium | Not changed |

No other spelling errors were found. A word-frequency pass, a regular-expression pass (US spellings,
doubled words, a/an, common misspellings, spacing, punctuation) and a full read of the rendered text found no
`center`, `program`, `organize`, `color`, `favorite`, `license`, double spaces, space-before-punctuation or
misspelt words. "enchaînements", "plié", "port de bras", "allegro", "barre", "Practilonga" and "Milonga" are
used correctly.

## B. Inconsistencies

| # | Where | Detail | Suggestion | Severity |
|---|-------|--------|------------|----------|
| B1 | /membership, home, meta | Live page sells three tiers (Try £29, Move £49, Connect £59 per month). Home quick action, meta description and the content data say "monthly, quarterly or annual plans" | Decide the real offer, then align all text (needs confirmation, see D2) | **High** |
| B2 | /membership vs /classes vs FAQ | Style strip lists Tai Chi, Tango, Contemporary, Yoga, Chinese Dance, **Meditation**, "and more…". Meta, intro and FAQ list "…Tai Chi and **K-Pop**". /classes lists five styles (no K-Pop, no Meditation); Private Lessons mentions a K-Pop routine | Confirm which styles are real, then use one list | High |
| B3 | Brand | "CHDPAS" is used without explanation in "New to CHDPAS?" (/timetable), "CHDPAS does not process class payments" (/timetable), "CHDPAS dance bag" (/membership). Footer says "The School"; About hero says "Our school"; the rest of the site says "the Centre" / "County Hall Dance Centre". CHDPAS is only explained on /about | Use "County Hall Dance Centre" on public pages, or explain CHDPAS once where it first appears | Medium |
| B4 | Event locations | Same venue named three ways: "County Hall Dance Centre" (Within One Room, Halloween), "County Hall Dance & Performing Arts School" (Acting Workshop), "2nd Floor, County Hall Main Entrance" (footer, Contact). Acting and Within One Room give "Riverside Building… 2nd Floor"; Halloween gives only "London SE1 7PB". Romantic Heart uses "London County Hall… SE1 7GP" (as supplied) | Confirm one standard venue name and address block | Medium |
| B5 | Teacher names | "Kasen" (name) vs "Kasen Zhao" (bio); "RCDance Lisa" vs "Lisa Lin"; "Rene" (no accent) on class pages vs "René" in the retired Milonga ¡Ojo! event; "Christina & Yvonne" vs two full names | Confirm how each teacher wants to be named and whether "René" has the accent | Medium |
| B6 | Tango teacher's partner | "Hiba" (class page) vs "René & Silvia" (retired event) | Confirm | Low |
| B7 | Times | Event dates use 12-hour ("7:30pm – 8:00pm", "1:00pm–5:00pm"), programmes and Calendar use 24-hour ("13:00"). Spacing around the dash also varies. 22 twelve-hour vs 227 twenty-four-hour times site-wide | Choose one format (24-hour matches the Calendar) | Low |
| B8 | Punctuation | 82 straight vs 21 curly apostrophes; 102 spaced em dashes vs 24 spaced en dashes (for example "central theme or idea – creating", Four Seasons); Oxford comma used in some lists only ("classes, masterclasses, and performances" vs "dance, movement and creativity") | Pick a house style | Low |
| B9 | Calendar names | October: "Tango Beginner / Intermediate / Advanced"; November: "Argentine Tango (Beginner / Advanced)". "Chinese Dance Class 1" vs "Chinese Dance (Class 1)". "Yoga (Therapeutic Yoga)" and "Yoga (Flow Yoga)" repeat the word. "Contemporary Dance" (Calendar) vs "Contemporary" (class page) | Standardise names once the timetable is confirmed | Low |
| B10 | Headings and buttons | "What's on" (overline, back link) vs "What's On" (title); "Classes Booking" / "Membership Booking" (form) vs "Class Booking" (page); Title Case in some buttons ("Book your class"), sentence case in others ("View what's on") | Pick one case style | Low |
| B11 | Social label | "Red Note (小红书)" in header and footer; the platform's own spelling is "RedNote" | Confirm preferred label | Low |
| B12 | K-Pop | Site writes "K-Pop"; the common spelling is "K-pop" | Confirm | Low |

## C. Style and naturalness (not changed)

- **Home**, about teaser: "Founded at the historic County Hall, our school brings together…" mixes "school" with the Centre brand.
- **/timetable**, hero: "Check each event's location and filter by type, day and style." reads awkwardly.
- **/venue-hire**: "Bookings are available until 18:00; evening bookings after 18:00 are not available." is repeated; "Sprung Wooden Floor Hall" is capitalised mid-sentence in the meta description; "facade" could be "façade".
- **/classes/yoga**: highlight "Music-guided practice" is followed by "A calm, focused environment for every body.", which does not describe music.
- **/membership**, FAQ: "We don't offer free trial classes, but you're welcome to book a trial class before you join." is confusing; the Timetable page offers a "taster trial".
- **/events/an-actors-work-with-an-object**: "present… through a live performance presentation" repeats itself; "intensive masterclass" vs "workshop" elsewhere.
- **/events/dance-meets-arts**: "the introduction of the County Hall Dance Centre" (article before the brand name).
- **/events/four-seasons-festival**: session title "Art and Craft and Movement Workshop for Children" (kept: it is an official session title).
- **/events/memory-of-china**: "17:00–17:30 … An evening performance" (17:00 is not evening); "The festival concludes with Dai dance" at 16:35 while the day runs to 17:30.

## D. Needs confirmation (not changed)

1. **/courses and four course pages look like sample data.** Evidence: Junior Ballet Foundation (ages 6–9), Teen Contemporary Intensive, Adult Ballet Open and Musical Theatre Performance have no teacher, are not in the Timetable, are not in /classes or Membership, use `/images/courses/*.svg` placeholder images, carry prices and terms (for example "£168 per term", "Spring Term 2027"), and the school otherwise describes itself as adult classes. The README says the project ships with placeholder content. They are linked from the footer and /classes, and listed in the sitemap. **Please confirm whether they are real.** No Course structured data was produced for them.
2. **Membership offer and prices** (B1).
3. **Which styles are taught** (B2).
4. **Walking time**: "a five-minute walk from Waterloo and Westminster" (Contact, Venue Hire). Check the claim.
5. **Teacher bios**: the Tai Chi teacher's bio (Xintian Zhao) describes ballet and choreography and never mentions Tai Chi; Lisa Lin's degree reads "Bachelor's degree in Dance and Practice"; Oleg Mirochnikov's "Senior Lecturer on the Performance programme" was an interpretation of the source text; "the UK's leading specialist" is a strong claim.
6. **Past events written in the future or present tense**: Halloween ("will feature", "Join us"), Memory of China ("comes to County Hall this October", "will host", "will be presented", "register in advance"), Dance Meets Arts ("will present", "Guests will have the opportunity"). Decide whether to rewrite them as archive pages.
7. **Unfinished public pages** (A8): finish, remove or `noindex` /class-booking and /venue-hire/space-booking.
8. **Venue facts** (300 m², 120 guests, £200 / £100 prices) are consistent across pages; confirm they are current.
9. **Founding gift**: "Offer ends 31 October 2026" is hidden automatically after 1 November; the copy "CHDPAS dance bag" is written in the component.

## SEO consistency

- Titles use the County Hall Dance Centre template; no old school name remains in any `<head>`, Open Graph tag or JSON-LD name except the Organization `name` (intentional).
- Page descriptions match page content; after the fix to A2 none is cut short. Image alt text contains no old brand name; the only empty `alt=""` is the decorative header logo.
- Canonical URLs match routes. The sitemap lists /class-booking and /venue-hire/space-booking, which contain placeholders (A8).
- Structured data dates, names and the Argentine Tango fix are consistent with visible content.
