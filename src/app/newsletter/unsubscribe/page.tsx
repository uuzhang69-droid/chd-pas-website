import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { TokenActionForm } from "@/components/newsletter/TokenActionForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
    title: "Unsubscribe",
    robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
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
                        <h1 className="text-h1 text-charcoal">Unsubscribe</h1>
                        <p className="text-body mt-4 text-charcoal/75">
                            Press the button to stop receiving news from County
                            Hall Dance Centre by email. We will keep a record of
                            your address only so that we do not email you again.
                        </p>
                        <div className="mt-8">
                            <TokenActionForm
                                action="unsubscribe"
                                token={token}
                            />
                        </div>
                    </div>
                </Container>
            </section>
        </PageShell>
    );
}
