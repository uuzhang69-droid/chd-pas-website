# SEO and hosting migration checklist

Production address: `https://www.countyhalldancecentre.com` (set once in `src/lib/seo/site.ts`).

Current facts, as told to us: the domain was managed by Google Domains (it may now sit at Squarespace Domains), and the site has been deployed on Vercel using Next.js. The site is **not** a Google Sites site. The site stays on Next.js and Vercel for the foreseeable future. A later move to another host is only a possibility, with no plan or date.

Nothing in this checklist has been done. It lists what to confirm before and after a move. No DNS, Vercel, hosting or live-site change was made while preparing it.

## 1. How indexing is controlled today

- `src/lib/seo/site.ts` → `isIndexingEnabled()`:
  - `SEO_INDEXING=enabled` forces indexing on, `SEO_INDEXING=disabled` forces it off.
  - Otherwise it is on only when `VERCEL_ENV=production`.
- When it is off: every page gets `noindex, nofollow` and `/robots.txt` disallows everything with no sitemap line. This covers local development, Vercel previews and any unconfigured host.
- Settings are read at build time for static pages and at request time for dynamic ones. Set the variable in the host's build environment, not only at runtime.
- [ ] After any deploy, open `/robots.txt` on the live domain and confirm it shows `Allow: /` and a `Sitemap:` line, not `Disallow: /`.
- [ ] View source on the home page and an event page and confirm there is no `<meta name="robots" content="noindex…">`.

## 2. DNS and domain

- [ ] Confirm who now controls the domain (Google Domains was transferred to Squarespace Domains) and who can edit DNS.
- [ ] Record the current DNS records before changing anything: A/AAAA/CNAME for `www` and the apex, MX (email at `@countyhalldancecentre.com`), SPF, DKIM, DMARC, and any verification TXT records.
- [ ] Do not remove MX/TXT records for email when pointing the site elsewhere.
- [ ] Decide the canonical host: `www.countyhalldancecentre.com`. Make the bare domain `countyhalldancecentre.com` redirect (301) to `https://www.countyhalldancecentre.com/…`, keeping the path.
- [ ] Lower the TTL on the records to be changed a day or two before the move; restore it afterwards.
- [ ] Confirm HTTPS certificates will be issued for both `www` and the apex on the new host before switching DNS.
- [ ] Keep the old host running until DNS has fully propagated, then check the new one before shutting the old one down.

## 3. Redirects (301)

Already in `next.config.ts` (these move with the Next.js app, but only work on a host that runs it; see section 6):

- `/classes` → `/timetable`
- `/booking` → `/contact`
- `/studio-hire…` and `/venue-hire/our-space` → `/venue-hire…`
- `/membership/member-benefits`, `/monthly-passes`, `/booking-access`, `/membership-terms` → `/membership`
- `/join-us`, `/faq`, `/gift-cards` → `/contact`; `/taster-classes` → `/timetable`
- Old event URLs: `contemporary-intensive-maya-chen` and a few others → current event pages

To do:

- [ ] Export the list of URLs the **current live site** serves (from the live sitemap, Search Console "Pages" report, and analytics). Compare with the new site's `/sitemap.xml`.
- [ ] For every old URL that has no equivalent, add a permanent redirect to the closest page (never to the home page by default).
- [ ] Check retired events (`/events/milonga-ojo-opening-night`, `/events/ceramics-workshop-with-yasemin`): they return 404 now. Decide whether a 301 to `/events` is better than a 404 if they were ever indexed.
- [ ] `/search` is linked in the navigation config but has no page (404). Remove the link or build the page.
- [ ] Test redirects with `curl -I` on the new host: expect a single 301 hop, correct `Location`, and no redirect chains.
- [ ] Trailing slashes: confirm the new host does not add or remove them differently from the old one.

## 4. Google Search Console

