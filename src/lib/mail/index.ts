/**
 * Replaceable outgoing-mail interface. Resend is the first provider; another provider only needs a
 * new `MailSender` and one more case in `getMailConfig`.
 */
export type MailMessage = {
    to: string;
    from: string;
    replyTo?: string;
    subject: string;
    text: string;
    html?: string;
};

export type MailResult =
    | { ok: true; id?: string }
    /** The provider answered and refused the message (bad key, unverified sender, invalid recipient). */
    | { ok: false; reason: "rejected"; status: number; detail?: string }
    /** Network error, timeout, rate limit or provider outage. */
    | { ok: false; reason: "unavailable"; status?: number };

export interface MailSender {
    send(message: MailMessage): Promise<MailResult>;
}

type Fetch = typeof fetch;

export function createResendSender(
    apiKey: string,
    fetchImpl: Fetch = fetch,
): MailSender {
    return {
        async send(message) {
            try {
                const response = await fetchImpl(
                    "https://api.resend.com/emails",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            from: message.from,
                            to: [message.to],
                            subject: message.subject,
                            text: message.text,
                            ...(message.html ? { html: message.html } : {}),
                            ...(message.replyTo
                                ? { reply_to: message.replyTo }
                                : {}),
                        }),
                        signal: AbortSignal.timeout(10_000),
                    },
                );
                if (response.ok) {
                    const data = (await response.json().catch(() => ({}))) as {
                        id?: string;
                    };
                    return { ok: true, id: data.id };
                }
                // 429 and 5xx are temporary; other 4xx mean the request itself was refused.
                if (response.status === 429 || response.status >= 500)
                    return {
                        ok: false,
                        reason: "unavailable",
                        status: response.status,
                    };
                // The provider's own explanation (for example "verify a domain") goes to the server log only.
                const detail = await response
                    .json()
                    .then((data: { message?: unknown }) =>
                        typeof data?.message === "string"
                            ? data.message.slice(0, 200)
                            : undefined,
                    )
                    .catch(() => undefined);
                return {
                    ok: false,
                    reason: "rejected",
                    status: response.status,
                    ...(detail ? { detail } : {}),
                };
            } catch {
                return { ok: false, reason: "unavailable" };
            }
        },
    };
}

export type MailConfig = { sender: MailSender; from: string };

/** Undefined when the mail service is not configured. Nothing is assumed about the sender address. */
export function getMailConfig(): MailConfig | undefined {
    const provider = (process.env.MAIL_PROVIDER || "resend").toLowerCase();
    const apiKey = process.env.MAIL_API_KEY;
    const from = process.env.MAIL_FROM;
    if (!apiKey || !from) return undefined;
    if (provider === "resend")
        return { sender: createResendSender(apiKey), from };
    return undefined;
}
