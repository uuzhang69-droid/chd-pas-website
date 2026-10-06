"use client";

import {
  CalendarDays,
  Coins,
  Crown,
  Feather,
  Flower2,
  Gift,
  Leaf,
  Music,
  Percent,
  PersonStanding,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  isFoundingGiftActive,
  MEMBERSHIP_TIER_CONTACT_HREF,
  REFER_A_FRIEND_MAILTO,
  buildMembershipContactHref,
} from "@/lib/membership/enquiry-links";
import "./membership-section.css";

type Benefit = {
  icon: LucideIcon;
  text: string;
  detail?: string;
  foundingGift?: boolean;
};

function BenefitRow({ benefit }: { benefit: Benefit }) {
  const Icon = benefit.icon;
  return (
    <li {...(benefit.foundingGift ? { "data-founding-gift": true } : {})}>
      <span className="benefit-icon" aria-hidden="true">
        <Icon strokeWidth={1.5} />
      </span>
      <span>
        {benefit.text}
        {benefit.detail ? <small>{benefit.detail}</small> : null}
      </span>
    </li>
  );
}

const TRY_BENEFITS: Benefit[] = [
  { icon: PersonStanding, text: "1 × complimentary taster class", detail: "Any style you like" },
  { icon: Percent, text: "5% off regular classes" },
  { icon: ShoppingBag, text: "5% off merchandise" },
];

const MOVE_BENEFITS: Benefit[] = [
  {
    icon: PersonStanding,
    text: "2 × complimentary taster classes",
    detail: "Different disciplines",
  },
  { icon: Percent, text: "5% off regular classes" },
  { icon: CalendarDays, text: "Free access to all regular community events" },
  { icon: Star, text: "Free access to selected masterclasses" },
  {
    icon: Gift,
    text: "September–October founding gift",
    detail: "CHDPAS dance bag or dance shoes",
    foundingGift: true,
  },
];

const CONNECT_BENEFITS: Benefit[] = [
  {
    icon: Users,
    text: "3 × complimentary taster classes",
    detail: "1 can be gifted to a friend",
  },
  { icon: Percent, text: "5% off regular classes" },
  { icon: CalendarDays, text: "Free access to all regular community events" },
  { icon: Star, text: "Free access to selected masterclasses" },
  {
    icon: Gift,
    text: "September–October founding gift",
    detail: "CHDPAS dance bag or dance shoes",
    foundingGift: true,
  },
];

const STYLE_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: "Tai Chi", icon: Wind },
  { label: "Tango", icon: Music },
  { label: "Contemporary", icon: Sparkles },
  { label: "Yoga", icon: Flower2 },
  { label: "Chinese Dance", icon: Feather },
  { label: "Meditation", icon: Leaf },
];

