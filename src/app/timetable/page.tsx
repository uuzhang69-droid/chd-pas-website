import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { fetchTimetableSessions } from "@/lib/timetable/fetch-sessions";
import { formatIsoDate, parseWeekParam, startOfWeekMonday } from "@/lib/timetable/week";

const { timetable } = siteContent.pages;

export const metadata: Metadata = {
  title: timetable.meta.title,
  description: timetable.meta.description,
};

export const revalidate = 300;

type TimetablePageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function TimetablePage({ searchParams }: TimetablePageProps) {
  const { week } = await searchParams;
  const weekStart = parseWeekParam(week) ?? startOfWeekMonday(new Date());
  const weekStartIso = formatIsoDate(weekStart);
  const sessions = await fetchTimetableSessions();

  return (
    <PageShell>
      <PageHero {...timetable.hero} />
      <TimetableGrid
        sessions={sessions}
        weekStartIso={weekStartIso}
        ui={{
          title: timetable.booking.title,
          description: timetable.booking.description,
          prevWeek: timetable.grid.prevWeek,
          thisWeek: timetable.grid.thisWeek,
          nextWeek: timetable.grid.nextWeek,
          goToDate: timetable.grid.goToDate,
          legend: timetable.grid.legend,
          venueNote: timetable.grid.venueNote,
        }}
      />
      <section id={timetable.trial.id} className="scroll-mt-24 py-12 md:py-16">
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
      <section className="py-8">
        <Container>
          <p className="text-body text-charcoal/75">{timetable.newcomerNote}</p>
        </Container>
      </section>
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
