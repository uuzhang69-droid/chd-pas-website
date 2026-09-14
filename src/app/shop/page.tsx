import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { SectionedPage } from "@/components/ui/SectionedPage";

const page = siteContent.pages.shop;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function ShopPage() {
  return (
    <PageShell>
      <SectionedPage {...page} />
    </PageShell>
  );
}
