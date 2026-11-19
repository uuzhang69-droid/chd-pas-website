/** Shared content types — structured for future CMS swap (Airtable/Sanity). */

export type Link = {
    label: string;
    href: string;
    external?: boolean;
};

export type ImageAsset = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    /** CSS object-position for square crops (listing cards), e.g. "40% 50%". Defaults to the centre. */
    position?: string;
};

export type CtaButton = {
    label: string;
    href: string;
    variant?: "primary" | "secondary" | "text";
    external?: boolean;
};

export type HeroSlide = {
    id: string;
    headline: string;
    blurb: string;
    cta: CtaButton;
    image: ImageAsset;
    videoSrc?: string;
};

export type EventDescriptionCta = CtaButton & {
    /** Index in `description` — CTA is shown directly after that paragraph. */
    paragraphIndex: number;
    /** Non-link state (e.g. Coming soon). */
    inactive?: boolean;
};

export type EventListingCategory = "event" | "workshop" | "masterclass";

export type EventRelationship = "organised" | "collaboration" | "hosted";

export type EventAttribution = {
    relationship?: EventRelationship;
    organiser?: string;
    partners?: string[];
    hostedAt?: string;
    promotedBy?: string;
};

export type ActivityType = "class" | "workshop" | "event";

/** Local date and wall-clock times in Europe/London. Missing times never imply availability. */
export type EventSession = EventAttribution & {
    id: string;
    eventSlug: string;
    title: string;
    date?: string;
    start?: string;
    end?: string;
    /** Only when explicitly confirmed; unknown times are not all-day events. */
    allDay?: boolean;
    /** Start is confirmed but the duration is not. The calendar then shows the start only and never an invented end. */
    endUnconfirmed?: boolean;
    venueId?: string;
    spaceId?: string;
    type: ActivityType;
    subtype?: string;
    style?: string;
    venueBooking?: boolean;
    /** Explicit public calendar inclusion/exclusion; never overrides privacy or cancellation. */
    calendarVisible?: boolean;
    published?: boolean;
    cancelled?: boolean;
    private?: boolean;
    bookingUrl?: string;
    setupStart?: string;
    teardownEnd?: string;
    description?: string[];
};

/** Own-layout show page. Copy is written by the organiser; paragraphs are separate strings. */
export type ShowPageContent = {
    headline: string;
    intro: string[];
    facts: { label: string; value: string }[];
    about: { heading: string; paragraphs: string[] };
    cats: {
        heading: string;
        intro: string;
        items: { name: string; role: string; paragraphs: string[] }[];
    };
    schedule: { heading: string; intro: string; timesLabel: string; total: string; support: string };
    tickets: {
        heading: string;
        intro: string;
        familyNote: string;
        group: { heading: string; paragraphs: string[]; contactLabel: string; contactHref: string };
        button: string;
    };
    venue: { heading: string; paragraphs: string[]; name: string; address: string };
    visit: { heading: string; intro: string; items: { title: string; paragraphs: string[] }[] };
    finalCta: { heading: string; paragraphs: string[]; button: string };
};

export type EventCard = {
    id: string;
    slug: string;
    /** Listing filter on /events — defaults to event when omitted. */
    listingCategory?: EventListingCategory;
    relationship?: EventRelationship;
    organiser?: string;
    partners?: string[];
    hostedAt?: string;
    /** Promotion alone does not imply hosting or co-organisation. */
    promotedBy?: string;
    sessions?: EventSession[];
    title: string;
    /** Optional line shown under the title on the event page. */
    subtitle?: string;
    /** Optional descriptive facts shown on the event page. */
    category?: string;
    discipline?: string;
    teacher?: string;
    /** Display time range, e.g. "15:00–18:00". */
    time?: string;
    date: string;
    dateIso?: string;
    location?: string;
    image: ImageAsset;
    /** Official booking page. Used by every Book Now button for this event. */
    bookingUrl?: string;
    /** Admission note shown in the event facts, e.g. "Free admission". */
    admission?: string;
    /** Opt in to the Timetable calendar for a single-day event with a confirmed start and end time. */
    calendar?: {
        /** Short name on the calendar card; the full title and page link are kept. */
        name: string;
        /** Type line on the calendar card, e.g. "Art & Performance". Defaults to `name`. */
        label?: string;
        style: string;
        type?: ActivityType;
        admission?: string;
    };
    /** Ongoing series: the page lists sessions (latest first) instead of a single date. */
    isSeries?: boolean;
    /** Shows a "Free admission" tag in the event hero. */
    freeAdmission?: boolean;
    /** True while no official booking page exists; hides Book Now on the detail page. */
    bookingPending?: boolean;
    /** Swipeable photo strip shown after the description. */
    photoCarousel?: {
        label: string;
        images: ImageAsset[];
        /** Optional. "natural" keeps each image at its own ratio, uncropped. */
        display?: "cover" | "natural";
    };
    /** Two-column teacher section shown after the photo strip. */
    teacherBio?: {
        heading: string;
        name: string;
        role?: string;
        paragraphs: string[];
        image: ImageAsset;
    };
    /** Label of the card button on the listing, when it should not say View Details. */
    cardCtaLabel?: string;
    /** One short sentence for listing cards. Falls back to excerpt; the detail page keeps using excerpt. */
    cardExcerpt?: string;
    /** Search and share text when the page needs its own wording. */
    seo?: { title: string; description: string };
    /** A run of separate performances (not a series and not one continuous event). Structured data lists each performance. */
    isPerformanceRun?: boolean;
    /** Verified ticket prices, GBP. Used for the page and structured data. */
    ticketOffers?: { name: string; price: number; description?: string }[];
    /** Optional show page layout with its own sections. */
    showPage?: ShowPageContent;
    bookNow: CtaButton;
    tickets?: CtaButton[];
    descriptionCtas?: EventDescriptionCta[];
    excerpt?: string;
    description?: string[];
    gallery?: ImageAsset[];
    inlineGalleries?: {
        beforeHeading: string;
        images: ImageAsset[];
        variant?: "grid" | "autoplay";
    }[];
};

