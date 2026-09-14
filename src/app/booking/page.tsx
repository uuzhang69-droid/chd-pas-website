import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { ContactForm } from "@/components/ui/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { booking, contact } = siteContent.pages;
const { booking: bookingUi } = siteContent.ui;

export const metadata: Metadata = {
  title: booking.meta.title,
  description: booking.meta.description,
};

export default function BookingPage() {
  return (
    <PageShell>
      <PageHero {...booking.hero} compact />

      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-h2 text-charcoal">{booking.form.title}</h2>
            <p className="text-body mt-3 text-charcoal/75">{booking.form.description}</p>
            <div className="mt-8">
              <ContactForm
                fields={booking.form.fields}
                submitLabel={booking.form.submitLabel}
                successMessage={booking.form.successMessage}
                selectPlaceholder={booking.form.selectPlaceholder}
                action={booking.form.action}
              />
            </div>

            <div className="mt-12 border-t border-taupe/30 pt-8">
              <p className="text-body text-charcoal/75">
                {bookingUi.preferDirectPrefix}{" "}
                <a
                  href={`mailto:${contact.details.email}`}
                  className="font-medium text-rose hover:text-rose/80"
                >
                  {contact.details.email}
                </a>{" "}
                {bookingUi.orCall}{" "}
                <a
                  href={`tel:${contact.details.phone.replace(/\s/g, "")}`}
                  className="font-medium text-rose hover:text-rose/80"
                >
                  {contact.details.phone}
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
