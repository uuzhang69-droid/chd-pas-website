"use client";

import { useCallback, useState } from "react";
import { siteContent } from "@/content/site";
import type { FormField } from "@/content/types";
import { TurnstileField } from "@/components/security/TurnstileField";

type ContactFormProps = {
    fields: FormField[];
    submitLabel: string;
    successMessage: string;
    selectPlaceholder: string;
    /** Kept for compatibility with the page. The form now posts to /api/contact. */
    action?: string;
    defaultSubject?: string;
    defaultAbout?: string;
    defaultMessage?: string;
    recipientEmail?: string;
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Plain statement of what happens to the details sent through this form. It is not a consent box
 * and it does not link to a privacy policy page, because none has been approved and published yet.
 */
const PRIVACY_NOTE =
    "We’ll use the information you provide to respond to your enquiry. We won’t add you to our marketing mailing list.";

function errorMessage(code: string | undefined, retryAfter?: number): string {
    const { email, phone } = siteContent.pages.contact.details;
    const fallback = `You can also email ${email} or call ${phone}.`;
    switch (code) {
        case "rate_limited": {
            const minutes = retryAfter
                ? Math.max(1, Math.ceil(retryAfter / 60))
                : undefined;
            return `You have sent several messages in a short time. Please try again${minutes ? ` in about ${minutes} minute${minutes === 1 ? "" : "s"}` : " later"}. ${fallback}`;
        }
        case "not_configured":
            return `Our contact form is not available right now, and your message has not been sent. ${fallback}`;
        case "bot":
            return "We could not confirm that you are a person. Please reload the page and try again.";
        case "form_expired":
            return "This form has expired. Please reload the page and try again.";
        case "validation":
            return "Please check the highlighted fields.";
        default:
            return `Sorry, your message could not be sent. Please try again in a few minutes. ${fallback}`;
    }
}

export function ContactForm({
    fields,
    submitLabel,
    successMessage,
    selectPlaceholder,
    defaultSubject = "",
    defaultAbout = "",
    defaultMessage = "",
}: ContactFormProps) {
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [renderedAt] = useState(() => Date.now());
    // One shared Turnstile loader: the footer newsletter form on this page uses the same one.
    const [token, setToken] = useState("");
    const [resetKey, setResetKey] = useState(0);
    const handleToken = useCallback((value: string) => setToken(value), []);
    const requiredMarker = siteContent.ui.form.requiredMarker;
    // Tracks the chosen subject so conditional fields (such as "Please specify") can appear.
    const [subject, setSubject] = useState(() =>
        fields
            .find((field) => field.name === "subject")
            ?.options?.some((option) => option.value === defaultSubject)
            ? defaultSubject
            : "",
    );
    const isVisible = (field: FormField) =>
        !field.showWhen ||
        (field.showWhen.field === "subject" && subject === field.showWhen.value);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === "submitting") return;
        const formData = new FormData(event.currentTarget);
        const payload: Record<string, string> = {
            hp: String(formData.get("hp") ?? ""),
            t: String(renderedAt),
            turnstileToken: token,
        };
        for (const field of fields.filter(isVisible))
            payload[field.name] = String(formData.get(field.name) ?? "");

        if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token) {
            setMessage("Please complete the security check first.");
            setStatus("error");
            return;
        }
        setStatus("submitting");
        setMessage("");
        setFieldErrors({});
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = (await response.json().catch(() => ({}))) as {
                ok?: boolean;
                code?: string;
                errors?: Record<string, string>;
                retryAfter?: number;
            };
            // Success is shown only when the server says the mail service accepted the message.
            if (response.ok && data.ok === true) {
                setStatus("success");
                return;
            }
            setFieldErrors(data.errors ?? {});
            setMessage(errorMessage(data.code, data.retryAfter));
        } catch {
            setMessage(errorMessage(undefined));
        }
        setResetKey((value) => value + 1);
        setStatus("error");
    }

    if (status === "success") {
        return (
            <div
                className="rounded-sm border border-rose/40 bg-ivory px-6 py-8"
                role="status"
            >
                <p className="text-body-lg text-charcoal">{successMessage}</p>
            </div>
        );
    }

    return (
        <form
            action="/api/contact"
            method="post"
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate={false}
        >
            {fields.filter(isVisible).map((field) => {
                const error = fieldErrors[field.name];
                const describedBy = error ? `${field.name}-error` : undefined;
                const common = {
                    id: field.name,
                    name: field.name,
                    required: field.required,
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": describedBy,
                };
                return (
                    <div key={field.name}>
                        <label
                            htmlFor={field.name}
                            className="text-small font-semibold text-charcoal"
                        >
                            {field.label}
                            {field.required && (
                                <span className="text-rose">
                                    {requiredMarker}
                                </span>
                            )}
                        </label>
                        {field.type === "textarea" ? (
                            <textarea
                                {...common}
                                rows={5}
                                maxLength={5000}
                                placeholder={field.placeholder}
                                defaultValue={
                                    field.name === "message"
                                        ? defaultMessage
                                        : undefined
                                }
                                className="mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
                            />
                        ) : field.type === "select" ? (
                            <select
                                {...common}
                                className="mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
                                onChange={
                                    field.name === "subject"
                                        ? (event) => setSubject(event.target.value)
                                        : undefined
                                }
                                defaultValue={
                                    field.name === "subject" &&
                                    field.options?.some(
                                        (option) =>
                                            option.value === defaultSubject,
                                    )
                                        ? defaultSubject
                                        : field.name === "about" &&
                                            field.options?.some(
                                                (option) =>
                                                    option.value ===
                                                    defaultAbout,
                                            )
                                          ? defaultAbout
                                          : ""
                                }
                            >
                                <option value="" disabled>
                                    {field.placeholder ?? selectPlaceholder}
                                </option>
                                {field.options?.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                {...common}
                                type={field.type}
                                maxLength={field.type === "email" ? 254 : 200}
                                placeholder={field.placeholder}
                                className="mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
                            />
                        )}
                        {error && (
                            <p
                                id={describedBy}
                                className="text-small mt-1 text-burgundy"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                );
            })}

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
                <label htmlFor="contact-website">Leave this field empty</label>
                <input
                    id="contact-website"
                    name="hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            <TurnstileField onToken={handleToken} resetKey={resetKey} />

            {message && (
                <p
                    role="alert"
                    className="rounded-sm border border-burgundy/40 bg-ivory px-4 py-3 text-small text-burgundy"
                >
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-sm bg-burgundy px-6 py-3 text-small font-semibold text-ivory transition-colors hover:bg-burgundy/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {status === "submitting" ? "Sending…" : submitLabel}
            </button>
            <p className="text-small text-charcoal/65">{PRIVACY_NOTE}</p>
            <noscript>
                <p className="text-small text-charcoal/70">
                    This form needs JavaScript. Please email{" "}
                    {siteContent.pages.contact.details.email} instead.
                </p>
            </noscript>
        </form>
    );
}
