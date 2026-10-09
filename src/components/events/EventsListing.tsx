"use client";

import { useMemo, useState } from "react";
import type { EventCard, EventListingCategory } from "@/content/types";
import { EventListingGrid } from "@/components/ui/ContentGrids";

type FilterKey = "all" | EventListingCategory;

type EventsListingProps = {
  items: EventCard[];
  filterLabels: {
    all: string;
    events: string;
    workshops: string;
    masterclass: string;
    empty: string;
  };
};

const FILTER_ORDER: FilterKey[] = ["all", "event", "workshop", "masterclass"];

export function EventsListing({ items, filterLabels }: EventsListingProps) {
  const [active, setActive] = useState<FilterKey>("all");

  const labelByKey: Record<FilterKey, string> = {
    all: filterLabels.all,
    event: filterLabels.events,
    workshop: filterLabels.workshops,
    masterclass: filterLabels.masterclass,
  };

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter((item) => (item.listingCategory ?? "event") === active);
  }, [active, items]);

  return (
    <>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter what's on"
      >
        {FILTER_ORDER.map((key) => {
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(key)}
              className={`rounded-full border px-4 py-2 text-small font-medium transition-colors ${
                selected
                  ? "border-burgundy bg-burgundy text-ivory"
                  : "border-taupe/40 bg-ivory text-charcoal hover:border-rose hover:text-rose"
              }`}
            >
              {labelByKey[key]}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10">
          <EventListingGrid items={filtered} />
        </div>
      ) : (
        <p className="text-body mt-10 text-charcoal/60">{filterLabels.empty}</p>
      )}
    </>
  );
}
