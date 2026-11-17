/**
 * Switches for features that are built but not yet live.
 *
 * NEWSLETTER_ONLINE_SIGNUP_LIVE (server-side environment variable, NOT NEXT_PUBLIC_):
 * public newsletter sign-up is open only when the variable is exactly the word "true" (any capitalisation).
 * Anything else, including a missing, empty, misspelt or numeric value ("1", "yes"), keeps it closed.
 * It is read on the server only (a client component would see an undefined value, which keeps it closed): the footer form is shown or hidden when the page is built, and the sign-up API
 * checks it on every request, so change it before a build and redeploy. Do not turn it on until the
 * privacy policy is approved and published, the database, the sending domain and the confirmation email have been
 * tested, and NEWSLETTER_TOKEN_SECRET and APP_BASE_URL are set (see docs/newsletter-admin-deployment-requirements.md).
 */
export function parseStrictFlag(value: string | undefined): boolean {
    return value?.trim().toLowerCase() === "true";
}

export function isNewsletterSignupLive(env: Record<string, string | undefined> = process.env): boolean {
    return parseStrictFlag(env.NEWSLETTER_ONLINE_SIGNUP_LIVE);
}

/**
 * How a newsletter sign-up is handled once public sign-up is open (NEWSLETTER_DELIVERY_MODE, server-side):
 *
 * - "collect_only" (the safe default): the request is stored as an UNVERIFIED "pending" record with its consent details.
 *   No email of any kind is sent, so nothing is called at Resend, and nobody becomes "active". The address has not been
 *   checked: it must not be treated as a confirmed marketing recipient.
 * - "double_opt_in": the existing workflow. A confirmation email is sent, the person confirms, and only then do they
 *   become "active"; a welcome email follows.
 *
 * Only the exact value "double_opt_in" selects the email workflow; anything else, including a missing, empty or
 * misspelt value, means "collect_only". This does not open sign-up: NEWSLETTER_ONLINE_SIGNUP_LIVE does that.
 */
export type NewsletterDeliveryMode = "collect_only" | "double_opt_in";

export function getNewsletterDeliveryMode(env: Record<string, string | undefined> = process.env): NewsletterDeliveryMode {
    return env.NEWSLETTER_DELIVERY_MODE?.trim().toLowerCase() === "double_opt_in" ? "double_opt_in" : "collect_only";
}

/**
 * Header search and the /search page (src/lib/search). Set to false to hide the search icon and the
 * mobile search box again without removing any code.
 */
export const SITE_SEARCH_LIVE = true;
