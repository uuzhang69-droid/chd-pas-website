import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Administration pages are never indexed, and robots.txt also blocks them. */
export const metadata: Metadata = {
    title: "Administration",
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-ivory text-charcoal">{children}</main>
    );
}
