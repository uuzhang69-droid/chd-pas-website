import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { SectionedPage } from "@/components/ui/SectionedPage";

const page = siteContent.pages.classBooking;

export const metadata: Metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: "/class-booking",
});

export default function ClassBookingPage() {
  return (
    <PageShell>
      <SectionedPage {...page} />
    </PageShell>
  );
}
