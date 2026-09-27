import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllVenueHireSubpageSlugs,
  getVenueHireSubpageBySlug,
} from "@/content/helpers";
import { PageShell } from "@/components/layout/PageShell";
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
  return {
    title: page.meta.title,
    description: page.meta.description,
  };
}

export default async function VenueHireSubpage({ params }: PageProps) {
  const { slug } = await params;
  const page = getVenueHireSubpageBySlug(slug);
  if (!page) notFound();

  return (
    <PageShell>
      <SectionedPage {...page} />
    </PageShell>
  );
}
