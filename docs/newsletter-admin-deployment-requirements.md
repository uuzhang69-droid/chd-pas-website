# Newsletter and Admin: deployment requirements

Scope: a description of what the **current** Next.js site needs from a host. It is a requirements list, not a migration plan. No deployment, hosting, DNS, Vercel, Supabase or Resend setting was changed to produce it. The Next.js site is the active website and is not assumed to be moving anywhere; any later change of host or CMS is only a possibility with no plan or date, so none of this is designed around it.

## 1. What the repository says about hosting

- No `vercel.json`, Dockerfile, Netlify/Render/Fly config, or `engines` field. The only Vercel-specific code is `VERCEL_ENV` in `src/lib/seo/site.ts` (search-engine indexing is on for production). Elsewhere `SEO_INDEXING=enabled` does the same job, so a non-Vercel host works if one of the two is set.
- Vercel is therefore **not required by the code**. Any host that can run a long-lived Node.js server (or an equivalent adapter) will do.
- Next.js 16 needs **Node.js 20.9 or newer**.

## 2. Required hosting capabilities

| Capability | Why |
| --- | --- |
| Run `next build` then `next start` (Node.js server) | API routes, admin pages, ISR pages, image optimiser, `/studio` all run server-side. A static export is **not possible**. |
| Node.js runtime for Route Handlers | All `/api/*` routes are `runtime = "nodejs"`, `force-dynamic`. |
| Persistent writable cache (ISR) | `revalidate = 900/300` on `/`, `/events`, `/events/[slug]`, `/tester-classes`. A host without a shared cache serves them but revalidation is per instance. |
| Image optimiser (`sharp`) | `next/image` with Airtable remote patterns. |
| Outbound HTTPS (443) | Supabase, Resend, Cloudflare Turnstile, Airtable, Sanity; Google Fonts at **build** time. |
| Environment variables at build and run time | `NEXT_PUBLIC_*` values are baked in at build; others are read at run time. |
| HTTPS with a correct `Host` and `X-Forwarded-For` | Admin cookies are `Secure`; the same-origin check compares `Origin`; rate limits key on the forwarded client address (the proxy must set it truthfully, and the app must not be reachable around the proxy). |
| Honour `headers()` and `redirects()` in `next.config.ts` | Security/no-store headers for admin and API, legacy redirects. A non-Next front end must reproduce them. |
| Several instances are fine | No in-process state is relied on in production: rate limits and sessions live in Supabase. (The in-memory fallback store is for development only.) |

## 3. What needs a running Next.js server

| Feature | Server needed? | Notes |
| --- | --- | --- |
| Newsletter sign-up, confirm, unsubscribe (`/api/newsletter/*`, `/newsletter/*`) | **Yes** | Keeps the Supabase service key, token secret and mail key server-side. |
| Admin login/logout/refresh, `/admin/*`, CSV export | **Yes** | HttpOnly cookies, per-request session check, CSRF check, audit events. |
| Contact form (`/api/contact`) | **Yes** | Resend + Turnstile verification. |
| Search, timetable, class pages | Mostly build/ISR output | Still served by the Node server. |
| Sanity Studio (`/studio`) | **Yes** (embedded) | Could be hosted separately by Sanity if ever needed. |

## 4. Portability of the Newsletter data and rules (no migration is planned)

Informational only, to show what does not depend on the Next.js code; nothing here is planned.

- The **data** is portable: subscribers live in Supabase tables (`newsletter_subscribers`, `newsletter_events`) with a CSV export and documented consent fields. They do not depend on the Next.js code to exist.
- The **business rules** (double opt-in, versioned consent, HMAC tokens, rate limits, audit events) live in `src/lib/newsletter/*` and the admin code. They are framework-light TypeScript but are not WordPress code; WordPress would need its own implementation (a plugin or a small separate service) or would keep calling a hosted service.
- The **Admin** is a Next.js app with Supabase Auth. It cannot run inside WordPress. It *can* stay a small separately hosted Next.js app (or be replaced), because its only dependencies are Supabase and environment variables.
- **Supabase is independent of the site host.** The database, Auth and RLS policies work unchanged whichever front end calls them. Anything that talks to it needs the service key kept server-side only.
- A static or PHP-only host cannot run the Newsletter/Admin/Contact routes as they are.

## 5. Can the Supabase/Admin system be deployed independently?

Supabase: yes, it is already a separate hosted service (migrations in `supabase/migrations/`, security checks in `supabase/verify_security.sql`).
Admin: it is part of the same Next.js app today. It could be deployed alone (the same build with only the admin and newsletter routes in use) on any Node host, because it needs only the Supabase and mail variables below. No code change is needed for that, and none is proposed.

## 6. Environment variables

Never commit values. `.env.example` lists the names.

