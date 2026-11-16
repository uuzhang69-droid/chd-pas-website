/**
 * What the visitor is told when sending fails. Plain wording, no internal detail: the technical cause is
 * written to the server log, and a short reference lets us find that log line.
 */
export type ContactFailure = {
    /** HTTP status, or undefined when the request never got an answer. */
    status?: number;
    code?: string;
    retryAfter?: number;
    ref?: string;
};

export type ContactFallback = { email: string; phone: string };

const kept = "Your message is still in the form.";

export function contactFailureMessage(
    failure: ContactFailure,
    contact: ContactFallback,
): string {
    const fallback = `You can also email ${contact.email} or call ${contact.phone}.`;
    const reference = failure.ref ? ` Reference: ${failure.ref}.` : "";
    const { status, code } = failure;

    if (status === undefined)
        return `We could not reach the website. Please check your connection and try again. ${kept}`;

    switch (code) {
        case "validation":
            return "Please check the highlighted fields.";
        case "rate_limited": {
            const minutes = failure.retryAfter
                ? Math.max(1, Math.ceil(failure.retryAfter / 60))
                : undefined;
            return `You have tried to send several messages in a short time, so we have paused sending. Please try again${minutes ? ` in about ${minutes} minute${minutes === 1 ? "" : "s"}` : " a little later"}. ${kept} ${fallback}`;
        }
        case "bot":
            return "We could not confirm that you are a person. Please complete the security check and send again.";
        case "form_expired":
            return `This form has been open for a long time. Please reload the page and try again. ${fallback}`;
        case "bad_origin":
            return `This page needs to be reloaded before it can send your message. Please refresh the page and try again. ${fallback}`;
        case "not_configured":
            return `Our contact form is not available right now, and your message has not been sent. ${fallback}`;
        case "verification_unavailable":
            return `We could not complete the security check just now. Please try again in a moment. ${kept}${reference}`;
        case "mail_rejected":
        case "mail_unavailable":
            return `Sorry, we could not send your message just now. ${kept} Please try again in a few minutes. ${fallback}${reference}`;
        default:
            break;
    }
    if (status === 403)
        return `This page needs to be reloaded before it can send your message. Please refresh the page and try again. ${fallback}`;
    if (status === 429)
        return `You have tried to send several messages in a short time. Please try again in a few minutes. ${kept} ${fallback}`;
    if (status >= 500)
        return `Sorry, something went wrong on our side and your message has not been sent. ${kept} Please try again in a few minutes. ${fallback}${reference}`;
    return `Sorry, your message could not be sent. ${kept} Please check the details and try again. ${fallback}${reference}`;
}