export function MembershipSection() {
  const [showFoundingGift, setShowFoundingGift] = useState(true);

  useEffect(() => {
    setShowFoundingGift(isFoundingGiftActive());
  }, []);

  const filterBenefits = (items: Benefit[]) =>
    items.filter((item) => !item.foundingGift || showFoundingGift);

  return (
    <section className="scroll-mt-24" id="membership">
      <header className="membership-head">
        <div>
          <p className="eyebrow">MEMBERSHIP</p>
          <h2>
            More than a class.
            <br />
            <em>A community.</em>
          </h2>
        </div>
        <p>Three ways to make County Hall your dance home. Choose the membership that fits how you want to move.</p>
      </header>

      <div className="tier-grid">
        <article className="tier" aria-labelledby="tier-try-name">
          <header className="tier-head">
            <h3 className="tier-name" id="tier-try-name">
              TRY
            </h3>
            <p className="tier-sub">For those who want to explore.</p>
          </header>
          <p className="tier-price">
            <strong>£29</strong>
            <span>/ month</span>
          </p>
          <ul className="tier-benefits">
            {filterBenefits(TRY_BENEFITS).map((benefit) => (
              <BenefitRow key={benefit.text} benefit={benefit} />
            ))}
          </ul>
          <div className="tier-foot">
            <p className="tier-tagline">Try · Discover · Find your style</p>
            <a className="button button--outline" href={MEMBERSHIP_TIER_CONTACT_HREF.try}>
              Start with Try ↗
            </a>
          </div>
        </article>

        <article className="tier tier--move" aria-labelledby="tier-move-name">
          <span className="tier-badge" aria-hidden="true">
            <Crown strokeWidth={1.5} aria-hidden="true" />
            MOST POPULAR
          </span>
          <header className="tier-head">
            <h3 className="tier-name" id="tier-move-name">
              MOVE
            </h3>
            <p className="tier-sub">For those who want to make dance part of their life.</p>
          </header>
          <p className="tier-price">
            <strong>£49</strong>
            <span>/ month</span>
          </p>
          <ul className="tier-benefits">
            {filterBenefits(MOVE_BENEFITS).map((benefit) => (
              <BenefitRow key={benefit.text} benefit={benefit} />
            ))}
          </ul>
          <div className="tier-foot">
            <p className="tier-tagline">Grow · Connect · Belong</p>
            <a
              className="button"
              href={buildMembershipContactHref("move", { includeFoundingGift: showFoundingGift })}
            >
              Join Move ↗
            </a>
          </div>
        </article>

        <article className="tier tier--connect" aria-labelledby="tier-connect-name">
          <header className="tier-head">
            <h3 className="tier-name" id="tier-connect-name">
              CONNECT
            </h3>
            <p className="tier-sub">For those who want to bring others into the community.</p>
          </header>
          <p className="tier-price">
            <strong>£59</strong>
            <span>/ month</span>
          </p>
          <ul className="tier-benefits">
            {filterBenefits(CONNECT_BENEFITS).map((benefit) => (
              <BenefitRow key={benefit.text} benefit={benefit} />
            ))}
          </ul>
          <div className="tier-foot">
            <p className="tier-tagline">More friends · More fun · More dance</p>
            <a
              className="button button--outline"
              href={buildMembershipContactHref("connect", { includeFoundingGift: showFoundingGift })}
            >
              Join Connect ↗
            </a>
          </div>
        </article>
      </div>

      <p className="membership-refer-link">
        <a className="text-link" href={REFER_A_FRIEND_MAILTO}>
          Refer a friend ↗
        </a>
      </p>

      <div className={`promo-row${showFoundingGift ? "" : " promo-row--single"}`}>
        <article className="promo">
          <div className="promo-top">
            <span className="benefit-icon" aria-hidden="true">
              <Users strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">REFER A FRIEND</p>
              <h3>Share the joy.</h3>
            </div>
          </div>
          <p>Introduce a friend and get rewarded.</p>
          <div className="reward-grid">
            <div className="reward">
              <strong>£10</strong>
              <b>member credit</b>
              <span>when your friend joins a £29 membership</span>
            </div>
            <div className="reward">
              <strong>£20</strong>
              <b>member credit</b>
              <span>when your friend joins a £49 or £59 membership</span>
            </div>
          </div>
          <p className="fine-print">
            <Coins strokeWidth={1.5} aria-hidden="true" />
            Credits can be used towards your next class, membership renewal or selected events. Credits
            cannot be exchanged for cash.
          </p>
        </article>

        {showFoundingGift ? (
          <article className="promo promo--gift" data-founding-gift>
            <div className="promo-top">
              <span className="benefit-icon" aria-hidden="true">
                <Gift strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">FOUNDING MEMBER GIFT</p>
                <h3>Your dance journey starts here.</h3>
              </div>
            </div>
            <p>
              Join between 1 September and 31 October and receive a complimentary CHDPAS dance bag or
              dance shoes.
            </p>
            <p className="offer-end">Offer ends 31 October 2026.</p>
          </article>
        ) : null}
      </div>

      <div className="styles-strip">
        <p>Membership covers our classes in</p>
        <ul>
          {STYLE_ITEMS.map(({ label, icon: Icon }) => (
            <li key={label}>
              <Icon strokeWidth={1.4} aria-hidden="true" />
              {label}
            </li>
          ))}
          <li>and more…</li>
        </ul>
      </div>

      <p className="membership-note">
        Membership prices are per month. Ask us about card validity and eligible classes before joining.
      </p>
    </section>
  );
}
