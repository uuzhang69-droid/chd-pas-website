"use client";

import { useState } from "react";
import type { FaqItem } from "@/content/types";
import { ChevronDownIcon } from "@/components/icons/SocialIcons";

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-taupe/40 border border-taupe/30 rounded-sm bg-ivory">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-rose/10"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className="text-h4 text-charcoal">{item.question}</span>
                <ChevronDownIcon
                  className={`shrink-0 text-rose transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
              hidden={!isOpen}
            >
              <p className="px-6 pb-5 text-body text-charcoal/75">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
