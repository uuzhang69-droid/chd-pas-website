import { siteContent } from "@/content/site";
import { SocialIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";

export function NewsletterBand() {
  const { newsletter } = siteContent.home;
  const { utilityBar } = siteContent.global;

  return (
    <section className="bg-rose/15 py-16 md:py-20" aria-labelledby="newsletter-heading">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-overline text-rose mb-3">{newsletter.overline}</p>
          <h2 id="newsletter-heading" className="text-h2 text-charcoal">
            {newsletter.title}
          </h2>
          <p className="text-body-lg mt-4 text-charcoal/75">{newsletter.description}</p>

          <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="#" method="post">
            <label htmlFor="home-newsletter-email" className="sr-only">
              {newsletter.placeholder}
            </label>
            <input
              id="home-newsletter-email"
              type="email"
              name="email"
              placeholder={newsletter.placeholder}
              className="flex-1 rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
            />
            <button
              type="submit"
              className="rounded-sm bg-burgundy px-6 py-3 text-small font-semibold text-ivory transition-colors hover:bg-burgundy/90"
            >
              {newsletter.submitLabel}
            </button>
          </form>

          <div className="mt-10">
            <p className="text-overline text-charcoal/60 mb-4">{newsletter.socialHeading}</p>
            <div className="flex justify-center gap-4">
              {utilityBar.social.map((item) => (
                <a
                  key={item.platform}
                  href={item.href}
                  aria-label={item.label}
                  className="rounded-full border border-rose/40 bg-ivory p-3 text-charcoal transition-colors hover:border-rose hover:text-rose"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon platform={item.platform} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
