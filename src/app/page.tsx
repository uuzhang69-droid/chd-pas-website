import { PageShell } from "@/components/layout/PageShell";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ClassStyles } from "@/components/home/ClassStyles";
import { EventsGrid } from "@/components/home/EventsGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { PrivateEventsPromo } from "@/components/home/PrivateEventsPromo";
import { QuickActions } from "@/components/home/QuickActions";

export default function Home() {
  return (
    <PageShell>
      <HeroSlider />
      <QuickActions />
      <EventsGrid />
      <ClassStyles />
      <AboutTeaser />
      <PrivateEventsPromo />
      <NewsletterBand />
    </PageShell>
  );
}
