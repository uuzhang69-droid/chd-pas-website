import { siteSource } from "@/content/site.source";
import { VenueSpacesSection } from "@/components/venue-hire/VenueSpacesSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function VenueHireContent() {
  const page = siteSource.pages.venueHire.overview;

  return (
    <>
      <VenueSpacesSection
        title={page.spaces.title}
        items={page.spaces.items}
        wholeVenue={page.spaces.wholeVenue}
      />

      <section className="bg-ivory py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.facts.title}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.facts.items.map((item) => (
              <li
                key={item}
                className="rounded-sm border border-taupe/30 bg-white px-5 py-6 text-body text-charcoal"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.facilities.title}</h2>
          <p className="text-body-lg mt-4 text-charcoal/80">{page.facilities.includedNote}</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {page.facilities.items.map((item) => (
              <li key={item} className="text-body text-charcoal/80">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-body mt-6 text-charcoal/75">{page.facilities.extraNote}</p>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.suitableFor.title}</h2>
          <p className="text-body-lg mt-6 text-charcoal/80">
            {page.suitableFor.items.join(" · ")}
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.pricing.title}</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-taupe/40">
                  {page.pricing.columns.map((column, index) => (
                    <th
                      key={`${column}-${index}`}
                      className="px-4 py-3 text-small font-semibold text-charcoal"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.pricing.rows.map((row) => (
                  <tr key={row.label} className="border-b border-taupe/20">
                    <td className="px-4 py-3 text-body text-charcoal">{row.label}</td>
                    <td className="px-4 py-3 text-body text-charcoal/80">{row.standard}</td>
                    <td className="px-4 py-3 text-body text-charcoal/80">{row.member}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 space-y-2">
            {page.pricing.notes.map((note) => (
              <li key={note} className="text-body text-charcoal/75">
                {note}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button {...page.pricing.membershipLink} />
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container className="max-w-3xl">
          <h2 className="text-h2 text-charcoal">{page.howToBook.title}</h2>
          <ol className="mt-8 space-y-5">
            {page.howToBook.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="text-h3 text-rose">{index + 1}</span>
                <p className="text-body-lg text-charcoal/80">
                  <strong className="text-charcoal">{step.title}</strong>
                  {" — "}
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <h2 className="text-h2 text-charcoal">{page.terms.title}</h2>
          <ul className="mt-8 space-y-4">
            {page.terms.items.map((item) => (
              <li key={item.title} className="text-body text-charcoal/80">
                <strong className="text-charcoal">{item.title}</strong> {item.body}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container className="max-w-3xl text-center">
          <h2 className="text-h2 text-charcoal">{page.cta.title}</h2>
          <p className="text-body-lg mt-4 text-charcoal/80">{page.cta.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button {...page.cta.button} />
            <Button {...page.cta.secondaryButton} />
          </div>
          {page.cta.secondary && (
            <p className="text-body mt-4 text-charcoal/65">{page.cta.secondary}</p>
          )}
        </Container>
      </section>
    </>
  );
}
