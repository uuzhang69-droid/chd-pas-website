import Link from "next/link";
import { siteContent } from "@/content/site";
import { Container } from "@/components/ui/Container";

export function QuickActions() {
  const { quickActions } = siteContent.home;

  return (
    <section className="border-b border-taupe/30 bg-ivory py-10 md:py-12" aria-labelledby="quick-actions-heading">
      <Container>
        <p id="quick-actions-heading" className="text-overline text-rose mb-6 text-center">
          {quickActions.overline}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.items.map((item) => {
            const className =
              "group rounded-sm border border-rose/30 bg-ivory p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:shadow-md";
            const content = (
              <>
                <h2 className="text-h3 text-charcoal">{item.label}</h2>
                <p className="text-body mt-3 text-charcoal/75">{item.description}</p>
                <span className="mt-5 inline-block text-small font-semibold uppercase tracking-wider text-rose transition-colors group-hover:text-rose/80">
                  {quickActions.linkSuffix}
                </span>
              </>
            );

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