| Variable | Used by | Scope | Needed for |
| --- | --- | --- | --- |
| `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) | server | run | Newsletter, Admin, rate limits |
| `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) | server only | run | Database access (bypasses RLS: never expose) |
| `SUPABASE_ANON_KEY` (or publishable key variants) | server | run | Admin OTP sign-in |
| `NEWSLETTER_ADMIN_EMAILS` | server | run | Admin allow-list |
| `NEWSLETTER_TOKEN_SECRET` | server | run | Confirm/unsubscribe tokens (changing it invalidates old links) |
| `APP_BASE_URL` | server | run | Absolute links in emails; must be the public https address |
| `MAIL_PROVIDER` (`resend`), `MAIL_API_KEY`, `MAIL_FROM` | server | run | Confirmation, welcome and contact mail |
| `CONTACT_RECIPIENT_EMAIL` | server | run | Where contact messages go |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | browser | **build** | Turnstile widget |
| `TURNSTILE_SECRET_KEY` | server | run | Turnstile verification |
| `RATE_LIMIT_SALT` | server | run | Hashing of rate-limit keys |
| `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_CLASSES_TABLE` | server | run | Tester classes |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `_DATASET`, `_API_VERSION` | browser | build | Studio / content |
| `SEO_INDEXING`, `VERCEL_ENV` | server | run | Indexing on/off (either enables it) |

**Delivery mode.** `NEWSLETTER_DELIVERY_MODE` (server-side) chooses what a sign-up does once the form is open:

| Mode | What happens | Variables it needs |
| --- | --- | --- |
| `collect_only` (the default; also used if the value is missing or misspelt) | The request is stored in Supabase as an **unverified** `pending` record with the consent version, time and source. **No email is sent and Resend is never called.** Nobody becomes `active`. | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (Admin), `NEWSLETTER_ADMIN_EMAILS`, both Turnstile keys, `RATE_LIMIT_SALT` |
| `double_opt_in` (only the exact value) | The existing workflow: confirmation email, confirm link, `active`, welcome email. | all of the above plus `MAIL_API_KEY`, `MAIL_FROM`, `NEWSLETTER_TOKEN_SECRET`, `APP_BASE_URL` |

An unverified address has not been proved to belong to the person who typed it, so it must never be mailed as a subscriber. The Admin page labels every record **Unverified (pending)**, **Verified (active)** or **Unsubscribed**; its default CSV export (*Export verified recipients*) contains verified addresses only, and the separate *Export all requests, including unverified* file marks every row `DO_NOT_MAIL_unverified` and says so in its name. There is no Admin action that verifies or activates anyone; only the confirmation link in the `double_opt_in` workflow can.

**To use collect-only later** (nothing here has been done): set `NEWSLETTER_ONLINE_SIGNUP_LIVE=true` and leave `NEWSLETTER_DELIVERY_MODE` unset or `collect_only` before a build and redeploy; the privacy policy must be approved and published first. **To switch to the email workflow later:** also set `NEWSLETTER_DELIVERY_MODE=double_opt_in` together with the mail, token-secret and site-address variables, and re-run `scripts/e2e/run-newsletter-e2e.mts`.

`NEWSLETTER_ONLINE_SIGNUP_LIVE` is also a server-side variable (see `.env.example`). Public sign-up is open **only** when it is exactly `true`; a missing, empty or malformed value keeps it closed. Set it **before the build** (the footer form is decided at build time) and redeploy; the sign-up API checks it on every request. Leave it unset until public sign-up is approved. `NEWSLETTER_TOKEN_SECRET` (at least 32 characters) and `APP_BASE_URL` (the public https address) are **required** once sign-up is on; without them sign-up reports itself as not configured.

## 7. Email services

- **Resend** (API over HTTPS): confirmation, welcome and contact mail. `MAIL_FROM` must use a **domain verified in Resend** for production; `onboarding@resend.dev` only delivers to the Resend account owner.
- **Supabase Auth email**: admin login codes. The built-in sender is heavily rate-limited and meant for testing; a custom SMTP provider should be configured in Supabase before relying on emailed admin codes in production. Not configured today, and not changed here.
- **DNS** (SPF/DKIM/DMARC for the sending domain) is a prerequisite for reliable delivery. Not changed here.
- **Cloudflare Turnstile**: free, needs the site key (build) and secret (run); the site's domain must be allowed in the widget.

## 8. Checklist if the host ever changes (not a plan)

Node ≥ 20.9 · build with the env above · `next start` behind HTTPS · forwarded-IP header trusted from the proxy only · headers/redirects preserved · outbound 443 · Supabase service key only on the server · `APP_BASE_URL` correct · mail domain verified · re-run `npx tsx scripts/e2e/run-newsletter-e2e.mts` and the real-Supabase plan on the new host.
