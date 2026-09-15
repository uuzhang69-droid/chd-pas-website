"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteContent } from "@/content/site";
import { BrandMark } from "@/components/layout/BrandMark";
import type { NavItem } from "@/content/types";
import {
  ChevronDownIcon,
  SearchIcon,
} from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type NavItemWithChildren = NavItem & { children: NonNullable<NavItem["children"]> };

function NavDropdown({ item }: { item: NavItemWithChildren }) {
  const { submenuSuffix } = siteContent.ui.header;
  const [open, setOpen] = useState(false);

  function closeIfFocusLeft(container: HTMLElement, relatedTarget: EventTarget | null) {
    if (relatedTarget instanceof Node && container.contains(relatedTarget)) return;
    setOpen(false);
  }

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => closeIfFocusLeft(event.currentTarget, event.relatedTarget)}
    >
      <button
        type="button"
        className="flex shrink-0 items-center gap-0.5 whitespace-nowrap px-0.5 text-[13px] font-medium leading-none text-charcoal transition-colors hover:text-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy xl:gap-1 xl:text-sm 2xl:gap-1.5 2xl:text-body"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.label}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 xl:h-4 xl:w-4 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <ul
            className="min-w-[240px] rounded-sm border border-taupe/40 bg-ivory py-2 shadow-lg animate-fade-up"
            role="menu"
            aria-label={`${item.label}${submenuSuffix}`}
          >
            {item.children.map((child) => (
              <li key={child.label} role="none">
                <Link
                  href={child.href}
                  role="menuitem"
                  className="block px-4 py-2.5 text-body text-charcoal transition-colors hover:bg-rose/10 hover:text-rose focus-visible:bg-rose/10 focus-visible:text-rose focus-visible:outline-none"
                  {...(child.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileNavAccordion({
  item,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: NavItemWithChildren;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const panelId = `mobile-nav-${item.label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="border-b border-taupe/20 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center py-1.5 text-left text-body font-medium leading-none text-charcoal"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          {item.label}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {expanded && (
        <ul id={panelId} className="mb-1 ml-3 space-y-0.5 border-l border-taupe/30 pl-3">
          {item.children.map((child) => (
            <li key={child.label}>
              <Link
                href={child.href}
                className="block rounded-sm py-1.5 text-small leading-snug text-charcoal/85 hover:text-rose"
                onClick={onNavigate}
                {...(child.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const { navigation } = siteContent.global;
  const { header: headerUi } = siteContent.ui;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = navigation.items.filter(
    (item): item is NavItemWithChildren => Boolean(item.children?.length),
  );

  function closeMobileMenu() {
    setMobileOpen(false);
    setMobileExpanded(null);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-taupe/30 bg-ivory/95 backdrop-blur-md">
      <div className="flex w-full items-center py-2.5 lg:py-3">
        <div className="shrink-0 pl-5 sm:pl-6 lg:pl-8 xl:pl-10">
          <BrandMark priority />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 pr-5 sm:pr-6 lg:gap-5 lg:pl-8 lg:pr-8 xl:pl-12 xl:gap-6 xl:pr-10 2xl:pl-16">
          <nav
            className="hidden min-w-0 flex-1 flex-nowrap items-center justify-evenly gap-0.5 lg:flex xl:gap-1.5 2xl:gap-3"
            aria-label={headerUi.mainNavigation}
          >
            {navItems.map((item) => (
              <NavDropdown key={item.label} item={item} />
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex xl:gap-3">
            <button
              type="button"
              className="shrink-0 rounded-full p-2 text-charcoal transition-colors hover:bg-rose/15 hover:text-rose"
              aria-label={navigation.search.label}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <SearchIcon />
            </button>
            <Button {...navigation.bookTrial} className="shrink-0 whitespace-nowrap !px-3 !py-2.5 xl:!px-5" />
          </div>

          <button
            type="button"
            className="ml-auto inline-flex shrink-0 flex-col justify-center gap-1.5 rounded p-2 lg:hidden"
            aria-label={mobileOpen ? headerUi.closeMenu : headerUi.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => {
              if (mobileOpen) closeMobileMenu();
              else setMobileOpen(true);
            }}
          >
            <span className={`block h-0.5 w-6 bg-charcoal transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-charcoal transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-charcoal transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <Container>
          <form
            action={navigation.search.action}
            method="get"
            className="hidden border-t border-taupe/20 py-4 lg:block"
          >
            <label htmlFor="site-search" className="sr-only">
              {navigation.search.label}
            </label>
            <div className="flex gap-3">
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder={navigation.search.placeholder}
                className="flex-1 rounded-sm border border-taupe/50 bg-ivory px-4 py-2.5 text-body outline-none focus:border-rose"
              />
              <button
                type="submit"
                className="rounded-sm bg-burgundy px-5 py-2.5 text-small font-medium text-ivory"
              >
                {navigation.search.label}
              </button>
            </div>
          </form>
        </Container>
      )}

    </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/50"
            aria-label={headerUi.closeMenu}
            onClick={closeMobileMenu}
          />
          <nav
            className="animate-slide-in-right absolute right-0 top-0 flex h-full w-[80%] max-w-[320px] flex-col overflow-y-auto border-l border-taupe/30 bg-ivory shadow-xl"
            aria-label={headerUi.mobileNavigation}
          >
            <div className="px-4 py-3">
              {navItems.map((item) => (
                <MobileNavAccordion
                  key={item.label}
                  item={item}
                  expanded={mobileExpanded === item.label}
                  onToggle={() =>
                    setMobileExpanded((current) =>
                      current === item.label ? null : item.label,
                    )
                  }
                  onNavigate={closeMobileMenu}
                />
              ))}
              <div className="mt-3 border-t border-taupe/30 pt-3">
                <Button {...navigation.bookTrial} className="w-full" />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
