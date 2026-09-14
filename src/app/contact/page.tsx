import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { ContactForm } from "@/components/ui/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { contact } = siteContent.pages;

export const metadata: Metadata = {
  title: contact.meta.title,
  description: contact.meta.description,
};

export default function ContactPage() {
  return (
    <PageShell>
      <PageHero {...contact.hero} compact />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-h2 text-charcoal">{contact.form.title}</h2>
              <p className="text-body mt-3 text-charcoal/75">{contact.form.description}</p>
              <div className="mt-8">
                <ContactForm
                  fields={contact.form.fields}
                  submitLabel={contact.form.submitLabel}
                  successMessage={contact.form.successMessage}
                  selectPlaceholder={contact.form.selectPlaceholder}
                  action={contact.form.action}
                />
              </div>
            </div>

            <div>
              <h2 className="text-h2 text-charcoal">{contact.details.title}</h2>
              <address className="mt-4 not-italic text-body text-charcoal/80 space-y-1">
                {contact.details.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="text-body mt-4">
                <a href={`tel:${contact.details.phone.replace(/\s/g, "")}`} className="text-rose hover:text-rose/80">
                  {contact.details.phone}
                </a>
              </p>
              <p className="text-body">
                <a href={`mailto:${contact.details.email}`} className="text-rose hover:text-rose/80">
                  {contact.details.email}
                </a>
              </p>
              <p className="text-small mt-4 text-charcoal/60">{contact.details.hours}</p>

              <div className="mt-10">
                <h3 className="text-h4 text-charcoal">{contact.map.title}</h3>
                <div className="mt-4 aspect-[4/3] overflow-hidden rounded-sm border border-taupe/30">
                  <iframe
                    title={contact.map.title}
                    src={contact.map.embedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a
                  href={contact.map.directionsHref}
                  className="mt-4 inline-block text-small font-semibold text-rose hover:text-rose/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.map.directionsLabel}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
