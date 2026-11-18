import Link from "next/link";
import { siteContent } from "@/content/site";
import { BrandMark } from "@/components/layout/BrandMark";
import { SocialIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";
import { NewsletterSignupForm } from "@/components/ui/NewsletterSignupForm";
import { NEWSLETTER_ONLINE_SIGNUP_LIVE } from "@/lib/features";
import { isLegalPagePublished } from "@/lib/legal-pages";

export function Footer() {
  const { footer } = siteContent.global;
  const year = new Date().getFullYear();
  const copyright = footer.copyright.replace("{year}", String(year));
  // Only approved, published policy pages are shown; with none published the whole block is hidden.
  const legalLinks = footer.legal.filter((item) => isLegalPagePublished(item.href));

  return (
    <footer className="bg-burgundy text-ivory">
      {/* Same side gutters and no maximum width, like the Header (see Container wide). */}
      <Container wide className="py-12 md:py-14">
        {/* Two columns on desktop: the brand, and the contact details (Visit Us above Stay in touch). One column on phones. */}
        <div className="grid items-start gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-16">
          <div>
            <div className="mb-6">
              <BrandMark variant="footer" />
            </div>
            <p className="text-body text-ivory/85 max-w-sm">{footer.intro}</p>
            <div className="mt-6 flex gap-4">
              {footer.social.map((item) => (
                <a
                  key={item.platform}
                  href={item.href}
                  aria-label={item.label}
                  className="rounded-full border border-ivory/20 p-2.5 text-ivory/80 transition-colors hover:border-rose hover:text-rose"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon platform={item.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-h4 text-ivory mb-4 !leading-none">{footer.contact.title}</h3>
              <address className="not-italic text-body text-ivory/85">
                <p className="whitespace-pre-line">{footer.contact.address.join("\n")}</p>
              </address>
            </div>

            <div>
              <h3 className="text-h4 text-ivory mb-4 !leading-none">{footer.stayInTouch.title}</h3>
              <ul className="text-body text-ivory/85 space-y-1">
                <li>
                  <a
                    href={`tel:${footer.contact.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-rose"
                  >
                    {footer.contact.phone}
                  </a>
                </li>
                <li>{footer.contact.wechat}</li>
                <li>
                  <a
                    href={`mailto:${footer.contact.email}`}
                    className="break-words transition-colors hover:text-rose"
                  >
                    {footer.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shown only when online sign-up is switched on in lib/features.ts. */}
        {NEWSLETTER_ONLINE_SIGNUP_LIVE && (
          <div data-tone="dark" className="group/tone mt-10 border-t border-ivory/15 pt-8 lg:max-w-xl">
            <h3 className="text-h4 text-ivory mb-3">{footer.newsletter.title}</h3>
            <p className="text-small text-ivory/75 mb-4">{footer.newsletter.description}</p>
            <NewsletterSignupForm
              inputId="footer-email"
              placeholder={footer.newsletter.placeholder}
              submitLabel={footer.newsletter.submitLabel}
              inputClassName="flex-1 rounded-sm border border-ivory/20 bg-ivory/10 px-4 py-2.5 text-body text-ivory placeholder:text-ivory/50 outline-none focus:border-rose"
              buttonClassName="rounded-sm bg-rose px-5 py-2.5 text-small font-semibold text-charcoal transition-colors hover:bg-rose/90"
            />
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-ivory/15 pt-8 text-center">
          {legalLinks.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Legal notices">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-small text-ivory/70 underline hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-small text-ivory/60">{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
