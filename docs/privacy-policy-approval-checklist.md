# Privacy Policy: what must be confirmed before publication

Status: **draft. Not approved, not published.** The page is `src/app/privacy/page.tsx`. While it is a draft it shows a "Draft" notice, its title says "(draft)", search engines are told not to index it, it is not in the sitemap, and nothing on the site links to it. No legal fact was invented: every item below is highlighted on the page as **[To be confirmed by the organisation: …]**.

I am not a lawyer, and this is not legal advice. Whether the final text is adequate is for the organisation (and, if wanted, a qualified adviser) to decide.

## Information only the organisation can give

1. **Legal entity.** The legal name and registered address of the organisation responsible for the website. (County Hall Arts must not be named as the Data Controller; it appears on the site only as an event partner.)
2. **ICO registration.** Whether the organisation must pay the ICO data protection fee, and its registration number if so (or the reason none applies).
3. **Date.** "Last updated" date, and who approved the text.
4. **Legal bases.** The basis for answering contact enquiries (the draft proposes legitimate interest or steps before booking) and for newsletters (the draft says consent). Also a check against the electronic-marketing rules (PECR).
5. **Providers and transfers.** For the website host, the email delivery service (Resend), the database (Supabase), and the spam check (Cloudflare Turnstile): the provider names to list, where data is stored, and how transfers outside the UK are protected. (The database region was planned as London; confirm it.)
6. **Turnstile.** Whether it is used in production and what cookies or storage it sets.
7. **Retention.**
   - Never-confirmed newsletter addresses: the draft proposes removal after 30 days. The database function exists (`newsletter_cleanup`) but **the nightly schedule is optional and not confirmed as enabled**; approve the period and confirm the schedule is on, or change the wording.
   - How long contact enquiries stay in the inbox.
   - Keeping an unsubscribed address on a do-not-email record: confirm you want this and the wording.
8. **Administrators.** Who the authorised administrators are (the people in `NEWSLETTER_ADMIN_EMAILS`).
9. **Rights process.** Who answers requests sent to the privacy contact address, and in what time.

## Consistency already checked

- The footer link label, the consent wording beside the sign-up checkbox, and the policy all say "Privacy Policy".
- The policy quotes the exact consent wording and its version (`v1-2026-11`) from the same source the sign-up form uses. If the wording ever changes, the version and the database record must change too (see `src/lib/newsletter/consent.ts`).
- The policy says what the system does: double opt-in, unsubscribe link in every email, no IP address stored with a subscription, people who use the contact form are not added to the newsletter.

## How publishing works (when you approve)

1. Fill in or remove every highlighted item in `src/app/privacy/page.tsx`, and date the policy.
2. Add `"/privacy"` to `PUBLISHED_LEGAL_PAGES` in `src/lib/legal-pages.ts`. That one change removes the draft notice, allows indexing, adds the sitemap entry, adds the Footer link, and makes "Privacy Policy" in the consent wording a link.
3. `scripts/test-legal.mts` fails if `/privacy` is listed while any highlighted item remains, so a draft cannot be published by accident.
4. Public sign-up is a separate switch (`NEWSLETTER_ONLINE_SIGNUP_LIVE`, see `.env.example`) and also needs the other items in `docs/newsletter-admin-deployment-requirements.md`.
