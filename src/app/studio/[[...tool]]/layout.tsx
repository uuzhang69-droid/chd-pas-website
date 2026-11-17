import type { Metadata } from "next";
import type { ReactNode } from "react";

/** The CMS studio is an internal tool: robots.txt blocks it and this keeps it out of search too. */
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
    return children;
}
