"use client";

import Link from "next/link";
import { useState } from "react";

type Action = "confirm" | "unsubscribe";
type State =
    | { name: "idle" }
    | { name: "working" }
    | { name: "done"; unsubscribeUrl?: string }
    | { name: "error"; message: string };

const COPY: Record<Action, { button: string; done: string }> = {
    confirm: {
        button: "Confirm my subscription",
        done: "Thank you. Your subscription is confirmed.",
    },
    unsubscribe: {
        button: "Unsubscribe",
        done: "You have been unsubscribed. We will not send you news by email any more.",
    },
};

function describe(code: string | undefined, action: Action): string {
    switch (code) {
        case "expired":
            return "This link has expired. Please sign up again using the form at the bottom of our website.";
        case "invalid":
            return action === "confirm"
                ? "This link is not valid any more. Please sign up again using the form at the bottom of our website."
                : "This link is not valid. If you would like to stop receiving our emails, please contact us and we will remove you.";
        case "rate_limited":
            return "Too many attempts. Please try again in a few minutes.";
        default:
            return "Sorry, we could not complete this just now. Nothing has been changed. Please try again later.";
    }
}

/**
 * Opening the emailed link only shows this page. The change happens when the button is pressed,
 * so an email scanner that opens links cannot confirm or unsubscribe anyone by accident.
 */
export function TokenActionForm({
    action,
    token,
}: {
    action: Action;
    token?: string;
}) {
    const [state, setState] = useState<State>({ name: "idle" });

    if (!token)
        return (
            <p className="text-body text-charcoal/80">
                This link is incomplete. Please use the link in your email.
            </p>
        );

    async function run() {
        setState({ name: "working" });
        try {
            const response = await fetch(`/api/newsletter/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = (await response.json().catch(() => ({}))) as {
                ok?: boolean;
                code?: string;
                unsubscribeUrl?: string;
            };
            if (response.ok && data.ok === true) {
                setState({ name: "done", unsubscribeUrl: data.unsubscribeUrl });
                return;
            }
            setState({ name: "error", message: describe(data.code, action) });
        } catch {
            setState({ name: "error", message: describe(undefined, action) });
        }
    }

    if (state.name === "done") {
        return (
            <div role="status" className="space-y-4">
                <p className="text-body-lg text-charcoal">
                    {COPY[action].done}
                </p>
                {action === "confirm" && state.unsubscribeUrl && (
                    <p className="text-body text-charcoal/75">
                        You can unsubscribe at any time with{" "}
                        <Link
                            href={state.unsubscribeUrl}
                            className="text-burgundy underline"
                        >
                            this link
                        </Link>
                        , which is also in our emails.
                    </p>
                )}
                <p>
                    <Link
                        href="/"
                        className="text-small font-semibold text-rose hover:text-rose/80"
                    >
                        Back to the website
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {state.name === "error" && (
                <p
                    role="alert"
                    className="rounded-sm border border-burgundy/40 bg-ivory px-4 py-3 text-small text-burgundy"
                >
                    {state.message}
                </p>
            )}
            <button
                type="button"
                onClick={run}
                disabled={state.name === "working"}
                className="rounded-sm bg-burgundy px-6 py-3 text-small font-semibold text-ivory transition-colors hover:bg-burgundy/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {state.name === "working"
                    ? "Please wait…"
                    : COPY[action].button}
            </button>
        </div>
    );
}
