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

export type EventCard = {
  id: string;
  slug: string;
  title: string;
  date: string;
  dateIso?: string;
  location?: string;
  image: ImageAsset;
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
  image: ImageAsset;
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
  intro: string[];
  highlights: Array<{ title: string; description: string }>;
  ageGroups: Array<{ label: string; description: string }>;
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
