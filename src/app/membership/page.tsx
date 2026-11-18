import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { MembershipSection } from "@/components/membership/MembershipSection";

const page = siteContent.pages.membership.overview;

export const metadata: Metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: "/membership",
});

export default function MembershipPage() {
  return (
    <PageShell>
      <main className="membership-page">
        <Container wide>
          <h1 className="sr-only">{page.hero.title}</h1>
          <MembershipSection />
        </Container>
      </main>
    </PageShell>
  );
}
