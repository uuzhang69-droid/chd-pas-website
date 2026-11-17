import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/HeroParts";
import { CONSENT_TEXT, CONSENT_TEXT_VERSION } from "@/lib/newsletter/consent";
import { isLegalPagePublished } from "@/lib/legal-pages";

/**
 * This page is a DRAFT until the organisation has approved it. Three things follow from one switch,
 * the entry "/privacy" in src/lib/legal-pages.ts (PUBLISHED_LEGAL_PAGES):
 * - the draft banner, the "(draft)" title and the highlighted [To be confirmed] items are shown and the page is kept
 *   out of search results while it is not listed there;
 * - the footer link and the link inside the newsletter consent wording appear only once it is listed;
 * - scripts/test-legal.mts fails if it is listed while any [To be confirmed] item remains in this file.
 * Nothing here has been approved as a legal document, and no legal fact below was invented: every item the
 * organisation must supply is marked.
 */
const published = isLegalPagePublished("/privacy");

export const metadata: Metadata = published
    ? { title: "Privacy Policy" }
    : { title: "Privacy Policy (draft)", robots: { index: false, follow: true } };

/** A fact the organisation must supply or approve. Visible only while the page is a draft. */
function ToConfirm({ children }: { children: ReactNode }) {
    return (
        <mark className="rounded-sm bg-blush/70 px-1.5 py-0.5 text-charcoal">
            [To be confirmed by the organisation: {children}]
        </mark>
    );
}

const SECTIONS = [
    { id: "who", title: "Who is responsible for your information" },
    { id: "collect", title: "What we collect" },
    { id: "why", title: "Why we use it, and our legal basis" },
    { id: "share", title: "Who receives your information" },
    { id: "keep", title: "How long we keep it" },
    { id: "rights", title: "Unsubscribing and your rights" },
] as const;

function PolicySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section id={id} className="scroll-mt-32">
            <h2 className="text-h2 text-charcoal">{title}</h2>
            <div className="mt-4 space-y-4 text-body-lg text-charcoal/80">{children}</div>
        </section>
    );
}

const listClass = "list-disc space-y-3 pl-6 marker:text-rose";

