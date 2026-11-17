# Newsletter / Admin: manual real-Supabase test plan (ONE test subscriber)

Status: **plan only. Nothing in this document has been run.** No real Supabase record has been created, changed or deleted, and no email has been sent.

Goal: confirm, with the real Supabase project, the things the mocked tests cannot prove, using exactly one dedicated test subscriber and the normal double opt-in path (no shortcuts).

## 0. Decisions needed before starting

| Question | Needed answer |
| --- | --- |
| Test address | A mailbox you control, e.g. a plus-address of your own inbox. Use it for the single subscriber. Do not use a real customer. |
| Who receives the confirmation email? | With `MAIL_FROM` on `onboarding@resend.dev`, Resend only delivers to the **Resend account owner's** address. So either the test address is that owner address, or the sending domain is verified in Resend first. Pick one. |
| Is it acceptable to send **one** real email via Resend? | Required for the confirm step (double opt-in cannot be skipped). |
| Admin sign-in | Use the existing local-only tool (`docs/admin-local-login-testing.md`) or a real emailed OTP. |

## 1. Do the existing endpoints suffice?

Yes for every step, **with one practical gap**.

- Create pending subscriber: `POST /api/newsletter/subscribe` (the same call the footer form makes).
- Confirm: the link in the confirmation email → `/newsletter/confirm` → button → `POST /api/newsletter/confirm`.
- View/search/filter/export/status/delete: the Admin dashboard and its routes.
- Gap: `NEWSLETTER_ONLINE_SIGNUP_LIVE` is not `true`, so the subscribe route answers 404. It is set to `true` **only in the environment of a throw-away copy** (never in `.env.local`, never deployed). The launcher in section 7 does this with a fixed allow-list of outbound hosts and a recipient lock, and has a `--dry-run`.
- No separate seeding/admin-insert utility is needed or recommended: inserting rows directly would bypass consent recording and double opt-in.

## 2. Safety rules for the run

1. The throw-away copy runs on `127.0.0.1` only, built from the current code with the flag flipped **only in the copy**.
2. Outbound allow-list: the Supabase project host, `api.resend.com`, and (if the real widget is used) Cloudflare Turnstile. Use Turnstile's published **test keys** locally so no real challenge is needed.
3. Recipient lock: the launcher refuses to send mail to any address except the one test address.
4. One subscriber only. If a second record appears, stop.
5. Secrets are read from the local `.env.local` by the copy's own process; they are never printed, pasted in chat, or committed.
6. The test address and the subscriber's row id are noted in the test log; no other rows are touched.
7. Cleanup (step 8) happens **only after you say so in chat**.

## 3. Steps and expected results

| # | Action | Expected |
| --- | --- | --- |
| 1 | Baseline: sign in to `/admin/newsletter`, note the total count and that the test address is absent. | Dashboard loads; the test address is not listed. |
| 2 | Submit the test address once through the footer form on the throw-away copy (consent ticked). | Neutral "check your email" message. One new row, status **pending**, source `footer`, current consent version, consent time set. |
| 3 | Reload Admin. | Count is baseline + 1; row shows **pending**, source, consent version. No other row changed. |
| 4 | Search for part of the address in upper and lower case. | Exactly 1 match both times. |
| 5 | Filter status = pending, then source = footer, then both. | Row appears for each; filter status = active/unsubscribed does not show it. |
| 6 | Export CSV with and without the filter. | File has BOM and the documented headers; the test row is present; no ids or tokens; the export is logged as `admin_export`. |
| 7a | Open the emailed confirmation link, then press the button. | Opening alone changes nothing; pressing the button makes the row **active** with a confirmed time; one welcome email. |
| 7b | Admin: refresh. Filter status = active. | Row is active. |
| 7c | Admin: "Unsubscribe" on the row. | Row becomes **unsubscribed** with a time; `unsubscribed_by_admin` event recorded without the address. |
| 7d | (Optional, would send a second email) Subscribe the same address again. | Returns to **pending** with fresh consent; a new confirmation email. Skip if one email is the agreed limit. |
| 8 | **After explicit approval only:** Admin "Delete" on that one row. | Row gone; `deleted_by_admin` event recorded with no address or id. Count returns to baseline. |
| 9 | Sign out. | Session ended at Supabase; old cookies are refused. |

Also verify (read-only, in the Supabase dashboard or via `supabase/verify_security.sql` that you run yourself): RLS enabled on `newsletter_subscribers`/`newsletter_events`, no public policies. This plan does not execute SQL.

## 4. Stop conditions

Stop and report if: a row for any other address appears or changes; an email would go to any address other than the test address; the confirmation email is missing after a few minutes (check Resend's log, do not resend repeatedly: three per hour per address is the limit); any step shows secrets, tokens or codes in a response or log.

## 5. Cleanup

Only the test row, only through the Admin "Delete" action (which is audited), only after you approve in chat. The `newsletter_events` rows for the test remain by design (they hold no address). If Resend recorded the message, that stays in Resend's log.

## 6. What this proves that the mocked tests cannot

Real RLS and service-key behaviour, real PostgREST filter/`ilike`/count semantics, real Auth error codes, real Resend delivery and the `MAIL_FROM` restriction, and real rate-limit RPC behaviour.

> **Note (delivery mode):** this plan and its launcher test the `double_opt_in` workflow, so the launcher sets `NEWSLETTER_DELIVERY_MODE=double_opt_in` in its throw-away copy. The default mode, `collect_only`, sends no email at all; it is covered by `scripts/test-newsletter-collect.mts` and `npx tsx scripts/e2e/run-newsletter-e2e.mts --collect-only` against the local mock. Because the launcher changed, run its `--dry-run` again before any live run.

## 7. The launcher

`scripts/e2e/run-real-newsletter-test.mts` implements this plan for the fixed test address `website.countyhalldance@gmail.com` and sender `County Hall Dance Centre <onboarding@resend.dev>` (neither can be changed from the command line).

```bash
npx tsx scripts/e2e/run-real-newsletter-test.mts --dry-run
```

- `--dry-run` (default): same code path against the local mock; no real database write, no real e-mail.
- `--execute --approved-live-run`: the real run (2 real e-mails). Refused unless a dry run passed for exactly this version of the mechanism and the Newsletter/Admin code (hash stamp in `.real-test/`).
- `--cleanup --approved-cleanup`: deletes only the test row through the admin Delete action.

Safety gate (`scripts/e2e/real-test-preload.cjs`, fails closed): only the approved address can be written or mailed; at most 2 e-mails from the approved sender; Supabase's own login-code e-mail is blocked; rows change only one at a time by id; deletion is off except in the cleanup run; reachable hosts are this computer, the one Supabase project and api.resend.com. Turnstile is answered locally. `NEWSLETTER_ONLINE_SIGNUP_LIVE` is closed in the real source and in `.env.local`; it is `true` only in the environment of the throw-away `.e2e-build/` copy on 127.0.0.1. The setting now comes from the environment, so the launcher's version stamp changed: **run `--dry-run` again before any live run.**
