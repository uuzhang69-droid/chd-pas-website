# Contact form and Newsletter: phase 1 implementation plan

Status: plan only. No code, database, Supabase project, mail account or hosting setting has been created or changed.
Date: 16 November 2026.

## 0. Decisions this plan assumes (please confirm or change)

| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | Where subscriber data lives | A separate Supabase PostgreSQL project, London region, used only for the newsletter and its admin |
| D2 | Transactional mail provider | One with a plain HTTP API and domain verification (Resend or Postmark are the usual choices). Wrapped in one `sendMail()` adapter so the provider can change |
| D3 | Spam protection | Honeypot + minimum-fill-time + Cloudflare Turnstile (works on any host) |
| D4 | Rate limiting | Counters in the same Postgres database, not a Vercel service |
| D5 | Admin sign-in | Supabase Auth, invite-only, email one-time link, optional authenticator app (MFA), plus an allow-list of admin emails |
| D6 | Contact messages | Not stored. Only a metadata log (time, result, provider id). No message text |
| D7 | Subscribe flow | Double opt-in: explicit unticked checkbox, then a confirmation email; nobody is "Active" until they confirm |

## 1. Current state (verified in the code)

- Next.js **16.3.4**, React 19, App Router, no `output: "export"`. Node.js **20.9 or newer** is required by this Next.js version. A server that can run Node is needed (Vercel today; a Node host or container later).
- `NewsletterSignupForm` (home band and every footer) and `ContactForm` (Contact page) both build a `mailto:` link and set `window.location`. Nothing is sent or stored. `ContactForm` shows "Thank you… received" immediately, which is false.
- The only API route is `/api/time`. No Server Actions. No email, database, validation or rate-limit packages are installed (no Zod, Supabase or mail SDK).
- Environment variables today: Airtable (tester classes) and `NEXT_PUBLIC_SANITY_*`. Nothing for mail or newsletter.
- The footer legal items (Privacy Policy, Terms, Safeguarding, Cookie Policy) are plain text and the pages do not exist.
- Next.js 16 uses `proxy.ts` (renamed from `middleware`). Its docs say proxy code should not rely on shared modules, so every protected route must also check access on the server itself.
- The existing contact form already accepts prefilled values (`/contact?subject=…&message=…`) and the membership buttons use it. That behaviour must stay.

## 2. Architecture

```
Browser (existing forms, same look)
   │  JSON over HTTPS (stable contract, section 5)
   ▼
Route Handlers  /api/contact  /api/newsletter/*  /api/admin/*        ← Next.js, rewriteable
   │  all business logic in plain modules: src/lib/mail, src/lib/newsletter, src/lib/security
   ├──► Mail provider (HTTP API)          ← portable
   ├──► Turnstile verify (HTTP POST)      ← portable
   └──► Supabase Postgres (server only)   ← portable (standard SQL, CSV/pg_dump export)
```

Rules that keep it portable:
- No `@vercel/*` packages, no Vercel KV, Blob, Edge Config or Cron, no Edge runtime. Use the Node runtime only.
- Cleanup jobs run inside Supabase (`pg_cron`), not Vercel Cron.
- Tokens are HMAC-SHA256 values, so another language can issue and verify them (test vectors in section 5).
- The browser talks to our own `/api/*` only. The Supabase service key never reaches the browser.
- Client IP is read through one small helper, because the trusted header differs between hosts.

## 3. Contact form

### 3.1 Behaviour
1. Visitor fills the existing fields (name, email, phone optional, topic, message). Layout and styles stay.
2. Browser validates, then sends JSON to `POST /api/contact`.
3. Server: origin check → honeypot and minimum-time check → Turnstile → rate limit → validation → send mail.
4. **Success is returned only when the mail provider's API answers 2xx.** Wording says "sent to our team", never "delivered" or "read".
5. On any failure the form stays filled, shows a clear error, and offers the phone and email as a fallback.
6. The sender is a fixed verified address on our domain; the visitor goes in `Reply-To`. Subject and header fields have CR/LF removed to prevent header injection.
7. The contact form never subscribes anyone to the newsletter and has no newsletter checkbox.

