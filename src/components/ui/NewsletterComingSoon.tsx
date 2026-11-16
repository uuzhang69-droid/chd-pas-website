type NewsletterComingSoonProps = {
    /** "dark" for the burgundy footer, "light" for the pale home band. */
    tone?: "dark" | "light";
    align?: "left" | "center";
};

/**
 * Shown while online newsletter sign-up is not live. It has no form and no button, so nobody can
 * think they have subscribed, and nothing is collected.
 */
export function NewsletterComingSoon({
    tone = "light",
    align = "left",
}: NewsletterComingSoonProps) {
    return (
        <p
            className={`text-small font-semibold ${tone === "dark" ? "text-ivory/85" : "text-charcoal/75"} ${align === "center" ? "text-center" : ""}`}
        >
            Online sign-up is coming soon.
        </p>
    );
}
