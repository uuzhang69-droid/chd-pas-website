"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminRowActions({
    id,
    email,
    status,
}: {
    id: string;
    email: string;
    status: string;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function run(action: "unsubscribe" | "delete") {
        // Always names the person, so the wrong row is never confirmed by mistake.
        const question =
            action === "delete"
                ? `Delete ${email} permanently? This cannot be undone. Use it for an erasure request.`
                : `Mark ${email} as unsubscribed?`;
        if (!window.confirm(question)) return;
        setBusy(true);
        setError("");
        try {
            const response = await fetch(
                `/api/admin/newsletter/subscribers/${id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action }),
                },
            );
            if (response.ok) router.refresh();
            else if (response.status === 401) {
                // The session has ended: go back to sign in instead of showing a vague failure.
                router.push("/admin/login");
                router.refresh();
            } else if (response.status === 503)
                setError("The service is not responding. Nothing was changed. Please try again.");
            else if (response.status === 404)
                setError("That subscriber no longer exists.");
            else setError("That did not work. Nothing was changed.");
        } catch {
            setError("Could not reach the website. Nothing was changed.");
        }
        setBusy(false);
    }

    return (
        <span className="flex flex-wrap items-center gap-3">
            {status !== "unsubscribed" && (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => run("unsubscribe")}
                    className="text-small text-rose underline disabled:opacity-50"
                >
                    Mark unsubscribed
                </button>
            )}
            <button
                type="button"
                disabled={busy}
                onClick={() => run("delete")}
                className="text-small text-burgundy underline disabled:opacity-50"
            >
                Delete
            </button>
            {error && (
                <span role="alert" className="text-small text-burgundy">
                    {error}
                </span>
            )}
        </span>
    );
}
