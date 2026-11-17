# Newsletter admin: local sign-in testing without the email

For local development only. Production sign-in is unchanged: an emailed one-time code through `/admin/login`.

## Why a command and not a page or endpoint
Supabase Auth's admin API (`generate_link`) can create a real sign-in token for an existing user and return its numeric
`email_otp` without sending any email. It needs the service key, so it is a command in your own terminal. It is not a
route, not imported by any website code, and refuses to run on a hosting platform or with `NODE_ENV=production`.
You then sign in through the normal page, so the allow-list, rate limits, cookies and audit trail all still apply.

## Steps
1. Make sure `.env.local` has `SUPABASE_URL`, an anon or publishable key, `SUPABASE_SERVICE_ROLE_KEY` (or
   `SUPABASE_SECRET_KEY`) and `NEWSLETTER_ADMIN_EMAILS`, and that the admin user exists in Supabase with a confirmed email.
2. Start the site locally and open `http://localhost:3000/admin/login`.
3. Enter the admin email and press the first button. This moves to the code step. (Supabase may try to email its normal
   message. Ignore it. Supabase also allows one request per address about every minute.)
4. In a terminal in the project folder, **after step 3**:

   ```bash
   npx tsx scripts/dev-admin-otp.mts you@example.com
   ```
5. Type the printed code on the code step. It works once.

Order matters: asking for a code on the page makes Supabase issue a new token and replaces any earlier one, so the code
from the command must be made after step 3 and used straight away.

## What the command refuses
- Any environment that looks like production or a hosting platform (`NODE_ENV=production`, `VERCEL`, `VERCEL_ENV`, `CI`, ...).
- An address that is not in `NEWSLETTER_ADMIN_EMAILS`.
- A user that does not exist (it never creates an account) or whose email is not confirmed.

It writes one audit row (`dev_otp_generated`, the address, never the code). The later sign-in is logged as usual (`admin_login`).
