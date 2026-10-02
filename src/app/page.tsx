import { PageShell } from "@/components/layout/PageShell";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ClassStyles } from "@/components/home/ClassStyles";
import { EventsGrid } from "@/components/home/EventsGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeTimetable } from "@/components/home/HomeTimetable";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { PrivateEventsPromo } from "@/components/home/PrivateEventsPromo";
import { QuickActions } from "@/components/home/QuickActions";
import { formatIsoDate, parseWeekParam, startOfWeekMonday } from "@/lib/timetable/week";

export const revalidate = 300;

type HomePageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { week } = await searchParams;
  const weekStart = parseWeekParam(week) ?? startOfWeekMonday(new Date());
  const weekStartIso = formatIsoDate(weekStart);

  return (
    <PageShell>
      <HeroSlider />
      <QuickActions />
      <HomeTimetable weekStartIso={weekStartIso} />
      <EventsGrid />
      <ClassStyles />
      <AboutTeaser />
      <PrivateEventsPromo />
      <NewsletterBand />
    </PageShell>
  );
}