export default function PrivacyPage() {
    const { email } = siteContent.pages.contact.details;
    const mailLink = (
        <a href={`mailto:${email}`} className="text-burgundy underline underline-offset-4 hover:text-charcoal">
            {email}
        </a>
    );

    return (
        <PageShell>
            <section className="section-y">
                <Container>
                    {!published && (
                        <div role="note" className="rounded-sm border border-burgundy/40 bg-blush/20 px-5 py-4">
                            <p className="text-small font-semibold uppercase tracking-[0.16em] text-burgundy">Draft</p>
                            <p className="text-body mt-1 text-charcoal/80">
                                This is a working draft. It has not been approved as a legal document and must not be relied on.
                                Highlighted items still need to be confirmed by the organisation before this policy is final.
                            </p>
                        </div>
                    )}

                    <header className={published ? "" : "mt-10"}>
                        <Eyebrow tone="light">Your information</Eyebrow>
                        <h1 className="text-h1 mt-4 text-charcoal">Privacy Policy</h1>
                        <p className="text-body-lg mt-5 text-charcoal/80">
                            This page explains what personal information we collect through our website contact form and
                            newsletter sign-up, why we collect it, and what choices you have.{" "}
                            {published ? null : <ToConfirm>date this policy was last updated</ToConfirm>}
                        </p>
                    </header>

                    <div className="mt-12">
                        <nav aria-label="On this page" className="rounded-sm border border-taupe/40 bg-blush/20 px-6 py-5">
                            <p className="text-small font-semibold uppercase tracking-[0.16em] text-charcoal/60">On this page</p>
                            <ol className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                                {SECTIONS.map((section) => (
                                    <li key={section.id}>
                                        <a href={`#${section.id}`} className="text-small text-charcoal/80 underline-offset-4 hover:text-burgundy hover:underline">
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        <div className="mt-12 space-y-12">
                            <PolicySection id="who" title={SECTIONS[0].title}>
                                <p>
                                    County Hall Dance Centre, also known as County Hall Dance &amp; Performing Arts School, runs this
                                    website.
                                </p>
                                <ul className={listClass}>
                                    <li>
                                        Legal name and registered address of the organisation responsible:{" "}
                                        <ToConfirm>legal entity name and address</ToConfirm>
                                    </li>
                                    <li>
                                        Data protection registration with the Information Commissioner&apos;s Office, if any:{" "}
                                        <ToConfirm>ICO registration number, or the reason none is needed</ToConfirm>
                                    </li>
                                    <li>Contact for privacy questions: {mailLink}</li>
                                </ul>
                            </PolicySection>

                            <PolicySection id="collect" title={SECTIONS[1].title}>
                                <ul className={listClass}>
                                    <li>
                                        <strong className="font-semibold text-charcoal">Contact form:</strong> your name, email
                                        address, optional phone number, the subject you choose and your message.
                                    </li>
                                    <li>
                                        <strong className="font-semibold text-charcoal">Newsletter:</strong> your email address, the
                                        page where you signed up, the time you agreed, which version of the agreement wording you saw
                                        ({CONSENT_TEXT_VERSION}), and, if your address is later verified, the time it was verified. We do not store your IP address or
                                        browser details with your subscription.
                                    </li>
                                    <li>
                                        <strong className="font-semibold text-charcoal">Security:</strong> to limit spam we count
                                        requests per device using a scrambled (hashed) form of the network address, and we may use a
                                        spam-protection check such as Cloudflare Turnstile.{" "}
                                        <ToConfirm>whether Turnstile is used, and any cookies or storage it sets</ToConfirm>
                                    </li>
                                    <li>
                                        <strong className="font-semibold text-charcoal">Website administration:</strong> authorised
                                        administrators can see and export the newsletter list. We keep a record of administrative actions
                                        (such as signing in, exporting, unsubscribing or deleting a subscriber); these records do not
                                        contain subscribers&apos; email addresses.{" "}
                                        <ToConfirm>who the authorised administrators are</ToConfirm>
                                    </li>
                                </ul>
                            </PolicySection>

                            <PolicySection id="why" title={SECTIONS[2].title}>
                                <ul className={listClass}>
                                    <li>
                                        To reply to your enquiry. Proposed basis: our legitimate interest in answering people who contact
                                        us, or steps you ask us to take before booking. <ToConfirm>legal basis</ToConfirm>
                                    </li>
                                    <li>
                                        To send you occasional news about classes, events and offers by email, only if you tick the box
                                        and only once your address has been verified. Basis: your consent, which you can withdraw at any time.{" "}
                                        <ToConfirm>legal basis, and a check against the rules on electronic marketing (PECR)</ToConfirm>
                                    </li>
                                </ul>
                                <p>
                                    People who use the contact form are not added to the newsletter.
                                </p>
                                <p>
                                    When you use the newsletter form we store your request. At the moment we do not send you an email
                                    when you do this, and we have not checked that the address is yours, so it is recorded as unverified.
                                    An unverified address is not treated as a subscriber and is not used for news.{" "}
                                    <ToConfirm>
                                        how and when addresses will be verified before the first newsletter is sent (a confirmation-email
                                        process exists but is currently switched off)
                                    </ToConfirm>
                                </p>
                                <figure className="rounded-sm border border-taupe/40 bg-blush/20 px-5 py-4">
                                    <figcaption className="text-small font-semibold uppercase tracking-[0.16em] text-charcoal/60">
                                        The wording you agree to when you subscribe ({CONSENT_TEXT_VERSION})
                                    </figcaption>
                                    <blockquote className="text-body mt-2 text-charcoal/80">{CONSENT_TEXT}</blockquote>
                                </figure>
                            </PolicySection>

                            <PolicySection id="share" title={SECTIONS[3].title}>
                                <p>
                                    Our website host, an email delivery service that sends our messages, a database service that stores
                                    newsletter subscribers, and a spam-protection service. We do not sell your information.
                                </p>
                                <p>
                                    Names, locations and transfer safeguards:{" "}
                                    <ToConfirm>
                                        list each provider, where data is stored, and how transfers outside the UK are protected
                                    </ToConfirm>
                                </p>
                            </PolicySection>

                            <PolicySection id="keep" title={SECTIONS[4].title}>
                                <ul className={listClass}>
                                    <li>
                                        Newsletter requests that are never verified: removed after 30 days (proposed).{" "}
                                        <ToConfirm>
                                            approve this period, and confirm that the nightly clean-up is scheduled in the database
                                        </ToConfirm>
                                    </li>
                                    <li>Verified subscribers: until you unsubscribe.</li>
                                    <li>
                                        After you unsubscribe we keep your address on a do-not-email record so that we do not email you
                                        again, unless you ask us to erase it.
                                    </li>
                                    <li>
                                        Contact enquiries are held in our email inbox.{" "}
                                        <ToConfirm>retention period for enquiries</ToConfirm>
                                    </li>
                                </ul>
                            </PolicySection>

                            <PolicySection id="rights" title={SECTIONS[5].title}>
                                <p>
                                    Every newsletter email will contain an unsubscribe link, and you can also email {mailLink} at any time to be
                                    removed or to ask us to delete your request.
                                </p>
                                <p>
                                    You may ask to see, correct, erase or restrict the information we hold about you, object to its use,
                                    or withdraw consent at any time. You can complain to the Information Commissioner&apos;s Office
                                    (ico.org.uk) if you are unhappy with how we handle your information.
                                </p>
                            </PolicySection>

                            <p className="text-small text-charcoal/60">
                                <Link href="/" className="text-burgundy underline underline-offset-4">
                                    Back to the website
                                </Link>
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </PageShell>
    );
}
