# Phase 1 release report

Branch: `release/site-layout-classes-events` (built from `origin/main` at `44ce38f`; 18 November 2026)

## Status

- The branch is **committed locally and verified, but NOT pushed to GitHub.** The push stopped because Git could not get GitHub credentials in this session (a non-interactive retry ended with "could not read Password ... terminal prompts disabled"). Manual sign-in is needed, then:

  ```
  git push -u origin release/site-layout-classes-events
  ```

  Run it from `E:\Website\CHDC-Old-release` (a separate Git worktree of the same repository).
- Nothing was merged into `main`, nothing was deployed, no production setting was changed, and no history was rewritten or force-pushed.
- `fix/contact-form-validation` and its uncommitted files were left untouched.

## Commits on top of origin/main (author Alice, no Co-authored-by or AI attribution)

| Hash | Message |
| --- | --- |
| `b5e61e2` | fix(contact): clearer form validation, error messages and send limits (cherry-pick of `2cc033a`) |
| `9cc0597` | fix(contact): clean pasted mail settings (quotes, spaces, line breaks) (cherry-pick of `302c050`) |
| `a9f8c8e` | feat(layout): unified page layout, typography and shared components |
| `24f8bb0` | feat(classes): class and course pages, content and copy tooling |
| `aafe632` | feat(events): event cards, programme sections and booking links |
| `b6777bf` | test(site): class, content-export and events tests, and release documentation |

A seventh commit adds this report. The intermediate commits were not each built on their own; the final tree was.

## What is included

- Contact Form fixes (validation, messages, send limits, cleaning of pasted mail settings).
- Unified page layout and typography, shared hero, section and card components.
- Class and Course pages, their images, the site copy and types, and the copy export tools.
- Event cards, programme sections, "X to Y" times and booking links. The Within One Room Eventbrite URL `https://www.eventbrite.co.uk/e/within-one-room-stillness-in-motion-tickets-2004916771033` is intact.
- Timetable and calendar presentation changes that use the existing static data.
- Tests (`test-classes`, `test-content-export`, `test-events`) and documentation.

## What is excluded (verified: no difference from main in any of these paths)

- Sanity: `sanity.config.ts`, `sanity.cli.ts`, `sanity/**`, the Studio layout, `scripts/import-existing-data.mts`, `scripts/import-schedule.mjs`.
- `package.json` and `package-lock.json` (no new dependencies).
- Newsletter and Admin: `src/app/admin`, `src/app/api/admin`, `src/app/api/newsletter`, `src/app/newsletter`, `src/lib/newsletter`, `src/lib/admin`, `src/lib/supabase`, `src/components/admin`, `src/components/newsletter`, the Newsletter form, Footer, `features.ts`, `next.config.ts`, `.env.example`, `.gitignore`.
- Supabase migrations (`supabase/**`).
- The Privacy Policy page and `legal-pages.ts`.
- Untracked files: `public/images/temp/`, `public/CHDPAS.jpg`, `docs/design-review/`.

Compared with `origin/main`: 83 files changed (3582 insertions, 1498 deletions), all inside the included areas.

## Verification (on the release tree)

| Check | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | pass |
| Full ESLint | pass, 0 problems |
| Tests | 107 of 107 pass: classes 9, contact 24, content-export 3, current-month 6, events 16, search 12, seo 17, timetable 20 |
| Production build (`next build`) | pass; no `/admin`, `/privacy` or Newsletter routes in the route list |
| Page smoke test (21 pages) | all respond; `/admin`, `/privacy`, `/newsletter/*` and the Newsletter and Admin API routes return 404; no Newsletter sign-up form and no link to `/privacy` or `/admin` on any page; sitemap lists none of them |
| `/studio` | status and key headers match the live site (main) |
| Eventbrite links | all 5 Eventbrite URLs on the live `/`, `/events`, `/timetable` and two event pages are present in the release |
| Images | all 536 image URLs on 21 pages load |
| Horizontal overflow | none at 375 px (12 pages) or 1280 px (9 pages); carousels scroll inside their own box by design |
| Contact Form, local mock only | 10 of 10: field errors, bot and speed traps, a valid message reaches the mock mail provider once, nothing sent for rejected requests, send limit still applies |

Notes on three smoke-test results that looked like failures:

- `schedule.json` differs by Windows line endings only (identical to the live file once carriage returns are removed; Git sees no change).
- `/api/contact` answered 503 `not_configured` in the plain smoke test because that server had no mail settings (the correct safe response). The same route passes the 10 checks above with fake local settings.

The contact tests used fake settings, a mock database and a mock mailbox, with every non-local connection blocked. No real email was sent.

## Remaining issues and approvals needed

1. **Push:** needs GitHub sign-in (see Status). Then a pull request into `main` can be opened.
2. Confirm in Vercel that `NEWSLETTER_ONLINE_SIGNUP_LIVE` is not `true` for Production (this branch has no Newsletter code, but main's footer flag still exists).
3. Intermediate commits are not individually build-verified.
4. Visual sign-off on layout and typography is still yours; there is no automated visual regression test.
5. Newsletter, Admin, Supabase, Sanity and the Privacy Policy remain unreleased on `fix/contact-form-validation`.

## Refinement round (18 November 2026)

- **Timetable and Membership:** the shared container had narrowed both from about 90 percent of the screen (1283 px at 1440 px wide) to 1088 px, so every calendar cell and membership card was about 16 percent narrower and felt crowded. They now use `<Container wide>` (same gutters and centring, maximum `--page-width-wide: 84rem`). Measured against the live site at 1440 px: calendar panel 1280 px (was 1283), day cell 179 x 125 px (identical), membership card 412 px (was 413). At 768 px the Membership layout is identical and the calendar is 706 px (live 679 px); at 375 px both are within 3 px of the live site. No data, price, date, booking URL or behaviour changed.
- **Membership on phones:** a leftover `padding: 50px 5%` in the 700 px media query doubled the side margins once the shared container was added. It is now `50px 0`.
- **Class category divider:** the divider between the introduction and the Beginner / Advanced (or other format) section was already present in this branch (a 1 px line in the design-system border colour, inside the shared container, with generous space above and below). It appears on Tango, Yoga and Chinese Dance (the three classes with several formats) and not on Contemporary or Tai Chi. No second divider was added; a test now guards the rule.
- **Checks:** `tsc` and full ESLint pass; 108 tests pass; production build passes; no horizontal overflow at 375, 768 and 1440 px on the timetable and membership pages.
- **Trade-off:** at screens wider than 1152 px the calendar and membership cards are slightly wider than the text column above them. That is deliberate, to keep the previous proportions.