export type ClassStyleTile = {
    id: string;
    name: string;
    slug: string;
    image: ImageAsset;
    href: string;
};

export type ClassInstructor = {
    name: string;
    role?: string;
    bio: string;
    /** Further verified paragraphs shown after the main biography. */
    moreBio?: string[];
    image: ImageAsset;
};

/** One way of taking a class, as listed on the timetable (for example "Gentle Flow"). */
export type ClassFormat = {
    /** Optional public heading; the canonical class name remains unchanged. */
    title?: string;
    name: string;
    summary: string;
    image?: ImageAsset;
    /** Who teaches this format, only where the assignment is confirmed (for example "Wednesday evenings with Debbie Bhowmik"). */
    taughtBy?: string;
};

export type ClassStylePage = {
    slug: string;
    name: string;
    metaDescription: string;
    hero: {
        overline: string;
        title: string;
        subtitle: string;
        image: ImageAsset;
    };
    instructor: ClassInstructor;
    /** Further teachers of the same class, shown after the main instructor under one heading. */
    additionalInstructors?: ClassInstructor[];
    /** "Meet your instructor" or "Meet your instructors". */
    instructorHeading: string;
    /** About the discipline, in a few short paragraphs. */
    about: { title?: string; paragraphs: string[]; image?: ImageAsset };
    /** The classes actually offered, each described separately. */
    formats: ClassFormat[];
    formatSection?: { title: string };
    formatsNote?: string;
    /** What to expect: only what is true and useful for this class. */
    expect?: { title?: string; items: Array<{ title: string; description: string }> };
    closing: { title: string; body: string };
    cta: CtaButton;
};

export type ClassStyleCard = {
    id: string;
    name: string;
    slug: string;
    href: string;
    image: ImageAsset;
    excerpt: string;
};

export type CourseSummary = {
    id: string;
    slug: string;
    title: string;
    term: string;
    level: string;
    excerpt: string;
    image: ImageAsset;
    href: string;
};

export type CourseDetail = CourseSummary & {
    metaDescription: string;
    duration: string;
    schedule: string;
    price: string;
    description: string[];
    includes: string[];
    cta: CtaButton;
};

export type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

export type FormField = {
    name: string;
    label: string;
    type: "text" | "email" | "tel" | "textarea" | "select";
    placeholder?: string;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
    /** Show (and accept) this field only while another field has the given value. */
    showWhen?: { field: string; value: string };
    /** Extra help shown under the label while the Subject has the given value (display only; the server ignores it). */
    guidance?: Array<{ value: string; text: string }>;
};

export type FacultyMember = {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: ImageAsset;
};

export type GiftCardOption = {
    id: string;
    title: string;
    amount: string;
    description: string;
    cta: CtaButton;
};

export type PageHeroContent = {
    overline?: string;
    title: string;
    subtitle?: string;
    image?: ImageAsset;
};

export type SectionedPageSection = {
    id: string;
    title: string;
    body?: string;
    gallery?: readonly ImageAsset[];
    cta?: CtaButton;
    /** When set, overrides default alternating layout (even = text left, odd = gallery left). */
    galleryPosition?: "left" | "right";
};

export type NumberedStep = {
    title: string;
    body: string;
};

export type PageCtaBlock = {
    title: string;
    body: string;
    button: CtaButton;
    secondary?: string;
};

export type SectionedPageContent = {
    slug?: string;
    meta: {
        title: string;
        description: string;
    };
    hero: PageHeroContent;
    intro?: string;
    /** Optional autoplay image gallery shown below the intro. */
    gallery?: readonly ImageAsset[];
    galleryLabel?: string;
    sections: SectionedPageSection[];
};

export type NavItem = {
    label: string;
    href: string;
    /** When true, the parent label is a link as well as opening the submenu. Default: not clickable. */
    parentLink?: boolean;
    children?: Link[];
};

export type SocialLink = {
    platform: string;
    href: string;
    label: string;
};

export type BookingEmbed = {
    title: string;
    description: string;
    placeholderLabel: string;
    placeholderHint: string;
    providerNote: string;
    embedScriptUrl?: string;
    image?: ImageAsset;
};
