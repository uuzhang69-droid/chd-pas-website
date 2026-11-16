import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import {
  getAllVenueHireSubpageSlugs,
  getVenueHireSubpageBySlug,
} from "@/content/helpers";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { SectionedPage } from "@/components/ui/SectionedPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllVenueHireSubpageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getVenueHireSubpageBySlug(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/venue-hire/${slug}`,
  });
}

export default async function VenueHireSubpage({ params }: PageProps) {
  const { slug } = await params;
  const page = getVenueHireSubpageBySlug(slug);
  if (!page) notFound();

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          {
            name: siteContent.pages.venueHire.overview.meta.title,
            path: "/venue-hire",
          },
          { name: page.meta.title, path: `/venue-hire/${slug}` },
        ])}
      />
      <SectionedPage {...page} />
    </PageShell>
  );
}