### 3.2 Recipient switch
- `CONTACT_RECIPIENT_EMAIL` holds the recipient. It is set to `website.countyhalldance@gmail.com` in every environment until testing is signed off.
- Go-live is one change: set it to `info@countyhalldancecentre.com` and redeploy. Nothing in code names either address.
- Guard: the app logs a warning at startup if production still points at the test inbox, and the go-live checklist (section 9) requires a human sign-off before the switch.

### 3.3 Validation (server-side, same rules mirrored in the browser)
Name 1–100 characters; email valid and at most 254; phone optional, digits and `+ ( ) -` space, 7–20; topic must be one of the configured options; message 10–5,000; no control characters; at most 3 links; honeypot empty; form age at least 3 seconds and at most 2 hours.

### 3.4 Limits
Per client address: 5 requests per hour and 2 per 10 minutes. Per email: 3 per hour. Returns 429 with `retryAfter`.

## 4. Newsletter

### 4.1 States
```
(no row) ──subscribe──► pending ──confirm──► active ──unsubscribe──► unsubscribed
                           ▲                                            │
                           └────────── subscribe again (new consent) ───┘
pending older than 30 days ──► deleted by cleanup job (never became a contact)
```
- **pending**: asked to subscribe, not confirmed. Not a marketing contact.
- **active**: confirmed by clicking the emailed link. Only these may ever be emailed.
- **unsubscribed**: kept on a suppression list so the opt-out is honoured; the row is not deleted unless the person asks for erasure.
- Subscribing again after unsubscribing needs a new tick and a new confirmation.
- A confirmation link is safe against email scanners: the link opens a page with a "Confirm subscription" button, and only the button's POST changes the state.

### 4.2 Duplicates and privacy
Responses never reveal whether an address exists: every valid request returns the same "check your inbox" message. Active addresses receive nothing new. Pending addresses get at most one new confirmation email per 10 minutes. Matching is on `lower(trim(email))`.

### 4.3 Tables (PostgreSQL)

```sql
create table newsletter_consent_texts (
  version        text primary key,            -- e.g. 'v1-2026-11'
  body           text not null,               -- exact wording shown beside the checkbox
  effective_from timestamptz not null default now()
);

create table newsletter_subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  email_normalised   text generated always as (lower(btrim(email))) stored,
  status             text not null default 'pending'
                       check (status in ('pending','active','unsubscribed')),
  source             text not null check (source in ('footer','home','other')),
  source_path        text,                    -- page where the form was used
  consent_text_version text not null references newsletter_consent_texts(version),
  consent_given_at   timestamptz not null,    -- tick submitted
  confirmed_at       timestamptz,             -- link clicked
  unsubscribed_at    timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  last_confirmation_sent_at timestamptz
);
create unique index newsletter_subscribers_email_uq on newsletter_subscribers (email_normalised);
create index newsletter_subscribers_status_idx on newsletter_subscribers (status, created_at desc);

create table newsletter_events (               -- minimal audit trail, no IP address
  id bigint generated always as identity primary key,
  subscriber_id uuid references newsletter_subscribers(id) on delete set null,
  event text not null,    -- subscribe_requested, confirmation_sent, confirmed, unsubscribed, admin_export, admin_view, deleted
  actor text,             -- 'visitor' or admin email
  at timestamptz not null default now()
);

create table newsletter_admins (email text primary key, created_at timestamptz default now());

create table rate_limits (
  key text not null, window_start timestamptz not null, count int not null default 1,
  primary key (key, window_start)
);

create table contact_log (                     -- no message text, no email address
  id bigint generated always as identity primary key,
  at timestamptz not null default now(), outcome text not null, provider_message_id text
);
```
Security setup: row-level security **enabled on every table with no policies for the anonymous or authenticated roles**, so the public Supabase key can read and write nothing. The app uses the server-side service key from Route Handlers only. A trigger sets `updated_at`. Cleanup (`pg_cron`): delete pending rows older than 30 days, rate-limit rows older than 2 days, `contact_log` older than 90 days.

