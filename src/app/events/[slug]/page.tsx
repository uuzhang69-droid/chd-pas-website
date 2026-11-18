import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import {
    getAllEventRouteSlugs,
    getEventBySlug,
    getEventCategoryBySlug,
} from "@/content/helpers";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow, HeroBackLink } from "@/components/ui/HeroParts";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, eventJsonLd } from "@/lib/seo/structured-data";
import { EventSeriesSections } from "@/components/events/EventSeriesSections";
import { AutoPlayGallery } from "@/components/ui/AutoPlayGallery";
import { SectionedPage } from "@/components/ui/SectionedPage";
import { EventPhotoCarousel } from "@/components/events/EventPhotoCarousel";
import { EventProgramme } from "@/components/events/EventProgramme";
import { isEventEnded } from "@/lib/events/event-dates";
import { withImageSizes } from "@/lib/events/image-dimensions";
import { latestSession, longDate, sessionTimeRange } from "@/lib/events/series";
import { isPublicEvent } from "@/content/event-visibility";

/* Event order and Past Event labels depend on the date, so these pages refresh every 15 minutes. All three use the same value so they never disagree for long. */
export const revalidate = 900;

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return getAllEventRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    if (!isPublicEvent(slug)) notFound();
    const category = getEventCategoryBySlug(slug);
    if (category) {
        return pageMetadata({
            title: category.meta.title,
            description: category.meta.description,
            path: `/events/${slug}`,
            // Sections still say "coming soon" and nothing links here, so keep them out of search for now.
            noindex: true,
        });
    }
    const event = getEventBySlug(slug);
    if (!event) return {};
    return pageMetadata({
        title: event.title,
        description: event.excerpt,
        path: `/events/${slug}`,
        image: event.image,
    });
}

