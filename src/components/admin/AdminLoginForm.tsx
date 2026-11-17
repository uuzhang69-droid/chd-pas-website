"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "code";

function describe(code: string | undefined): string {
    switch (code) {
        case "not_configured":
            return "Administrator sign-in is not set up yet, so nobody can sign in.";
        case "rate_limited":
            return "Too many attempts. Please wait a few minutes and try again.";
        case "invalid":
            return "That code is not valid or has expired. Please request a new one.";
        case "validation":
            return "Please enter a valid email address.";
        default:
            return "Sorry, that did not work. Please try again.";
    }
}

/** Email, then the one-time code Supabase sends. No passwords are handled by this site. */
export function AdminLoginForm() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    async function post(path: string, payload: Record<string, string>) {
        const response = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = (await response.json().catch(() => ({}))) as {
            ok?: boolean;
            code?: string;
        };
        return { ok: response.ok && data.ok === true, code: data.code };
    }

    async function requestCode(event: React.FormEvent) {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        try {
            const result = await post("/api/admin/auth/request", { email });
            if (result.ok) setStep("code");
            else setMessage(describe(result.code));
        } catch {
            setMessage(describe(undefined));
        }
        setBusy(false);
    }

    async function verify(event: React.FormEvent) {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        try {
            const result = await post("/api/admin/auth/verify", {
                email,
                code,
            });
            if (result.ok) {
                router.push("/admin/newsletter");
                router.refresh();
                return;
            }
            setMessage(describe(result.code));
        } catch {
            setMessage(describe(undefined));
        }
        setBusy(false);
    }

    const input =
        "mt-2 w-full rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose";
    const button =
        "rounded-sm bg-burgundy px-6 py-3 text-small font-semibold text-ivory transition-colors hover:bg-burgundy/90 disabled:opacity-60";

    return step === "email" ? (
        <form onSubmit={requestCode} className="space-y-4">
            <div>
                <label
                    htmlFor="admin-email"
                    className="text-small font-semibold"
                >
                    Administrator email
                </label>
                <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={input}
                />
            </div>
            {message && (
                <p role="alert" className="text-small text-burgundy">
                    {message}
                </p>
            )}
            <button type="submit" disabled={busy} className={button}>
                {busy ? "Please wait…" : "Email me a sign-in code"}
            </button>
        </form>
    ) : (
        <form onSubmit={verify} className="space-y-4">
            <p className="text-body text-charcoal/75">
                If that address is allowed to sign in, a code has been emailed
                to it. Enter the code below.
            </p>
            <div>
                <label
                    htmlFor="admin-code"
                    className="text-small font-semibold"
                >
                    Sign-in code
                </label>
                <input
                    id="admin-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    className={input}
                />
            </div>
            {message && (
                <p role="alert" className="text-small text-burgundy">
                    {message}
                </p>
            )}
            <button type="submit" disabled={busy} className={button}>
                {busy ? "Please wait…" : "Sign in"}
            </button>
            <button
                type="button"
                onClick={() => {
                    setStep("email");
                    setCode("");
                    setMessage("");
                }}
                className="ml-4 text-small text-rose underline"
            >
                Use a different email
            </button>
        </form>
    );
}
