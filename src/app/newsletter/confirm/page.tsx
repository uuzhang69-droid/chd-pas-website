import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { TokenActionForm } from "@/components/newsletter/TokenActionForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
    title: "Confirm your subscription",
    robots: { index: false, follow: false },
};

export default async function ConfirmPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;
    return (
        <PageShell>
            <section className="section-y">
                <Container>
                    <div className="mx-auto max-w-xl">
                        <h1 className="text-h1 text-charcoal">
                            Confirm your subscription
                        </h1>
                        <p className="text-body mt-4 text-charcoal/75">
                            Press the button to confirm that you would like to
                            receive occasional news from County Hall Dance
                            Centre by email. Nothing is subscribed until you do.
                        </p>
                        <div className="mt-8">
                            <TokenActionForm action="confirm" token={token} />
                        </div>
                    </div>
                </Container>
            </section>
        </PageShell>
    );
}
