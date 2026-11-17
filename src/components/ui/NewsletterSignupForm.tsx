"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { isLegalPagePublished } from "@/lib/legal-pages";
import { TurnstileField } from "@/components/security/TurnstileField";
import { CONSENT_TEXT, CONSENT_TEXT_VERSION } from "@/lib/newsletter/consent";

type NewsletterSignupFormProps = {
    inputId: string;
    placeholder: string;
    submitLabel: string;
    inputClassName: string;
    buttonClassName: string;
    formClassName?: string;
};

type Status = "idle" | "submitting" | "done" | "error";

function failureMessage(code: string | undefined, retryAfter?: number): string {
    switch (code) {
        case "not_available":
            return "Newsletter sign-up is not open yet, and you have not been subscribed.";
        case "not_configured":
        case "unavailable":
            return "Newsletter sign-up is not available right now, and you have not been subscribed. Please try again later.";
        case "rate_limited": {
            const minutes = retryAfter
                ? Math.max(1, Math.ceil(retryAfter / 60))
                : undefined;
            return `Too many attempts. Please try again${minutes ? ` in about ${minutes} minute${minutes === 1 ? "" : "s"}` : " later"}.`;
        }
        case "bot":
            return "We could not confirm that you are a person. Please reload the page and try again.";
        case "form_expired":
        case "form_outdated":
            return "This form is out of date. Please reload the page and try again.";
        case "mail_rejected":
        case "mail_unavailable":
            return "We could not send your confirmation email just now, so you are not subscribed yet. Please try again in a few minutes.";
        default:
            return "Sorry, something went wrong and you have not been subscribed. Please try again.";
    }
}

export function NewsletterSignupForm({
    inputId,
    placeholder,
    submitLabel,
    inputClassName,
    buttonClassName,
    formClassName = "flex flex-col gap-2 sm:flex-row",
}: NewsletterSignupFormProps) {
    // Where the form sits, saved with the subscription: the home band's input id starts with "home".
    const source = inputId.startsWith("home") ? "home" : "footer";
    const [status, setStatus] = useState<Status>("idle");
    const [consent, setConsent] = useState(false);
    const [message, setMessage] = useState("");
    // What the server answered on success: "check_email" (a confirmation email was sent) or "request_received" (stored, nothing sent).
    const [doneCode, setDoneCode] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [token, setToken] = useState("");
    const [resetKey, setResetKey] = useState(0);
    const [renderedAt] = useState(() => Date.now());
    const handleToken = useCallback((value: string) => setToken(value), []);

    // Colours follow an ancestor marked data-tone="dark" (the burgundy footer); otherwise the light page style.
    const muted = "text-charcoal/70 group-data-[tone=dark]/tone:text-ivory/75";
    const linkClass =
        "text-burgundy underline group-data-[tone=dark]/tone:text-rose";
    const errorClass = "text-burgundy group-data-[tone=dark]/tone:text-rose";

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === "submitting") return;
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        setMessage("");
        setFieldErrors({});
        if (!consent) {
            setFieldErrors({
                consent: "Please tick the box to agree before subscribing.",
            });
            return;
        }
        if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token) {
            setMessage("Please complete the security check first.");
            return;
        }
        setStatus("submitting");
        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    consent: true,
                    consentVersion: CONSENT_TEXT_VERSION,
                    source,
                    sourcePath: window.location.pathname,
                    hp: String(formData.get("hp") ?? ""),
                    t: String(renderedAt),
                    turnstileToken: token,
                }),
            });
            const data = (await response.json().catch(() => ({}))) as {
                ok?: boolean;
                code?: string;
                errors?: Record<string, string>;
                retryAfter?: number;
            };
            // Only the server's own accepted answer counts, and it never claims a verified or active subscription.
            if (response.status === 202 && data.ok === true) {
                setDoneCode(String(data.code ?? ""));
                setStatus("done");
                return;
            }
            setFieldErrors(data.errors ?? {});
            setMessage(
                data.code === "validation"
                    ? ""
                    : failureMessage(data.code, data.retryAfter),
            );
        } catch {
            setMessage(failureMessage(undefined));
        }
        setResetKey((value) => value + 1);
        setStatus("error");
    }

    if (status === "done") {
        return (
            <p role="status" className={`text-body ${muted}`}>
                {doneCode === "request_received"
                    ? "Thank you, your request has been received. We have not sent you an email and we have not verified your address, so you are not yet on our confirmed mailing list."
                    : "Almost done. We have emailed you a link to confirm your subscription. You will not be subscribed until you click it."}
            </p>
        );
    }

    return (
        <div>
            <form className={formClassName} onSubmit={handleSubmit}>
                <label htmlFor={inputId} className="sr-only">
                    {placeholder}
                </label>
                <input
                    id={inputId}
                    type="email"
                    name="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder={placeholder}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={
                        fieldErrors.email ? `${inputId}-error` : undefined
                    }
                    className={inputClassName}
                />
                {/* Spam trap: real visitors never see or fill this. */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "-10000px",
                        width: 1,
                        height: 1,
                        overflow: "hidden",
                    }}
                >
                    <input
                        name="hp"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={`${buttonClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    {status === "submitting" ? "Sending…" : submitLabel}
                </button>
            </form>

            <label
                className={`mt-3 flex items-start gap-2 text-small ${muted}`}
            >
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    aria-invalid={fieldErrors.consent ? true : undefined}
                    className="mt-1 h-4 w-4 shrink-0"
                />
                <span>
                    {CONSENT_TEXT.split("Privacy Policy")[0]}
                    {isLegalPagePublished("/privacy") ? (
                        <Link href="/privacy" className={linkClass}>
                            Privacy Policy
                        </Link>
                    ) : (
                        "Privacy Policy"
                    )}
                    {CONSENT_TEXT.split("Privacy Policy")[1]}
                </span>
            </label>

            <TurnstileField onToken={handleToken} resetKey={resetKey} />

            {(fieldErrors.email || fieldErrors.consent || message) && (
                <p
                    id={`${inputId}-error`}
                    role="alert"
                    className={`mt-2 text-small ${errorClass}`}
                >
                    {fieldErrors.email ?? fieldErrors.consent ?? message}
                </p>
            )}
        </div>
    );
}
