import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { BookingEmbedPlaceholder } from "@/components/ui/BookingEmbed";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { timetable } = siteContent.pages;

export const metadata: Metadata = {
  title: timetable.meta.title,
  description: timetable.meta.description,
};

export default function TimetablePage() {
  return (
    <PageShell>
      <PageHero {...timetable.hero} />
      <section className="py-12 md:py-16">
        <Container>
          <div className="max-w-3xl rounded-sm border border-rose/25 bg-ivory p-8 md:p-10">
            <p className="text-overline text-rose">{timetable.trial.overline}</p>
            <h2 className="text-h2 mt-2 text-charcoal">{timetable.trial.title}</h2>
            <p className="text-body-lg mt-4 text-charcoal/75">{timetable.trial.body}</p>
            <div className="mt-6">
              <Button {...timetable.trial.cta} />
            </div>
          </div>
        </Container>
      </section>
      <BookingEmbedPlaceholder {...timetable.booking} />
      <section className="border-t border-taupe/30 py-10">
        <Container>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {timetable.helpLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-body text-rose hover:text-rose/80">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </PageShell>
  );
}
