# Static assets audit

Date: 2026-11-06. Scope: `public/` (126 files, about 45 MB) and every place in `src/`, `scripts/`, `content/`, `sanity/` and config that references it.

Approach: audit first, then only low-risk changes. **No existing file was moved, renamed, deleted or re-compressed.**

## 1. Changes made

| Item | Detail |
| --- | --- |
| New event folder | `public/images/events/2026/an-actors-work-with-an-object/` (follows `images/events/YYYY/event-slug/`) |
| SVG fix | `public/images/styles/tap-musical.svg`: raw `&` in `Tap & Musical` was invalid XML (the SVG could not render). Changed to `Tap &amp; Musical`. Nothing else in the file changed. The file is currently unreferenced. |

### New files (copied from `Downloads`, bytes unchanged)

| New path | Source file | Content | Used on page |
| --- | --- | --- | --- |
| `workshop-umbrella-exercise.jpg` | WhatsApp Image … 16.38.20 | Participants reaching towards an umbrella | Yes. Main visual and listing card |
| `workshop-rehearsal-01.jpg` | … 16.38.35 | Studio, participants moving with objects | Yes. Gallery |
| `workshop-rehearsal-02.jpg` | … 16.38.40 | Objects scattered on the wooden floor | Yes. Gallery |
| `oleg-mirochnikov-portrait.jpg` | … 16.38.44 | Portrait of Oleg | Yes. Teacher photos |
| `oleg-mirochnikov-teaching.jpg` | … 16.38.30 | Oleg gesturing while teaching | Yes. Teacher photos |
| `oleg-mirochnikov-teaching-cane.jpg` | … 16.38.26 | Oleg holding a wooden cane | No, spare |
| `poster.jpg` | … 16.41.18 | Official A-format poster | No, archived (see section 5) |

Not copied: `16.38.47` (QR code, not a visual) and `16.38.54` (screenshot of the blurb, text only).

## 2. Inventory summary

- 126 files: 70 jpg, 17 jpeg, 9 png, 27 svg, 2 ico, 1 json.
- Referenced by a literal path in code or content: 82.
- Referenced dynamically (template strings): `events/dance-meets-arts/gallery-01..16.jpg`, `events/memory-of-china/gallery-01..10.jpg` (`src/content/enrich-events-content.ts`), and the new event (`src/content/events/an-actors-work-with-an-object.ts`). All of these exist.
- **Broken references: 0.** No missing file and no case mismatch among the literal paths in TS/TSX/CSS/JSON/CSV in `src`, `scripts`, `content` and `sanity`.
- Not checked: any external reference to `public/` URLs (emails, social posts, QR codes, Google Business, partner sites). Treat every file as possibly public.

## 3. Files with no reference in the repo (do not delete without confirmation)

A search by path finds no reference, but external use cannot be ruled out. **All are left untouched.**

| Group | Files | Note |
| --- | --- | --- |
| Next.js template leftovers | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Default `create-next-app` files. Very likely safe to delete. |
| Logo and icon variants | `CHDPAS-transparent-logo.png`, `CHDPAS-transparent.ico`, `CHDPAS-white-circle-preview.png`, `CHDPAS-white-circle.ico` | Brand assets. Do not delete; possibly used outside the site (WhatsApp, Google, social). |
| Duplicate logos | `header-logo.png` and `footer-logo.png` | Byte-identical to each other (19,756 B). The site uses `header-logo-clear.png` and `logo.png` instead. Possibly linked externally. |
| Placeholder faculty SVGs | `faculty/eleanor.svg`, `kiki.svg`, `marcus.svg`, `michael.svg`, `sophie.svg` | Text-only placeholders using invented names. Unreferenced. `faculty/coming.svg` is referenced. |
| Placeholder style SVGs | `styles/ballet.svg`, `drama.svg`, `jazz.svg`, `street.svg`, `tap-musical.svg` | Gradient with a label. Unreferenced. `ballet.svg` matches by file name only. |
| Event photos | `events/memory-of-china.jpg`, `events/memory-of-china/{mahjong,performance,terrace-1,terrace-2,terrace-3}.jpg`, `about/gallery-01.jpg` | The gallery uses `gallery-NN.jpg` instead. May be older versions or originals. |
| New event files | `poster.jpg`, `oleg-mirochnikov-teaching-cane.jpg` | Intentionally kept. |

Duplicate check (MD5 content hash) found three byte-identical pairs. None was removed, and images that merely look alike were not treated as duplicates:

| Identical pair | Note |
| --- | --- |
| `header-logo.png` = `footer-logo.png` | Both unreferenced. |
| `about/story-gallery-01.jpg` = `venue/gallery-04.jpg` | Both are referenced, so this is intentional reuse. |
| `about/gallery-01.jpg` = `events/memory-of-china/gallery-09.jpg` | `gallery-09.jpg` is referenced; `about/gallery-01.jpg` is not. |

## 4. SVG audit

27 SVG files were reviewed. No stray `&` or other XML problem remains after the fix above (checked by script; the 13 MB file was not parsed in full).

