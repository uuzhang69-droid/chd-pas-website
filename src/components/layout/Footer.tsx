import { siteContent } from "@/content/site";
import { BrandMark } from "@/components/layout/BrandMark";
import { SocialIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";
import { NewsletterSignupForm } from "@/components/ui/NewsletterSignupForm";

export function Footer() {
  const { footer } = siteContent.global;
  const year = new Date().getFullYear();
  const copyright = footer.copyright.replace("{year}", String(year));

  return (
    <footer className="bg-burgundy text-ivory">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
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

          <div className="lg:col-span-7">
            <h3 className="text-h4 text-ivory mb-4">{footer.contact.title}</h3>
            <address className="not-italic text-body text-ivory/85 space-y-1">
              {footer.contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a
                href={`tel:${footer.contact.phone.replace(/\s/g, "")}`}
                className="mt-3 block transition-colors hover:text-rose"
              >
                {footer.contact.phone}
              </a>
              <span className="block">{footer.contact.wechat}</span>
              <a
                href={`mailto:${footer.contact.email}`}
                className="block transition-colors hover:text-rose"
              >
                {footer.contact.email}
              </a>
            </address>

            <div className="mt-8">
              <h4 className="text-overline text-rose mb-3">{footer.newsletter.title}</h4>
              <p className="text-small text-ivory/75 mb-4">{footer.newsletter.description}</p>
              <NewsletterSignupForm
                inputId="footer-email"
                placeholder={footer.newsletter.placeholder}
                submitLabel={footer.newsletter.submitLabel}
                inputClassName="flex-1 rounded-sm border border-ivory/20 bg-ivory/10 px-4 py-2.5 text-body text-ivory placeholder:text-ivory/50 outline-none focus:border-rose"
                buttonClassName="rounded-sm bg-rose px-5 py-2.5 text-small font-semibold text-charcoal transition-colors hover:bg-rose/90"
              />
              <p className="text-small text-ivory/60 mt-2">{footer.newsletter.privacyNote}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/15 pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal notices">
            {footer.legal.map((item) => (
              <li key={item.label}>
                <span className="text-small text-ivory/70">{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="text-small text-ivory/60">{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
