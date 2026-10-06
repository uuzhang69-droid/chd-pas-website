import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { MembershipSection } from "@/components/membership/MembershipSection";

const page = siteContent.pages.membership.overview;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function MembershipPage() {
  return (
    <PageShell>
      <main className="membership-page">
        <MembershipSection />
      </main>
    </PageShell>
  );
}
