import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { organisationJsonLd } from "@/lib/seo/structured-data";
import { PageShell } from "@/components/layout/PageShell";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ClassStyles } from "@/components/home/ClassStyles";
import { EventsGrid } from "@/components/home/EventsGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeTimetable } from "@/components/home/HomeTimetable";
import { DiscoverBand } from "@/components/home/DiscoverBand";
import { QuickActions } from "@/components/home/QuickActions";

export const metadata: Metadata = pageMetadata({
  title: { absolute: `${SITE_NAME} | Dance Classes in London` },
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

/* Event order and Past Event labels depend on the date, so these pages refresh every 15 minutes. All three use the same value so they never disagree for long. */
export const revalidate = 900;

export default function Home() {
  return (
    <PageShell>
      <JsonLd data={organisationJsonLd()} />
      <HeroSlider />
      <QuickActions />
      <HomeTimetable />
      <EventsGrid />
      <ClassStyles />
      <AboutTeaser />
      <DiscoverBand />
    </PageShell>
  );
}
