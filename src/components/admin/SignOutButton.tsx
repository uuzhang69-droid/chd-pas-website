"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();
    return (
        <button
            type="button"
            className="text-small text-rose underline"
            onClick={async () => {
                // The cookies are cleared whatever happens. If Supabase could not confirm that it ended the
                // session, say so on the sign-in page instead of pretending it did.
                const answer = await fetch("/api/admin/auth/logout", {
                    method: "POST",
                })
                    .then((response) => response.json())
                    .catch(() => undefined);
                const confirmed = answer?.revoked === true || answer?.reason === "no_session";
                router.push(
                    confirmed ? "/admin/login" : "/admin/login?notice=not_confirmed",
                );
                router.refresh();
            }}
        >
            Sign out
        </button>
    );
}
