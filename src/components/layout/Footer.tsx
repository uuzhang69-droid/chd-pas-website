import Link from "next/link";
import { siteContent } from "@/content/site";
import { BrandMark } from "@/components/layout/BrandMark";
import { SocialIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const { footer, utilityBar } = siteContent.global;
  const year = new Date().getFullYear();
  const copyright = footer.copyright.replace("{year}", String(year));

  return (
    <footer className="bg-burgundy text-ivory">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="mb-6">
              <BrandMark variant="footer" />
            </div>
            <p className="text-body text-ivory/85 max-w-sm">{footer.intro}</p>
            <div className="mt-6 flex gap-4">
              {utilityBar.social.map((item) => (
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

          <div className="lg:col-span-2">
            <h3 className="text-h4 text-ivory mb-4">{footer.columns.explore.title}</h3>
            <ul className="space-y-2">
              {footer.columns.explore.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body text-ivory/80 transition-colors hover:text-rose"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-h4 text-ivory mb-4">{footer.columns.school.title}</h3>
            <ul className="space-y-2">
              {footer.columns.school.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body text-ivory/80 transition-colors hover:text-rose"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
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
              <form className="flex flex-col gap-2 sm:flex-row" action="#" method="post">
                <label htmlFor="footer-email" className="sr-only">
                  {footer.newsletter.placeholder}
                </label>
                <input
                  id="footer-email"
                  type="email"
                  name="email"
                  placeholder={footer.newsletter.placeholder}
                  className="flex-1 rounded-sm border border-ivory/20 bg-ivory/10 px-4 py-2.5 text-body text-ivory placeholder:text-ivory/50 outline-none focus:border-rose"
                />
                <button
                  type="submit"
                  className="rounded-sm bg-rose px-5 py-2.5 text-small font-semibold text-charcoal transition-colors hover:bg-rose/90"
                >
                  {footer.newsletter.submitLabel}
                </button>
              </form>
              <p className="text-small text-ivory/60 mt-2">{footer.newsletter.privacyNote}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/15 pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footer.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small text-ivory/70 transition-colors hover:text-rose"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-small text-ivory/60">{copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