export default async function EventDetailPage({ params }: PageProps) {
    const { slug } = await params;
    if (!isPublicEvent(slug)) notFound();
    const category = getEventCategoryBySlug(slug);
    if (category) {
        return (
            <PageShell>
                <JsonLd
                    data={breadcrumbJsonLd([
                        {
                            name: siteContent.pages.events.meta.title,
                            path: "/events",
                        },
                        { name: category.meta.title, path: `/events/${slug}` },
                    ])}
                />
                <SectionedPage {...category} />
            </PageShell>
        );
    }

    const event = getEventBySlug(slug);
    if (!event) notFound();

    const { detailLabels } = siteContent.pages.events;

    const descriptionCtasByIndex = new Map<
        number,
        NonNullable<typeof event.descriptionCtas>
    >();
    for (const cta of event.descriptionCtas ?? []) {
        const existing = descriptionCtasByIndex.get(cta.paragraphIndex) ?? [];
        existing.push(cta);
        descriptionCtasByIndex.set(cta.paragraphIndex, existing);
    }

    /* One static hero image. Sizes come from the file when the content data omits them. */
    const [heroImage] = withImageSizes([event.image]);
    const hasPortraitHero = Boolean(
        heroImage.width &&
        heroImage.height &&
        heroImage.height > heroImage.width,
    );
    /* Extra photos go in the gallery below About; the hero image is not repeated there. */
    const galleryImages = withImageSizes(
        (event.gallery ?? []).filter((image) => image.src !== event.image.src),
    );
    const latest = event.isSeries ? latestSession(event.sessions) : undefined;
    const heroDate = event.dateIso
        ? new Intl.DateTimeFormat("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
          }).format(new Date(`${event.dateIso}T12:00:00Z`))
        : event.date;
    /* Events with a separate time field show the plain date; older events keep their full date and time string. */
    const latestWhen = latest?.date
        ? [
              longDate(latest.date),
              latest.start ? sessionTimeRange(latest) : undefined,
          ]
              .filter(Boolean)
              .join(", ")
        : undefined;
    const facts = (
        event.isSeries
            ? [
                  ["Series", "Monthly series"],
                  ["Latest concert", latestWhen],
              ]
            : [
                  [detailLabels.date, event.time ? heroDate : event.date],
                  ["Time", event.time],
                  ["Teacher", event.teacher],
                  ["Admission", event.admission],
                  [detailLabels.location, event.location],
              ]
    ).filter(([, value]) => Boolean(value));
    const overline = [event.category, event.discipline]
        .filter(Boolean)
        .join(" · ");
    const isPast = !event.isSeries && isEventEnded(event);
    /* Booking lives in the hero only. A button pointing back at this page is not a booking link. */
    const ownPage = `/events/${event.slug}`;
    const bookingButtons =
        event.tickets && event.tickets.length > 0
            ? event.tickets
            : event.bookingPending || event.bookNow.href === ownPage
              ? []
              : [event.bookNow];

    return (
        <PageShell>
            <JsonLd data={eventJsonLd(event)} />
            <JsonLd
                data={breadcrumbJsonLd([
                    {
                        name: siteContent.pages.events.meta.title,
                        path: "/events",
                    },
                    { name: event.title, path: `/events/${slug}` },
                ])}
            />
            <section className="border-b border-taupe/30 bg-blush/20">
                <Container className="section-y">
                    <HeroBackLink href="/events" tone="light">
                        {detailLabels.backLink}
                    </HeroBackLink>
                    <div
                        className={`mt-8 grid gap-8 grid-gap-x ${
                            hasPortraitHero
                                ? "items-center md:grid-cols-[minmax(0,22rem)_1fr] lg:grid-cols-[minmax(0,24rem)_1fr]"
                                : "items-start md:grid-cols-2"
                        }`}
                    >
                        <Image
                            src={heroImage.src}
                            alt={heroImage.alt}
                            width={heroImage.width ?? 0}
                            height={heroImage.height ?? 0}
                            className="h-auto w-full max-w-sm rounded-sm shadow-sm md:max-w-none"
                            style={{ width: "100%", height: "auto" }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        <div>
                            {overline && (
                                <Eyebrow tone="light">{overline}</Eyebrow>
                            )}
                            <h1 className="text-h1 mt-4 text-charcoal lg:text-[3.25rem]">
                                {event.title}
                            </h1>
                            {event.subtitle && (
                                <p className="text-body-lg mt-4 text-charcoal/85">
                                    {event.subtitle}
                                </p>
                            )}
                            {event.freeAdmission && (
                                <p className="text-overline mt-4 inline-block rounded-full border border-burgundy/50 px-3 py-1 text-burgundy">
                                    Free admission
                                </p>
                            )}
                            <dl className="mt-7 divide-y divide-taupe/40 border-y border-taupe/40">
                                {facts.map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid gap-x-5 gap-y-1 py-4 sm:grid-cols-[7rem_1fr]"
                                    >
                                        <dt className="text-overline text-burgundy">
                                            {label}
                                        </dt>
                                        <dd className="text-body-lg text-charcoal">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            {event.isSeries ? null : isPast ? (
                                <p className="text-overline mt-6 text-charcoal/60">
                                    Past Event
                                </p>
                            ) : bookingButtons.length > 0 ? (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {bookingButtons.map((cta) => (
                                        <Button
                                            key={`${cta.label}-${cta.href}`}
                                            {...cta}
                                            className="w-full sm:w-auto sm:min-w-48"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-body mt-6 text-charcoal/60">
                                    Booking details coming soon
                                </p>
                            )}
                        </div>
                    </div>
                </Container>
            </section>

            <section className="section-y">
                <Container>
                    {event.excerpt && !event.subtitle && (
                        <p className="text-body-lg mb-10 text-charcoal/85">
                            {event.excerpt}
                        </p>
                    )}
                    {event.isSeries ? (
                        <EventSeriesSections event={event} />
                    ) : (
                        event.description && (
                            <div className="mt-6 w-full space-y-5 first:mt-0">
                                {event.description.map((paragraph, index) => {
                                    const heading = paragraph.startsWith("# ")
                                        ? paragraph.slice(2)
                                        : null;
                                    const inlineGallery = heading
                                        ? event.inlineGalleries?.find(
                                              (entry) =>
                                                  entry.beforeHeading ===
                                                  heading,
                                          )
                                        : undefined;

                                    return (
                                        <Fragment key={`block-${index}`}>
                                            {inlineGallery &&
                                                inlineGallery.images.length >
                                                    0 &&
                                                (inlineGallery.variant ===
                                                "autoplay" ? (
                                                    <AutoPlayGallery
                                                        images={
                                                            inlineGallery.images
                                                        }
                                                        label={`${heading} photos`}
                                                        naturalSize
                                                        sizes="(max-width: 1280px) 100vw, 768px"
                                                    />
                                                ) : (
                                                    <EventPhotoCarousel
                                                        images={withImageSizes(
                                                            inlineGallery.images,
                                                        )}
                                                        label={`${heading} images`}
                                                        display="natural"
                                                    />
                                                ))}
                                            {heading ? (
                                                <h2 className="text-h2 pt-8 text-charcoal first:pt-0">
                                                    {heading}
                                                </h2>
                                            ) : (
                                                <p className="text-body-lg text-charcoal/85">
                                                    {paragraph}
                                                </p>
                                            )}
                                            {!heading &&
                                                !isPast &&
                                                descriptionCtasByIndex
                                                    .get(index)
                                                    ?.map((cta) => {
                                                        return (
                                                            <Button
                                                                key={`${index}-${cta.label}-${cta.href ?? "inactive"}`}
                                                                label={cta.label}
                                                                href={cta.href}
                                                                variant={cta.variant}
                                                                external={cta.external}
                                                                inactive={
                                                                    cta.inactive
                                                                }
                                                                className="mt-3 !py-2.5"
                                                            />
                                                        );
                                                    })}
                                        </Fragment>
                                    );
                                })}
                            </div>
                        )
                    )}
                    {event.photoCarousel ? (
                        <EventPhotoCarousel
                            images={event.photoCarousel.images}
                            label={event.photoCarousel.label}
                            display={event.photoCarousel.display}
                            className="mt-10 md:mt-12"
                        />
                    ) : galleryImages.length > 1 ? (
                        <EventPhotoCarousel
                            images={galleryImages}
                            label="Event gallery"
                            display="natural"
                            className="mt-10 md:mt-12"
                        />
                    ) : galleryImages.length === 1 ? (
                        <Image
                            src={galleryImages[0].src}
                            alt={galleryImages[0].alt}
                            width={galleryImages[0].width ?? 0}
                            height={galleryImages[0].height ?? 0}
                            className="mt-10 h-auto max-h-[520px] w-auto max-w-full rounded-sm md:mt-12"
                            sizes="(max-width: 1280px) 100vw, 1280px"
                        />
                    ) : null}
                    {event.teacherBio && (
                        <section
                            aria-labelledby="teacher-bio"
                            className="mt-12 grid items-start gap-8 border-t border-taupe/30 pt-10 md:mt-16 md:grid-cols-[3fr_2fr] md:gap-12 md:pt-12"
                        >
                            <div className="max-w-2xl">
                                <h2
                                    id="teacher-bio"
                                    className="text-h2 text-charcoal"
                                >
                                    {event.teacherBio.heading}
                                </h2>
                                {event.teacherBio.role && (
                                    <p className="text-overline mt-3 text-burgundy">
                                        {event.teacherBio.name} ·{" "}
                                        {event.teacherBio.role}
                                    </p>
                                )}
                                <div className="mt-5 space-y-4">
                                    {event.teacherBio.paragraphs.map(
                                        (paragraph) => (
                                            <p
                                                key={paragraph}
                                                className="text-body text-charcoal/75"
                                            >
                                                {paragraph}
                                            </p>
                                        ),
                                    )}
                                </div>
                            </div>
                            <Image
                                src={event.teacherBio.image.src}
                                alt={event.teacherBio.image.alt}
                                width={event.teacherBio.image.width}
                                height={event.teacherBio.image.height}
                                className="h-auto w-full max-w-56 rounded-sm md:max-w-sm md:justify-self-end"
                                sizes="(max-width: 768px) 288px, 384px"
                            />
                        </section>
                    )}
                    {!event.isSeries && (
                        <EventProgramme sessions={event.sessions ?? []} />
                    )}
                    {(event.organiser ||
                        event.partners?.length ||
                        event.hostedAt ||
                        event.promotedBy) && (
                        <section
                            aria-labelledby="event-information"
                            className="mt-12 border-t border-taupe/30 pt-8"
                        >
                            <h2
                                id="event-information"
                                className="text-h3 text-charcoal"
                            >
                                {detailLabels.eventInformation}
                            </h2>
                            <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                                {event.organiser && (
                                    <div>
                                        <dt className="text-overline text-burgundy">
                                            {detailLabels.organiser}
                                        </dt>
                                        <dd className="text-body mt-1 text-charcoal/75">
                                            {event.organiser}
                                        </dd>
                                    </div>
                                )}
                                {!!event.partners?.length && (
                                    <div>
                                        <dt className="text-overline text-burgundy">
                                            {detailLabels.partners}
                                        </dt>
                                        <dd className="text-body mt-1 text-charcoal/75">
                                            {event.partners.join(", ")}
                                        </dd>
                                    </div>
                                )}
                                {event.relationship === "hosted" &&
                                    event.hostedAt && (
                                        <div>
                                            <dt className="text-overline text-burgundy">
                                                {detailLabels.hostedAt}
                                            </dt>
                                            <dd className="text-body mt-1 text-charcoal/75">
                                                {event.hostedAt}
                                            </dd>
                                        </div>
                                    )}
                                {event.promotedBy && (
                                    <div>
                                        <dt className="text-overline text-burgundy">
                                            {detailLabels.promotedBy}
                                        </dt>
                                        <dd className="text-body mt-1 text-charcoal/75">
                                            {event.promotedBy}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    )}
                </Container>
            </section>
        </PageShell>
    );
}
