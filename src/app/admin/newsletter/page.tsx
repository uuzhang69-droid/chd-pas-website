import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Container } from "@/components/ui/Container";
import { checkAdmin } from "@/lib/admin/session";
import { NEWSLETTER_SOURCES } from "@/lib/newsletter/consent";
import { getNewsletterStore } from "@/lib/newsletter/deps";
import { verificationOf, type Verification } from "@/lib/newsletter/csv";
import type { SubscriberStatus } from "@/lib/newsletter/store";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const STATUSES: SubscriberStatus[] = ["pending", "active", "unsubscribed"];

/** What each status means for sending news. Plain words, never a bare "pending". */
const STATUS_LABEL: Record<SubscriberStatus, string> = {
    pending: "Unverified (pending)",
    active: "Verified (active)",
    unsubscribed: "Unsubscribed",
};

const BADGE: Record<Verification, string> = {
    verified: "border-green-700/40 bg-green-50 text-green-900",
    unverified: "border-amber-600/50 bg-amber-50 text-amber-900",
    unsubscribed: "border-taupe/60 bg-ivory text-charcoal/70",
};

const BADGE_TEXT: Record<Verification, string> = {
    verified: "Verified: confirmed their address",
    unverified: "Unverified: typed into the form, not checked",
    unsubscribed: "Unsubscribed: do not mail",
};

type Search = { q?: string; status?: string; source?: string; page?: string };

