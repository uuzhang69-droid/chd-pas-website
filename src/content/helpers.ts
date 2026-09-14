import type { ClassStylePage, CourseDetail, EventCard, SectionedPageContent } from "./types";
import { siteContent } from "./site";

type SluggedSectionedPage = SectionedPageContent & { slug: string };

function findBySlug(pages: readonly SluggedSectionedPage[], slug: string) {
  return pages.find((page) => page.slug === slug);
}

export function getClassBySlug(slug: string): ClassStylePage | undefined {
  return siteContent.pages.classes.styles.find((style) => style.slug === slug);
}

export function getAllClassSlugs(): string[] {
  return siteContent.pages.classes.styles.map((style) => style.slug);
}

export function getCourseBySlug(slug: string): CourseDetail | undefined {
  return siteContent.pages.courses.items.find((course) => course.slug === slug);
}

export function getAllCourseSlugs(): string[] {
  return siteContent.pages.courses.items.map((course) => course.slug);
}

export function getEventBySlug(slug: string): EventCard | undefined {
  return siteContent.pages.events.items.find((event) => event.slug === slug);
}

export function getAllEventSlugs(): string[] {
  return siteContent.pages.events.items.map((event) => event.slug);
}

export function getEventCategoryBySlug(slug: string): SluggedSectionedPage | undefined {
  return findBySlug(siteContent.pages.events.categories, slug);
}

export function getAllEventCategorySlugs(): string[] {
  return siteContent.pages.events.categories.map((category) => category.slug);
}

export function getAllEventRouteSlugs(): string[] {
  return [...getAllEventSlugs(), ...getAllEventCategorySlugs()];
}

export function getStudioHireSubpageBySlug(slug: string): SluggedSectionedPage | undefined {
  return findBySlug(siteContent.pages.studioHire.subpages, slug);
}

export function getAllStudioHireSubpageSlugs(): string[] {
  return siteContent.pages.studioHire.subpages.map((page) => page.slug);
}

export function getMembershipSubpageBySlug(slug: string): SluggedSectionedPage | undefined {
  return findBySlug(siteContent.pages.membership.subpages, slug);
}

export function getAllMembershipSubpageSlugs(): string[] {
  return siteContent.pages.membership.subpages.map((page) => page.slug);
}
