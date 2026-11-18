import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/**
 * Parts shared by every Hero, so the label above a title always reads as a label and the way back always reads as navigation.
 * - Eyebrow: a small outlined badge in capital letters. Navigation in this site is plain text with an arrow, so a bordered
 *   badge cannot be mistaken for a link. Over a photograph it is a solid rose badge with charcoal text; on the ivory page it is burgundy
 *   (rose on ivory is too faint to read, about 2:1).
 * - HeroBackLink: ordinary sentence-case text with an arrow, underlined on hover and focus.
 * - HeroBanner: the photographic Hero. The picture stays visible (a tint rather than a blackout), the text sits on the left
 *   on a gradient that is darkest behind the words, and the block has a real height so it reads as a banner.
 */
type Tone = "dark" | "light";

export function Eyebrow({ children, tone = "dark", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
    const look =
        tone === "dark"
            ? "border-rose bg-rose text-charcoal shadow-sm"
            : "border-burgundy/40 bg-burgundy/[0.06] text-burgundy";
    return (
        <p
            className={`inline-flex max-w-full w-fit items-center gap-2.5 rounded-[1.25rem] border px-4 py-2 text-[0.8125rem] font-semibold uppercase leading-snug tracking-[0.18em] sm:text-[0.875rem] ${look} ${className}`}
        >
            <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${tone === "dark" ? "bg-charcoal" : "bg-burgundy"}`} />
            {children}
        </p>
    );
}

export function HeroBackLink({ href, children, tone = "dark" }: { href: string; children: ReactNode; tone?: Tone }) {
    const colour = tone === "dark" ? "text-ivory/80 hover:text-ivory" : "text-charcoal/70 hover:text-charcoal";
    return (
        <Link href={href} className={`text-small flex w-fit items-center gap-2 underline-offset-4 hover:underline focus-visible:underline ${colour}`}>
            <span aria-hidden="true">←</span>
            {/* Some content labels already start with an arrow; show only one. */}
            {typeof children === "string" ? children.replace(/^←\s*/, "") : children}
        </Link>
    );
}

export function HeroBanner({
    image,
    children,
    imageClassName = "",
}: {
    image: { src: string; alt: string };
    children: ReactNode;
    imageClassName?: string;
}) {
    return (
        <section className="relative isolate flex min-h-[clamp(22rem,52vh,34rem)] items-end overflow-hidden bg-charcoal text-ivory">
            <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="100vw"
                className={`-z-20 object-cover opacity-80 ${imageClassName}`.trim()}
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/85 via-charcoal/50 to-charcoal/10" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/70 via-transparent to-charcoal/30" />
            <Container className="section-y relative w-full">{children}</Container>
        </section>
    );
}