Stored for consent evidence: time, exact wording version, source page. Not stored: IP address, browser details, message text. (If you want IP kept for abuse investigation, store a salted hash for 30 days only; this plan leaves it out.)

## 5. API contract (stable across hosts)

All endpoints: `Content-Type: application/json`, no cookies for the public ones, `Origin` must match the site, responses `{ "ok": boolean, ... }`.

| Endpoint | Request | Success | Errors |
|----------|---------|---------|--------|
| `POST /api/contact` | `name, email, phone?, subject, message, turnstileToken, hp, t` | `200 {ok:true}` only after the mail API accepts | `400 {ok:false, errors:{field:text}}`, `403 {code:"bot"}`, `429 {code:"rate_limited", retryAfter}`, `502 {code:"mail_unavailable"}` |
| `POST /api/newsletter/subscribe` | `email, consent:true, source, sourcePath, turnstileToken, hp, t` | `202 {ok:true}` ("check your inbox") | `400`, `403`, `429`, `502` (confirmation email not accepted: row kept pending, user told to retry) |
| `POST /api/newsletter/confirm` | `token` | `200 {ok:true}` | `400 {code:"invalid"|"expired"}` |
| `POST /api/newsletter/unsubscribe` | `token` (also accepts the one-click `List-Unsubscribe=One-Click` form post for future email) | `200 {ok:true}` | `400` |
| `GET /newsletter/confirm?token=…` and `/newsletter/unsubscribe?token=…` | pages showing a button; they change nothing on load | | |
| `GET /api/admin/newsletter/subscribers?q&status&source&page` | admin session | `200 {rows,total}` | `401`, `403` |
| `GET /api/admin/newsletter/export.csv?q&status&source` | admin session | CSV file | `401`, `403` |

Token format (so PHP or anything else can reproduce it): `base64url(subscriberId) + "." + base64url(expiryUnixSeconds) + "." + base64url(HMAC_SHA256(secret, purpose + ":" + subscriberId + ":" + expiry))`, `purpose` is `confirm` or `unsubscribe`. Confirm tokens expire after 7 days. Unsubscribe tokens do not expire. Compare in constant time. Test vectors go in the repository docs.

There is **no endpoint that lists subscribers publicly**. Admin endpoints require a valid admin session on every request, and also check the admin allow-list inside the handler (proxy is only a first gate).

CSV safety: cells starting with `= + - @` get a leading `'`; no tokens are exported; export is logged to `newsletter_events`.

## 6. Admin (phase 1)

- Page `/admin/newsletter`, hidden from navigation, `noindex`, excluded from the sitemap and blocked in `robots.txt`.
- Sign-in with Supabase Auth: email one-time link, **public sign-up disabled** (essential, otherwise anyone can create an account), optional MFA, then a check that the email is in `newsletter_admins`.
- Features: table with search by email, filters by status and source, columns email / status / source / created / confirmed / unsubscribed, pagination, **Export CSV** for the current filters.
- Also recommended in the same phase because UK GDPR needs it: a protected action to mark an address unsubscribed and one to delete it on request. If you prefer to keep phase 1 read-only, do these in the Supabase dashboard and document the procedure.
- Not in phase 1: editor, scheduling, bulk sending, importing lists.

Alternative (only if the hosting or CMS ever changes; nothing is planned): put `/admin` behind Cloudflare Access or the host's own roles. Nothing about the data changes.

## 7. Privacy and compliance (UK; this is a checklist, not legal advice)