- [ ] Verify ownership of the property. A **Domain property** (DNS TXT verification) covers `www`, the apex, http and https together. If an older URL-prefix property exists, keep it for comparison.
- [ ] Before the move: export the Performance report and the indexed pages list as a baseline.
- [ ] Submit `https://www.countyhalldancecentre.com/sitemap.xml` after the new site is live and indexable.
- [ ] After the move: inspect the home page, one class page and one event page with URL Inspection; confirm "Indexing allowed", the right canonical, and the right rendered content.
- [ ] Watch the Pages report for "Excluded by noindex", "Page with redirect", "Soft 404" and "Duplicate, Google chose different canonical" for several weeks.
- [ ] Do not use the Change of Address tool: the domain stays the same.
- [ ] Check Bing Webmaster Tools the same way if it is in use.

## 5. Sitemap and robots

- [ ] `/sitemap.xml` lists only public, real pages on the production domain (no localhost, no preview URLs). Current output: static pages, class styles, courses, venue-hire pages and every public event, including past ones.
- [ ] Not listed on purpose: redirects, retired events, `/studio`, `/api/*`, `/tester-classes`, and the six event category pages (`/events/milonga` and similar).
- [ ] No `lastmod` is emitted because there is no reliable per-page modification date.
- [ ] Re-check the sitemap when new pages are added. Events and classes are picked up automatically from site content.
- [ ] `/robots.txt` disallows `/api/` and `/studio` and points to the sitemap.

## 6. Next.js hosting compatibility (any new host)

The project is a standard Next.js 16 server project (no `output: "export"`). Confirm the new host can do all of the following **before** moving:

- [ ] Run a Node.js server (`next start`) or an adapter that supports the App Router. Plain shared PHP hosting and static-only hosting cannot run this app.
- [ ] A Node.js version supported by Next.js 16.3.4 (check the current requirement in the Next.js docs before choosing).
- [ ] **Redirects** from `next.config.ts` need the Next.js server; on a static host they must be rewritten as host rules.
- [ ] **ISR / revalidation**: `/events` and `/events/[slug]` use `revalidate = 900` so "Past Event" labels and ordering refresh. This needs a persistent Node server with a writable cache. If the host only serves static files, these pages will keep the date from build time.
- [ ] **Dynamic rendering**: the home page and `/timetable` render per request (they read the server clock). They need a running server.
- [ ] **Image optimisation**: `next/image` needs the Node server (`sharp`) and write access for its cache. Remote Airtable images are allowed in `next.config.ts`.
- [ ] **Environment variables** to copy: Airtable keys (tester classes), `NEXT_PUBLIC_SANITY_*`, and `SEO_INDEXING=enabled` on the new host once it is live.
- [ ] **Build**: `npm run build` downloads Google Fonts (Cormorant Garamond, Montserrat, EB Garamond). The build host needs outbound internet, or the fonts must be self-hosted.
- [ ] **Compression, caching and headers**: confirm gzip/brotli, long cache headers for `/_next/static`, and HTTP → HTTPS redirect.
- [ ] **Security headers and CSP** do not block the JSON-LD script blocks or the Eventbrite links.
- [ ] If a candidate host cannot run Node.js, do not move (stay on Vercel or choose a Node-capable host), because ISR, redirects and image optimisation depend on it.

## 7. Go-live verification (first day)

- [ ] `https://www.countyhalldancecentre.com/` returns 200 over HTTPS with the correct canonical, title and Open Graph tags.
- [ ] `http://` and the bare domain redirect to the `https://www` address in one 301.
- [ ] `/robots.txt`, `/sitemap.xml` and an event page (view-source for JSON-LD) are correct.
- [ ] Share one event URL in a link previewer and confirm the title, description and image appear.
- [ ] Test the Rich Results Test and Schema Markup Validator on the home page and two event pages.
- [ ] Email still works (send and receive) after the DNS change.
- [ ] Re-check `/timetable`, `/events` and the home page show today's dates and the right event order.