function when(value?: string): string {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default async function AdminNewsletterPage({
    searchParams,
}: {
    searchParams: Promise<Search>;
}) {
    // Every request is checked here on the server, whatever the proxy or navigation did.
    const admin = await checkAdmin((await headers()).get("cookie"));
    if (!admin.ok) {
        if (admin.reason === "needs_refresh")
            redirect("/api/admin/auth/refresh");
        if (admin.reason === "signed_out") redirect("/admin/login");
        if (admin.reason === "unavailable")
            return (
                <Container className="py-16">
                    <h1 className="text-h2">Administration</h1>
                    <p className="text-body mt-4">
                        The sign-in service is not responding right now. You
                        have not been signed out. Please try again in a minute.
                    </p>
                </Container>
            );
        return (
            <Container className="py-16">
                <h1 className="text-h2">Administration</h1>
                <p className="text-body mt-4">
                    Administrator sign-in is not set up yet.
                </p>
            </Container>
        );
    }

    const store = getNewsletterStore();
    if (!store)
        return (
            <Container className="py-16">
                <h1 className="text-h2">Newsletter subscribers</h1>
                <p className="text-body mt-4">
                    The newsletter database is not connected, so there is
                    nothing to show.
                </p>
            </Container>
        );

    const params = await searchParams;
    const q = (params.q ?? "").slice(0, 100);
    const status = STATUSES.find((value) => value === params.status);
    const source = (NEWSLETTER_SOURCES as readonly string[]).includes(
        params.source ?? "",
    )
        ? params.source
        : undefined;
    const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

    let result: Awaited<ReturnType<typeof store.list>> | undefined;
    try {
        result = await store.list({
            q,
            status,
            source,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
        });
    } catch {
        result = undefined;
    }

    const query = (extra: Record<string, string | undefined>) => {
        const next = new URLSearchParams();
        const merged = { q, status, source, ...extra };
        for (const [key, value] of Object.entries(merged))
            if (value) next.set(key, value);
        return next.toString();
    };
    const pages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;
    // A page number past the end (for example after deleting the last row of a page) goes to the last page.
    if (result && page > pages)
        redirect(`/admin/newsletter?${query({ page: pages > 1 ? String(pages) : undefined })}`);
    const field =
        "rounded-sm border border-taupe/50 bg-ivory px-3 py-2 text-small";

    return (
        <Container className="py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-h2">Newsletter subscribers</h1>
                <p className="text-small text-charcoal/70">
                    Signed in as {admin.email} · <SignOutButton />
                </p>
            </div>

            <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
                <label className="text-small">
                    <span className="block font-semibold">Search email</span>
                    <input
                        name="q"
                        defaultValue={q}
                        maxLength={100}
                        className={field}
                    />
                </label>
                <label className="text-small">
                    <span className="block font-semibold">Status</span>
                    <select
                        name="status"
                        defaultValue={status ?? ""}
                        className={field}
                    >
                        <option value="">All</option>
                        {STATUSES.map((value) => (
                            <option key={value} value={value}>
                                {STATUS_LABEL[value]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-small">
                    <span className="block font-semibold">Source</span>
                    <select
                        name="source"
                        defaultValue={source ?? ""}
                        className={field}
                    >
                        <option value="">All</option>
                        {NEWSLETTER_SOURCES.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="submit"
                    className="rounded-sm bg-burgundy px-4 py-2 text-small font-semibold text-ivory"
                >
                    Filter
                </button>
                <a
                    href={`/api/admin/newsletter/export?${query({ status: undefined })}`}
                    className="rounded-sm border border-burgundy bg-burgundy px-4 py-2 text-small font-semibold text-ivory"
                >
                    Export verified recipients (CSV)
                </a>
                <a
                    href={`/api/admin/newsletter/export?${query({ audience: "all" })}`}
                    className="rounded-sm border border-amber-700 px-4 py-2 text-small font-semibold text-amber-900"
                >
                    Export all requests, including unverified (CSV)
                </a>
            </form>
            <div role="note" className="mt-4 max-w-3xl rounded-sm border border-amber-600/40 bg-amber-50 px-4 py-3 text-small text-amber-950">
                <strong>Unverified</strong> addresses were typed into the sign-up form and have not been checked, so nobody has
                proved they own them. Do not send marketing to them. Only <strong>verified</strong> addresses may be mailed. The first
                export contains verified recipients only; the second lists every request and marks each row, so it must not be used as a
                mailing list.
            </div>

            {!result ? (
                <p role="alert" className="mt-8 text-body text-burgundy">
                    The subscriber list could not be loaded. Please try again.
                </p>
            ) : (
                <>
                    <p className="text-small mt-6 text-charcoal/70">
                        {result.total} {result.total === 1 ? "subscriber matches" : "subscribers match"}.
                    </p>
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-small">
                            <thead>
                                <tr className="border-b border-taupe/40 text-charcoal/70">
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2 pr-4">Source</th>
                                    <th className="py-2 pr-4">Signed up</th>
                                    <th className="py-2 pr-4">Verified at</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-taupe/20 align-top"
                                    >
                                        <td className="py-2 pr-4 break-all">
                                            {row.email}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <span
                                                title={BADGE_TEXT[verificationOf(row)]}
                                                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE[verificationOf(row)]}`}
                                            >
                                                {STATUS_LABEL[row.status]}
                                            </span>
                                            <span className="mt-1 block text-xs text-charcoal/60">
                                                {BADGE_TEXT[verificationOf(row)]}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4">
                                            {row.source}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {when(row.createdAt)}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {when(row.confirmedAt)}
                                        </td>
                                        <td className="py-2">
                                            <AdminRowActions
                                                id={row.id}
                                                email={row.email}
                                                status={row.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {result.rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-6 text-charcoal/60"
                                        >
                                            No subscribers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <nav
                        className="mt-6 flex items-center gap-4 text-small"
                        aria-label="Pagination"
                    >
                        {page > 1 && (
                            <Link
                                href={`/admin/newsletter?${query({ page: String(page - 1) })}`}
                                className="text-rose underline"
                            >
                                Previous
                            </Link>
                        )}
                        <span>
                            Page {page} of {pages}
                        </span>
                        {page < pages && (
                            <Link
                                href={`/admin/newsletter?${query({ page: String(page + 1) })}`}
                                className="text-rose underline"
                            >
                                Next
                            </Link>
                        )}
                    </nav>
                </>
            )}
        </Container>
    );
}
