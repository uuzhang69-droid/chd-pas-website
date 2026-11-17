import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Container } from "@/components/ui/Container";

/** Fixed wording for each notice code: nothing from the address is ever shown back. */
const NOTICES: Record<string, string> = {
    unavailable:
        "The sign-in service is not responding right now. You have not been signed out. Please try again in a minute.",
    not_confirmed:
        "You have been signed out on this device, but we could not confirm that the session was closed on the server. If this computer is shared, sign in and out again, or ask the site owner to revoke the session.",
};

export default async function AdminLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string }>;
}) {
    const { notice } = await searchParams;
    // Only the fixed codes above are accepted (own properties only), so nothing from the address is ever shown.
    const message =
        notice && Object.hasOwn(NOTICES, notice) ? NOTICES[notice] : undefined;
    return (
        <Container className="py-16">
            <div className="mx-auto max-w-md">
                <h1 className="text-h2">Administration sign-in</h1>
                <p className="text-body mt-3 text-charcoal/70">
                    For authorised administrators only.
                </p>
                {message && (
                    <p
                        role="status"
                        className="text-small mt-4 rounded-sm border border-taupe/50 px-4 py-3"
                    >
                        {message}
                    </p>
                )}
                <div className="mt-8">
                    <AdminLoginForm />
                </div>
            </div>
        </Container>
    );
}
