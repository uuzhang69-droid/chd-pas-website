"use client";

import { useCallback, useState } from "react";
import { siteContent } from "@/content/site";
import type { FormField } from "@/content/types";
import { TurnstileField } from "@/components/security/TurnstileField";
import { contactFailureMessage } from "@/lib/contact/messages";
import { validateContact } from "@/lib/contact/validate";

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

const inputBase =
    "mt-2 w-full rounded-sm border bg-ivory px-4 py-3 text-body outline-none";
const inputOk = "border-taupe/50 focus:border-rose";
const inputBad = "border-red-600 focus:border-red-600";

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
    const requiredMarker = siteContent.ui.form.requiredMarker.trim();
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
    const visibleFields = fields.filter(isVisible);
    const { email: fallbackEmail, phone: fallbackPhone } =
        siteContent.pages.contact.details;

    function clearError(name: string) {
        setFieldErrors((current) => {
            if (!current[name]) return current;
            const { [name]: _removed, ...rest } = current;
            void _removed;
            return rest;
        });
    }

    function focusFirstError(errors: Record<string, string>) {
        const first = visibleFields.find((field) => errors[field.name]);
        if (!first) return;
        const element = document.getElementById(first.name);
        element?.scrollIntoView({ block: "center", behavior: "smooth" });
        element?.focus({ preventScroll: true });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === "submitting") return;
        const formData = new FormData(event.currentTarget);
        const payload: Record<string, string> = {
            hp: String(formData.get("hp") ?? ""),
            t: String(renderedAt),
            turnstileToken: token,
        };
        for (const field of visibleFields)
            payload[field.name] = String(formData.get(field.name) ?? "");

        // 1. Check every field in the browser first: all problems are shown at once and nothing is sent.
        const { errors } = validateContact(fields, payload);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setMessage("Please check the highlighted fields.");
            setStatus("error");
            focusFirstError(errors);
            return;
        }
        if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !token) {
            setFieldErrors({});
            setMessage(
                "Please wait for the security check to finish, then send your message again.",
            );
            setStatus("error");
            return;
        }

        setStatus("submitting");
        setMessage("");
        setFieldErrors({});
        let failure: Parameters<typeof contactFailureMessage>[0] = {};
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
                ref?: string;
            };
            // Success is shown only when the server says the mail service accepted the message.
            if (response.ok && data.ok === true) {
                setStatus("success");
                return;
            }
            failure = {
                status: response.status,
                code: data.code,
                retryAfter: data.retryAfter,
                ref: data.ref,
            };
            if (data.errors) {
                setFieldErrors(data.errors);
                focusFirstError(data.errors);
            }
        } catch {
            failure = {};
        }
        // Everything typed stays in the form. The security check is single-use, so ask for a new one.
        setMessage(
            contactFailureMessage(failure, {
                email: fallbackEmail,
                phone: fallbackPhone,
            }),
        );
        setToken("");
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
            noValidate
        >
            {visibleFields.map((field) => {
                const error = fieldErrors[field.name];
                const guidance = field.guidance?.find((item) => item.value === subject)?.text;
                const guidanceId = guidance ? `${field.name}-guidance` : undefined;
                const describedBy =
                    [guidanceId, error ? `${field.name}-error` : undefined].filter(Boolean).join(" ") || undefined;
                const common = {
                    id: field.name,
                    name: field.name,
                    "aria-required": field.required || field.type === "email" ? true : undefined,
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": describedBy,
                    onChange: (
                        event: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                        >,
                    ) => {
                        clearError(field.name);
                        if (field.name === "subject") setSubject(event.target.value);
                    },
                };
                const className = `${inputBase} ${error ? inputBad : inputOk}`;
                const isRequired = field.required === true || field.type === "email";
                return (
                    <div key={field.name}>
                        <label
                            htmlFor={field.name}
                            className="text-small font-semibold text-charcoal"
                        >
                            {field.label}
                            {isRequired && (
                                <span
                                    className="font-bold text-red-600"
                                    aria-hidden="true"
                                >
                                    {" "}
                                    {requiredMarker}
                                </span>
                            )}
                        </label>
                        {guidance && (
                            <p id={guidanceId} className="mt-1 text-small text-charcoal/75">
                                {guidance}
                            </p>
                        )}
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
                                className={className}
                            />
                        ) : field.type === "select" ? (
                            <select
                                {...common}
                                className={className}
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
                                className={className}
                            />
                        )}
                        {error && (
                            <p
                                id={describedBy}
                                className="text-small mt-1 font-medium text-red-700"
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
                    className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-small text-red-800"
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
