# Editing website content

This README was updated on 1 November 2026.

All user-facing text, button labels, links, and image paths live in one file:

**`src/content/site.source.ts`**

You do not need to touch any React components to update copy or swap images. Components read everything from this central file, which is structured so it could later be replaced by a CMS (Airtable, Sanity, etc.) without changing the site layout.

## Quick start

1. Open `src/content/site.source.ts` in any text editor.
2. Find the section you want to change (see structure below).
3. Edit the text or image path.
4. Run `npm run content:export` to regenerate the runtime content and CSV.
5. Check `npm run build` and preview with `npm run dev`. Commit source, generated content and any new images together.

The runtime entry point is `src/content/site.ts`; it resolves `site.structure.ts` and `copy.ts`, then applies event enrichment. Do not edit generated files by hand. CSV-only edits use `npm run content:import`; see [CONTENT.md](CONTENT.md) before mixing workflows.

## File structure

```text
siteContent
├── meta              → Site name, SEO description
├── global            → Logo, utility bar, navigation, footer
├── home              → Homepage sections
│   ├── hero          → Rotating slider slides
│   ├── quickActions  → Three quick-link buttons
│   ├── events        → Event cards grid (homepage preview)
│   ├── classStyles   → Dance style tiles
│   ├── aboutTeaser   → About preview block
│   ├── privateEvents → Private parties promo
│   └── newsletter    → Newsletter + social band
└── pages             → Inner pages
    ├── common        → Shared link labels
    ├── timetable     → Booking page + widget placeholder
    ├── classes       → Class index + style page content
    ├── courses       → Course list + detail content
    ├── events        → Full events list + detail content
    ├── about         → Story, values, faculty
    ├── contact       → Form fields, map, studio details
    ├── faq           → Accordion questions
    └── giftCards     → Gift card options + Stripe links
```

## Inner pages

| URL | Content section in `site.source.ts` |
|-----|------------------------------|
| `/timetable` | `pages.timetable` |
| `/classes` | `pages.classes` |
| `/classes/ballet` (etc.) | `pages.classes.styles` — match by `slug` |
| `/courses` | `pages.courses` |
| `/courses/junior-ballet-foundation` (etc.) | `pages.courses.items` — match by `slug` |
| `/events` | `pages.events` |
| `/events/winter-showcase` (etc.) | `pages.events.items` — match by `slug` |
| `/about` | `pages.about` |
| `/contact` | `pages.contact` |
| `/faq` | `pages.faq` |
| `/gift-cards` | `pages.giftCards` |

### Adding a class style page

Add an entry to `pages.classes.styles` with a unique `slug`. The page will automatically appear at `/classes/your-slug`.

### Adding a course

Add an object to `pages.courses.items` with a unique `slug` and matching `href: "/courses/your-slug"`.

### Adding a full event page

Add to `pages.events.items` with `slug`, `excerpt`, `description`, and a Stripe `bookNow.href`. The homepage events grid uses a separate list at `home.events.items` — update both if you want them in sync.

### Booking widget (Timetable page)

The timetable page shows a dashed placeholder box. When your ClassForKids or bsport embed is ready, a developer replaces the placeholder component in `src/components/ui/BookingEmbed.tsx` with your embed code. All surrounding text is edited in `pages.timetable`.

### Gift cards & event payments

Update the `href` values to your real Stripe payment links in `pages.giftCards.options` and `pages.events.items[].bookNow`.

## Changing text

Edit the string value directly. Example — change the hero headline:

```ts
// In siteContent.home.hero.slides, find a slide and edit:
headline: "Your new headline here",
blurb: "Your new one-line description.",
```

Button text is under `label`:

```ts
cta: { label: "Book a Free Trial", href: "/timetable#trial", variant: "primary" },
```

## Changing images

1. Add your image file to the `public/` folder (e.g. `public/images/hero/my-photo.jpg`).
2. Update the `src` path in `site.source.ts` (paths start with `/`, which maps to `public/`):

```ts
image: {
  src: "/images/hero/my-photo.jpg",
  alt: "Describe the image for accessibility",
},
```

**Logo:** Replace `public/logo.svg` with your own file (keep the same filename, or update `siteContent.global.logo.src`).

Never stretch the logo in code — it is displayed at a minimum height of 70px with natural proportions.

## Adding or removing a hero slide

Hero slides are in `siteContent.home.hero.slides` — an array of slide objects.

**To add a slide**, copy an existing slide object and paste it inside the array. Give it a unique `id`:

```ts
{
  id: "hero-6",
  headline: "Summer intensive programmes",
  blurb: "Accelerate your training during the holidays.",
  cta: { label: "View Courses", href: "/courses", variant: "primary" },
  image: {
    src: "/images/hero/slide-6.svg",
    alt: "Students in a summer intensive class",
  },
},
```

Optional: add `videoSrc: "/videos/hero/summer.mp4"` for a background video (image is used as poster).

**To remove a slide**, delete its entire `{ ... }` block from the array.

## Adding or removing an event card

Event cards are in `siteContent.home.events.items`.

**To add an event**, copy an existing card and update `id`, `title`, `date`, `image`, and `bookNow.href` (Stripe payment link):

```ts
{
  id: "event-5",
  title: "Spring Open Day",
  date: "Saturday 14 March 2027",
  dateIso: "2027-03-14",
  location: "Main Studio",
  image: { src: "/images/events/open-day.svg", alt: "Open day at the school" },
  bookNow: {
    label: "Book Now",
    href: "https://buy.stripe.com/your-link",
    external: true,
    variant: "primary",
  },
},
```

**To remove an event**, delete its object from the `items` array.

## Navigation and footer links

- Main menu: `siteContent.global.navigation.items`
- Footer links: `siteContent.global.footer.columns`
- Phone, email, social: `siteContent.global.utilityBar`

## Running the site locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Placeholder images

The project ships with simple SVG placeholders in `public/images/`. Replace them with your own photography and update the paths in `site.source.ts`.


## Timetable: week, month and list

The homepage and `/timetable` share `ClassCalendar`. The source is `public/schedule.json`, not the copy spreadsheet. Week and List show the selected week; Month shows the full selected month, with previous/next month and This month controls. Day/style filters and booking options work in each view. Mobile Month view stacks dates vertically. All times are London time.

Weekly entries support date limits and cancellations; `datedClasses` holds single-date workshops. See [CONTENT.md](CONTENT.md) for the schema. Updating schedule JSON does not require `content:export`.

## Events, relationships and concert series

Activity filters remain Events / Workshops / Masterclasses. Organiser, collaboration, hosting and promotion are separate metadata, displayed beneath the event details using full organisation names.

Recurring concerts use `occurrences` inside their existing event page. Each occurrence has its own date, programme, location and attribution. **Never assume the series venue applies to every concert.** The 23 October 2026 Fandango concert is confirmed at County Hall Dance & Performing Arts School; other concert venues are unconfirmed and omitted. Retain past programmes when adding a new one. See [CONTENT.md](CONTENT.md) for maintenance instructions.
