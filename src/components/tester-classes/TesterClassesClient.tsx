"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ClassCard } from "@/components/tester-classes/ClassCard";
import {
  CartIcon,
  FilterIcon,
} from "@/components/tester-classes/TesterClassesIcons";
import { SearchIcon, ChevronDownIcon } from "@/components/icons/SocialIcons";
import { siteContent } from "@/content/site";
import type {
  ClassDay,
  ClassDiscipline,
  TesterClass,
} from "@/lib/tester-classes/types";
import {
  CLASS_DAYS,
  CLASS_DISCIPLINES,
  DEFAULT_BOOKING_URL,
} from "@/lib/tester-classes/types";

type TesterClassesClientProps = {
  classes: TesterClass[];
};

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-small transition-colors ${
        selected
          ? "border-burgundy bg-burgundy text-white"
          : "border-taupe/40 bg-white text-charcoal hover:border-rose hover:text-rose"
      }`}
    >
      {label}
    </button>
  );
}

function FilterPanel({
  selectedDays,
  selectedDisciplines,
  onToggleDay,
  onToggleDiscipline,
  onClearAll,
}: {
  selectedDays: ClassDay[];
  selectedDisciplines: ClassDiscipline[];
  onToggleDay: (day: ClassDay) => void;
  onToggleDiscipline: (discipline: ClassDiscipline) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-overline uppercase tracking-[0.12em] text-taupe">
          Day
        </p>
        <div className="flex flex-wrap gap-2">
          {CLASS_DAYS.map((day) => (
            <FilterChip
              key={day}
              label={day}
              selected={selectedDays.includes(day)}
              onClick={() => onToggleDay(day)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-overline uppercase tracking-[0.12em] text-taupe">
          Discipline
        </p>
        <div className="flex flex-wrap gap-2">
          {CLASS_DISCIPLINES.map((discipline) => (
            <FilterChip
              key={discipline}
              label={discipline}
              selected={selectedDisciplines.includes(discipline)}
              onClick={() => onToggleDiscipline(discipline)}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onClearAll}
        className="text-small font-medium text-rose hover:text-rose/80"
      >
        Clear all
      </button>
    </div>
  );
}

export function TesterClassesClient({ classes }: TesterClassesClientProps) {
  const { logo } = siteContent.global;
  const [search, setSearch] = useState("");
  const [selectedDays, setSelectedDays] = useState<ClassDay[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<
    ClassDiscipline[]
  >([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return classes.filter((item) => {
      const matchesSearch =
        !query || item.title.toLowerCase().includes(query);
      const matchesDay =
        selectedDays.length === 0 || selectedDays.includes(item.day);
      const matchesDiscipline =
        selectedDisciplines.length === 0 ||
        selectedDisciplines.includes(item.discipline);

      return matchesSearch && matchesDay && matchesDiscipline;
    });
  }, [classes, search, selectedDays, selectedDisciplines]);

  const activeFilterCount =
    selectedDays.length + selectedDisciplines.length;

  function toggleDay(day: ClassDay) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    );
  }

  function toggleDiscipline(discipline: ClassDiscipline) {
    setSelectedDisciplines((current) =>
      current.includes(discipline)
        ? current.filter((value) => value !== discipline)
        : [...current, discipline],
    );
  }

  function clearFilters() {
    setSelectedDays([]);
    setSelectedDisciplines([]);
  }

  return (
    <div className="min-h-screen bg-blush px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1100px] rounded-2xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4 border-b border-taupe/20 pb-5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="County Hall Dance Centre home"
          >
            <Image
              src={logo.headerSrc ?? logo.src}
              alt=""
              width={logo.minHeight}
              height={logo.minHeight}
              className="shrink-0 object-contain"
              style={{ height: logo.minHeight, width: logo.minHeight }}
            />
            <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold leading-tight text-charcoal sm:text-2xl">
              County Hall Dance Centre
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={DEFAULT_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-taupe/30 p-2.5 text-charcoal transition-colors hover:bg-blush/40 hover:text-burgundy"
              aria-label="Open booking basket"
            >
              <CartIcon />
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-taupe/30 p-1.5 pl-2 text-charcoal transition-colors hover:bg-blush/40"
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush text-small font-semibold text-charcoal">
                CH
              </span>
              <ChevronDownIcon className="h-4 w-4 text-taupe" />
            </button>
          </div>
        </header>

        <h1 className="mt-8 font-[family-name:var(--font-cormorant)] text-4xl font-normal text-charcoal sm:text-5xl">
          Classes
        </h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search classes</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-taupe" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="w-full rounded-xl border border-taupe/35 bg-white py-3 pl-10 pr-4 text-body text-charcoal shadow-sm outline-none transition-colors placeholder:text-taupe focus:border-rose"
            />
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-taupe/35 bg-white px-4 py-3 text-body font-medium text-charcoal shadow-sm transition-colors hover:border-rose hover:text-rose sm:w-auto"
              aria-expanded={filterOpen}
              aria-controls="tester-classes-filter-panel"
            >
              <FilterIcon className="h-5 w-5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-burgundy px-2 py-0.5 text-small text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                id="tester-classes-filter-panel"
                className="absolute right-0 z-20 mt-2 hidden w-[min(100vw-2rem,360px)] rounded-2xl border border-taupe/30 bg-white p-5 shadow-lg sm:block"
              >
                <FilterPanel
                  selectedDays={selectedDays}
                  selectedDisciplines={selectedDisciplines}
                  onToggleDay={toggleDay}
                  onToggleDiscipline={toggleDiscipline}
                  onClearAll={clearFilters}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))
          ) : (
            <p className="py-10 text-center text-body text-taupe">
              No classes match your search or filters.
            </p>
          )}
        </div>

        <p className="mt-6 border-t border-taupe/20 pt-5 text-center text-small text-taupe sm:text-left">
          Booking and payment are completed securely via our booking system.
        </p>
      </div>

      {filterOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-charcoal/40 sm:hidden"
            aria-label="Close filters"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border border-taupe/30 bg-white p-5 shadow-2xl sm:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-montserrat)] text-h4 text-charcoal">
                Filter classes
              </h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-small font-medium text-rose"
              >
                Done
              </button>
            </div>
            <FilterPanel
              selectedDays={selectedDays}
              selectedDisciplines={selectedDisciplines}
              onToggleDay={toggleDay}
              onToggleDiscipline={toggleDiscipline}
              onClearAll={clearFilters}
            />
          </div>
        </>
      )}
    </div>
  );
}
