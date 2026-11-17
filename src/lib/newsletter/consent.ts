/**
 * The exact wording shown beside the (unticked) sign-up checkbox. The version is stored with every
 * subscription as consent evidence. If this text changes, change the version and add a row to
 * `newsletter_consent_texts` in a new migration.
 */
export const CONSENT_TEXT_VERSION = "v1-2026-11";

export const CONSENT_TEXT =
    "I'd like to receive occasional news about classes, events and offers from County Hall Dance Centre by email. I can unsubscribe at any time. See our Privacy Policy.";

export const NEWSLETTER_SOURCES = ["footer", "home"] as const;
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];
