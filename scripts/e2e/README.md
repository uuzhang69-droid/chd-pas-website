# Mocked end-to-end tests (Newsletter and Admin)

91 checks (double opt-in mode) plus 31 for the collect-only default mode, driving the **real built website** (a throw-away copy) against a **local mock** of Supabase and a local mock mailbox.
Nothing here talks to the real Supabase, Resend, Cloudflare Turnstile or Airtable.

## Run

```bash
npx tsx scripts/e2e/run-newsletter-e2e.mts
```

Takes about 2–4 minutes (it builds the site). Expected last line: `91/91 passed`. For the default collect-only mode (no email at all): `npx tsx scripts/e2e/run-newsletter-e2e.mts --collect-only` (31/31). Add `--keep` to leave `.e2e-build/` for inspection.
Ports 3300 and 4010 on 127.0.0.1 must be free. Quick safety test (no server, one second):

```bash
npx tsx --test scripts/test-e2e-harness.mts
```

## What is in this folder

| File | Purpose |
| --- | --- |
| `run-newsletter-e2e.mts` | Runner: copies the site to `.e2e-build/`, turns the sign-up flag on **in the copy only**, builds, starts mock + site, runs the checks, cleans up. |
| `newsletter-e2e.mts` | The 91 checks (auth/sessions, admin dashboard/CSV/actions, public sign-up lifecycle, leak scan). |
| `mock-supabase.cjs` | In-memory stand-in for Supabase Auth and PostgREST. Fixed `example.test` users, deterministic ids and codes. |
| `preload.cjs` | Loaded into every test process. Captures Resend mail, answers Turnstile locally, refuses any connection that is not to this computer (both `fetch` and raw sockets). |
| `config.mts` | Fake, local settings handed to the test copy. |

## Why it cannot reach real services

- Child processes get an explicit small environment (`baseEnv()` plus fake values). `process.env` is never spread, and `.env.local` is never read or copied.
- `preload.cjs` blocks every non-local host. The only exception is the **build step**, which may fetch the two Google Fonts hosts (`next/font`); the running server and the checks get no exception.
- The real `src/lib/features.ts` is never edited; the runner re-checks that the real flag is still `false`.
- `scripts/test-e2e-harness.mts` proves the blocking works.

## What mocked tests do NOT prove

Real Supabase behaviour (RLS, real GoTrue timing and error codes, real email delivery, real DNS/SMTP). See `docs/newsletter-real-supabase-test-plan.md`.