**Consent wording (draft v1, to approve)**: unticked checkbox: "I'd like to receive occasional news about classes, events and offers from County Hall Dance Centre by email. I can unsubscribe at any time. See our Privacy Policy." The exact text and its version are saved with every subscription. The footer sentence "Unsubscribe anytime" is only kept once the unsubscribe link exists.

**Privacy Policy must cover**: who is responsible (the legal entity, address and contact email, to confirm); what is collected for contact enquiries and for the newsletter; purposes; lawful basis (consent for marketing, with double opt-in; legitimate interests or taking steps to answer for enquiries); who receives data (Supabase, mail provider, Cloudflare Turnstile, the host; confirm each provider's role and cookies); where data is stored (London region for the database; state provider locations and transfer safeguards); retention (pending 30 days, active until unsubscribed, suppression record kept, contact messages not stored by the site but kept in the inbox per your own policy); rights and how to use them; how to unsubscribe; the right to complain to the ICO. Also check whether the organisation must pay the ICO data protection fee.

Other rules in the plan: contact submitters are never added to the list; unconfirmed addresses are never marketed to; no fake success messages; no unsubscribe promise without a working link.

## 8. Environment variables and accounts

Names only. No values are in the repository; `.env.example` will list names without values.

| Variable | Used by | Public? | Notes |
|----------|---------|---------|-------|
| `CONTACT_RECIPIENT_EMAIL` | contact API | No | Test: `website.countyhalldance@gmail.com`. Later: `info@countyhalldancecentre.com` |
| `MAIL_API_KEY` | mail adapter | **Secret** | Server only |
| `MAIL_FROM` | mail adapter | No | An address on a verified domain, e.g. `no-reply@…` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | browser | Public by design | |
| `TURNSTILE_SECRET_KEY` | server | **Secret** | |
| `SUPABASE_URL` | server | No | |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **Secret, never `NEXT_PUBLIC_`** | Full database access |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | admin sign-in only | Public by design | Safe only because every table denies the anonymous role |
| `NEWSLETTER_TOKEN_SECRET` | server | **Secret** | At least 32 random bytes. Rotating it invalidates open links |
| `RATE_LIMIT_SALT` | server | **Secret** | Used to hash client addresses in rate-limit keys |
| `APP_BASE_URL` | server | No | Absolute links in emails; production uses the production domain |

Environments: local (Supabase CLI local stack or a dev project), Preview and Production. Use separate Supabase projects for dev and production if the plan allows. **Check the current Supabase and mail-provider free-tier rules before relying on them** (for example project pausing and sandbox-sender limits; I have not verified current terms).

### Accounts and settings you must create yourself
1. Supabase organisation and project (region London); disable public sign-ups; enable the allow-list approach; optionally MFA.
2. Mail provider account; add the sender domain and publish the SPF and DKIM DNS records it gives you (DMARC recommended). This needs access to the domain's DNS, which is not part of this plan.
3. For testing, the provider's test sender normally only delivers to the account owner, so create the account with `website.countyhalldance@gmail.com` or verify that address; confirm with your chosen provider.
4. Cloudflare account and a Turnstile site (hostnames: production domain, preview domain, localhost).
5. Vercel project environment variables (Preview and Production) for everything above.
6. Decide the admin email addresses.
7. Approve the consent wording and provide the legal entity details for the Privacy Policy.

## 9. Implementation phases

| Phase | Work | Output |
|-------|------|--------|
| 0 | You complete the accounts in the list above; decisions D1–D7 confirmed | Keys and DNS ready |
| 1 | Add dependencies (Supabase client, a small validation library, the mail SDK or plain fetch). Typed environment loader that fails fast. `sendMail()` adapter. Security helpers (origin check, honeypot, Turnstile verify, DB rate limit, IP helper). `.env.example` names | Library code with unit tests, no UI change |
| 2 | `POST /api/contact`. Replace `mailto:` in `ContactForm` with real submit, states, errors, Turnstile and honeypot. Keep layout and prefill | Contact works against the Gmail test inbox only |
| 3 | SQL migrations (section 4.3) in the repository, RLS on. Consent text v1 | Schema in a dev project |
| 4 | Newsletter subscribe, confirm, unsubscribe endpoints and pages. Update `NewsletterSignupForm` (checkbox, states, links) in footer and home band | Full double opt-in flow on dev |
| 5 | `/privacy` page and make the footer legal items real links. Update footer wording | Compliance copy live |
| 6 | Admin sign-in, list, search, filters, export, audit log, admin tests | Working admin on dev |
| 7 | Hardening and go-live: key scan of the build, RLS test, load and abuse tests, then switch `CONTACT_RECIPIENT_EMAIL` and run the live checklist | Production release |
| Later | Campaign sending, templates, scheduling, bounce handling | Not in phase 1 |

Go-live checklist: Contact tested with real failure (bad key shows an error, never a success); email headers show the right `From` and `Reply-To`; recipient switched by environment variable only; confirmation and unsubscribe links point to the production domain; anonymous Supabase key cannot read any table; admin refuses non-admins; Privacy Policy published; footer "Unsubscribe anytime" backed by a working link.

## 10. Test plan

- **Unit**: validators (valid and hostile input), token creation and verification (tampering, expiry, wrong purpose), state transitions, CSV escaping (formula characters), rate-limit window logic, header-injection stripping.
- **API with mocked mail provider**: provider 2xx → success; provider 4xx/5xx/timeout → error and no success; honeypot and minimum time; Turnstile failure; rate limit 429; same email twice; pending resend throttle; unsubscribed then subscribe again; expired and tampered tokens; confirm GET changes nothing.
- **Database** (dev project): unique email under case and whitespace variations; RLS blocks the anonymous key on every table; cleanup job.
- **Manual end-to-end**: submit the real contact form and read the Gmail test inbox (headers, Reply-To, subject, escaping); subscribe, receive the confirmation, confirm, see the row go `pending → active`; unsubscribe; admin search, filter and CSV opened in a spreadsheet.
- **Security**: search the production build output for the service key and other secrets; try admin endpoints with no session and with a non-admin session; check that nothing is cached for admin routes; confirm no personal data in logs.
- **Quality**: desktop and mobile, keyboard use, screen-reader announcements for success and errors, JavaScript-off behaviour (a clear message, no data in the URL).

## 11. If the hosting or CMS ever changes (not planned)

| Keep as is | Rewrite |
|------------|---------|
| Supabase database and its data (standard SQL; export CSV or `pg_dump`) | The Route Handlers (`/api/*`) become PHP endpoints (for example WordPress REST routes) with the same JSON contract |
| Mail provider account, domain records, templates | Server code that calls it (small HTTP calls, or an SMTP plugin) |
| Turnstile site and keys | The verification call (one HTTP POST) |
| Token format (HMAC test vectors), consent texts, rate-limit SQL, Privacy Policy text | Form components: the React forms become theme or plugin JavaScript that can reuse the same `fetch` calls |
| Supabase Auth admins, or move to WordPress roles or Cloudflare Access | The admin pages (rebuild as a WordPress admin screen, or keep Supabase dashboard and a CSV export) |
| | `proxy.ts` and environment loading (become `wp-config` constants) |

Alternative: keep this Next.js app running as a small API on any Node host and call it from the new front end; then nothing is rewritten.

## 12. Risks and open questions

1. The legal entity and its ICO status are needed for the Privacy Policy.
2. Contact mail is "accepted" by the provider, not guaranteed delivered. The inbox owner must watch for bounces; consider a notification address.
3. Supabase and mail-provider free-tier limits may not suit production; check before launch.
4. Turnstile may set cookies or storage; check against the cookie policy.
5. Existing mailto-based pages besides Contact (Refer a friend link) stay as ordinary links; they send nothing automatically.
6. Open questions: is a second admin needed; how long to keep unsubscribed records; whether any existing list must be imported (if yes, consent evidence is required and phase 1 does not import).
