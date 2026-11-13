import { PageShell } from "@/components/layout/PageShell";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ClassStyles } from "@/components/home/ClassStyles";
import { EventsGrid } from "@/components/home/EventsGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeTimetable } from "@/components/home/HomeTimetable";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { QuickActions } from "@/components/home/QuickActions";

/* Event order and Past Event labels depend on the date, so these pages refresh every 15 minutes. All three use the same value so they never disagree for long. */
export const revalidate = 900;

export default function Home() {
  return (
    <PageShell>
      <HeroSlider />
      <QuickActions />
      <HomeTimetable />
      <EventsGrid />
      <ClassStyles />
      <AboutTeaser />
      <NewsletterBand />
    </PageShell>
  );
}
