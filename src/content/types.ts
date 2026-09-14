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

export type EventCard = {
  id: string;
  slug: string;
  title: string;
  date: string;
  dateIso?: string;
  location?: string;
  image: ImageAsset;
  bookNow: CtaButton;
  excerpt?: string;
  description?: string[];
};

export type ClassStyleTile = {
  id: string;
  name: string;
  slug: string;
  image: ImageAsset;
  href: string;
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
  intro: string[];
  highlights: Array<{ title: string; description: string }>;
  ageGroups: Array<{ label: string; description: string }>;
  cta: CtaButton;
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
};

export type SectionedPageContent = {
  slug?: string;
  meta: {
    title: string;
    description: string;
  };
  hero: PageHeroContent;
  intro?: string;
  sections: SectionedPageSection[];
};

export type NavItem = {
  label: string;
  href: string;
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
};
