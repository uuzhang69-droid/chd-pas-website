"use client";

import { useMemo, useState } from "react";
import type { EventCard, EventListingCategory } from "@/content/types";
import { siteContent } from "@/content/site";
import { EventListingGrid } from "@/components/ui/ContentGrids";

type FilterId = "all" | EventListingCategory;

const FILTER_ORDER: FilterId[] = ["all", "event", "workshop", "masterclass"];

function filterLabel(id: FilterId): string {
  const { filters } = siteContent.pages.events;
  switch (id) {
    case "all":
      return filters.all;
    case "event":
      return filters.events;
    case "workshop":
      return filters.workshops;
    case "masterclass":
      return filters.masterclass;
  }
}

export function EventsListing({ items }: { items: readonly EventCard[] }) {
  const [active, setActive] = useState<FilterId>("all");
  const { filters } = siteContent.pages.events;

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
        {FILTER_ORDER.map((id) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`rounded-sm border px-4 py-2 text-small font-medium transition-colors ${
                selected
                  ? "border-burgundy bg-burgundy text-ivory"
                  : "border-taupe/50 bg-ivory text-charcoal hover:border-rose hover:text-rose"
              }`}
              onClick={() => setActive(id)}
            >
              {filterLabel(id)}
            </button>
          );
        })}
      </div>

      <div className="mt-10" role="tabpanel">
        {filtered.length > 0 ? (
          <EventListingGrid items={filtered} />
        ) : (
          <p className="text-body text-charcoal/70">{filters.empty}</p>
        )}
      </div>
    </>
  );
}