| Check | Result |
| --- | --- |
| `<script>`, `on*` handlers, `javascript:` | None found. |
| External resource references | None found. |
| `viewBox` and size | Present and consistent in all files. |
| Typos or outdated names | No English typos. Placeholder labels only (see below). |
| Logo with outlined text | `logo.svg` uses live `<text>` (Georgia / Arial), so it renders with fallback fonts. It appears only in `README.md`; the site uses `logo.png`. Not edited, because it is a brand logo. |

Files that need a decision (all unreferenced placeholders, so **not edited**):

| File | Current text | Question |
| --- | --- | --- |
| `faculty/eleanor.svg` | "Eleanor Whitfield" | Invented/test teacher names? Delete or replace with real photos. |
| `faculty/marcus.svg` | "Marcus Okonkwo" | As above. |
| `faculty/sophie.svg` | "Sophie Laurent" | As above. |
| `faculty/kiki.svg`, `faculty/michael.svg` | "Kiki", "Michael" | Real teachers? If so, use their photos. |
| `faculty/coming.svg` | "Coming Soon" | Referenced. Keep. |
| `events/*.svg`, `courses/*.svg`, `private-events/promo.svg` | Event or course name on a gradient | Generic placeholders. Check which are still referenced before replacing with real artwork. |

No SVG here has text converted to paths, so any wording change is a direct text edit.

### Performance issue (high priority, not changed)

`public/images/about/teaser.svg` is **13.4 MB**. It is an SVG wrapper holding a base64 JPEG (4096 × 2731). It is used in the Home "About" teaser and the About page (`site.structure.ts` lines 495 and 2813). `next/image` does not optimise SVG, so every visitor downloads the full file.

Suggested fix: export the embedded image as a JPEG or WebP (about 300–500 KB) and update the two references. I did not do this because it changes an existing content image. Please confirm.

Other large files that could be recompressed (not touched): `events/2026-halloween/pexels-ivan-s-5429022.jpg` (3.4 MB) and `events/four-seasons-festival/gallery-*.jpg` (1.5–3.0 MB each). These are rendered through `next/image`, which already serves resized versions, so the impact is smaller.

## 5. Notes on the new Workshop assets

- The poster calls the event "An Intensive Introductory Workshop & Live Performance". The brief gives the subtitle as "An Intensive Acting Workshop & Live Performance". The page follows the brief. The poster is stored but not displayed, to avoid showing two different subtitles. Please confirm which wording is correct.
- The umbrella photo is only 736 × 935 px. It displays at up to 416 px wide on desktop, so it stays sharp, but a larger original would be better.
- Images use the real pixel dimensions with `h-auto`, so nothing is cropped on the event page. The listing cards and the home grid crop with `object-cover` as they do for every other event.

## 6. Proposed structure and naming (not applied to old files)

```
public/images/branding/            logos, icons (old paths stay as they are)
public/images/events/YYYY/slug/    one folder per event
public/images/teachers/            faculty photos
public/images/classes/             class and style images
public/images/venues/              venue photos
public/images/shared/              generic backgrounds, hero images
public/documents/                  PDFs
```

Rules: lowercase, hyphen-separated, descriptive English names such as `oleg-mirochnikov-portrait.jpg`. Avoid `image1`, `final`, `new-logo2`.

Migration plan if wanted later (each step needs its own approval):

1. Delete the five Next.js template SVGs.
2. Replace `about/teaser.svg` with a JPEG/WebP and update 2 references.
3. Move `faculty/` to `teachers/` and `styles/` to `classes/` with a reference update. Keep copies at the old paths for a release in case anything external uses them.
4. Move `logo.*`, `header-logo*`, `footer-logo.png` and the `CHDPAS-*` files to `images/branding/`. Keep the old paths, because these are the most likely to be used outside the site.

## 7. Pending your confirmation

1. Subtitle: "Acting Workshop" (brief) or "Introductory Workshop" (poster)?
2. Replace `about/teaser.svg` (13.4 MB) with a JPEG/WebP?
3. Delete the unreferenced `create-next-app` SVGs?
4. Remove or replace the invented-name placeholder SVGs in `faculty/`?
5. Are any of the unreferenced logo or image files used outside the site?

## 8. Verification (2026-11-06)

- `tsc --noEmit`: no errors. `scripts/test-timetable.mts` (18) and `scripts/test-current-month.mts` (6): all pass.
- ESLint on `src` and `scripts`: 3 errors and 5 warnings, all in files I did not change for those rules (`MembershipSection.tsx`, `TimetableGrid.tsx`, `scripts/import-existing-data.mts`, and unused-variable warnings). None come from the new code.
- `next build`: **failed in this environment** because it could not download Google Fonts (`next/font/google`, EB Garamond). That is a network failure, not a code error. Please run `npm run build` on a machine with internet access.
- Dev server: the event page, `/events`, `/` and `/timetable` return 200. All six event images load at desktop and 375 px width with no horizontal scroll. The Calendar shows exactly one 28 November record ("Acting Workshop", 15:00–18:00) linking to the event page. The two Tango workshops are unchanged.
