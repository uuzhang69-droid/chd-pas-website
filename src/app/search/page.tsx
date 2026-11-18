import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PAGE_SIZE, searchSite } from "@/lib/search/search";
import type { SearchResult } from "@/lib/search/types";

/** Search results are never indexed, but the links on them may be followed. */
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

const SUGGESTIONS = [
  { label: "Classes", href: "/classes-info", note: "Dance styles and instructors" },
  { label: "What's On", href: "/events", note: "Events, workshops and performances" },
  { label: "Timetable", href: "/timetable", note: "The weekly class schedule" },
  { label: "Venue Hire", href: "/venue-hire", note: "Hire a studio at County Hall" },
  { label: "Contact", href: "/contact", note: "Ask us a question" },
];

function pageHref(query: string, page: number) {
  const params = new URLSearchParams({ q: query });
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

function ResultCard({ result, highlight = false }: { result: SearchResult; highlight?: boolean }) {
  const { doc, snippet } = result;
  return (
    <li
      className={`rounded-sm border p-5 ${highlight ? "border-rose/60 bg-rose/10" : "border-taupe/30 bg-ivory"}`}
    >
      <p className="text-overline text-rose">{doc.type}</p>
      <h3 className="text-h4 mt-1 text-charcoal">
        <Link href={doc.url} className="hover:text-rose">
          {doc.title}
        </Link>
      </h3>
      {snippet && <p className="text-body mt-2 text-charcoal/75">{snippet}</p>}
      <p className="text-small mt-2 text-charcoal/55">{doc.url}</p>
    </li>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = first(params.q);
  const outcome = searchSite(rawQuery, Number(first(params.page)) || 1);
  const hasQuery = outcome.terms.length > 0;

  return (
    <PageShell>
      <PageHero overline="Search" title="Search the site" compact />

      <section className="section-y">
        <Container>
          <div className="mx-auto max-w-3xl">
            <form action="/search" method="get" role="search" className="flex gap-3">
              <label htmlFor="search-page-q" className="sr-only">
                Search classes, courses, events…
              </label>
              <input
                id="search-page-q"
                name="q"
                type="search"
                defaultValue={outcome.query}
                maxLength={100}
                placeholder="Search classes, courses, events…"
                className="flex-1 rounded-sm border border-taupe/50 bg-ivory px-4 py-3 text-body outline-none focus:border-rose"
              />
              <button
                type="submit"
                className="rounded-sm bg-burgundy px-6 py-3 text-small font-semibold text-ivory transition-colors hover:bg-burgundy/90"
              >
                Search
              </button>
            </form>

            {hasQuery && outcome.total > 0 && (
              <p className="text-body mt-8 text-charcoal/75" role="status">
                {outcome.total} {outcome.total === 1 ? "result" : "results"} for{" "}
                <strong className="text-charcoal">“{outcome.query}”</strong>
              </p>
            )}

            {outcome.suggested && (
              <div className="mt-6">
                <h2 className="text-overline text-charcoal/60 mb-3">Suggested destination</h2>
                <ul>
                  <ResultCard result={outcome.suggested} highlight />
                </ul>
              </div>
            )}

            {outcome.results.length > 0 && (
              <div className="mt-8">
                {outcome.suggested && <h2 className="text-overline text-charcoal/60 mb-3">More results</h2>}
                <ul className="space-y-4">
                  {outcome.results.map((result) => (
                    <ResultCard key={result.doc.url} result={result} />
                  ))}
                </ul>
              </div>
            )}

            {outcome.pageCount > 1 && (
              <nav aria-label="Search results pages" className="mt-8 flex items-center justify-between">
                {outcome.page > 1 ? (
                  <Link href={pageHref(outcome.query, outcome.page - 1)} className="text-body text-rose hover:text-rose/80">
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-small text-charcoal/60">
                  Page {outcome.page} of {outcome.pageCount} ({PAGE_SIZE} per page)
                </span>
                {outcome.page < outcome.pageCount ? (
                  <Link href={pageHref(outcome.query, outcome.page + 1)} className="text-body text-rose hover:text-rose/80">
                    Next →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}

            {(!hasQuery || outcome.total === 0) && (
              <div className="mt-10">
                {hasQuery ? (
                  <p className="text-body-lg text-charcoal" role="status">
                    No results for <strong>“{outcome.query}”</strong>. Try a different word, or start from one of these:
                  </p>
                ) : (
                  <p className="text-body-lg text-charcoal/75">
                    Type a word above, for example “yoga”, “events” or “hire”. Or start from one of these:
                  </p>
                )}
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {SUGGESTIONS.map((item) => (
                    <li key={item.href} className="rounded-sm border border-taupe/30 bg-ivory p-5">
                      <Link href={item.href} className="text-h4 text-charcoal hover:text-rose">
                        {item.label}
                      </Link>
                      <p className="text-small mt-1 text-charcoal/70">{item.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
