export type MembershipTierId = "try" | "move" | "connect";

/** 1 Nov 2026 00:00 London (= UTC on that date after BST ends). */
export const FOUNDING_GIFT_END_MS = new Date("2026-11-01T00:00:00Z").getTime();

export function isFoundingGiftActive(now = Date.now()): boolean {
  return now < FOUNDING_GIFT_END_MS;
}

const FOUNDING_GIFT_LINE =
  "• September–October founding gift: complimentary CHDPAS dance bag or dance shoes (if I join before 31 October 2026)";

function membershipEnquiryMessage(tier: MembershipTierId, includeFoundingGift: boolean): string {
  const lines = ["Hello,", ""];

  if (tier === "try") {
    lines.push(
      "I would like to join the Try membership (£29 per month).",
      "",
      "From your website, I understand Try includes:",
      "• One complimentary taster class (any style)",
      "• 5% off regular classes",
      "• 5% off merchandise",
    );
  } else if (tier === "move") {
    lines.push(
      "I would like to join the Move membership (£49 per month).",
      "",
      "From your website, I understand Move includes:",
      "• Two complimentary taster classes (different disciplines)",
      "• 5% off regular classes",
      "• Free access to all regular community events",
      "• Free access to selected masterclasses",
    );
    if (includeFoundingGift) lines.push(FOUNDING_GIFT_LINE);
  } else {
    lines.push(
      "I would like to join the Connect membership (£59 per month).",
      "",
      "From your website, I understand Connect includes:",
      "• Three complimentary taster classes (one may be gifted to a friend)",
      "• 5% off regular classes",
      "• Free access to all regular community events",
      "• Free access to selected masterclasses",
    );
    if (includeFoundingGift) lines.push(FOUNDING_GIFT_LINE);
  }

  lines.push(
    "",
    "Please let me know card validity, eligible classes, and the next steps to sign up.",
    "",
    "Thank you.",
  );

  return lines.join("\n");
}

export function buildMembershipContactHref(
  tier: MembershipTierId,
  options?: { includeFoundingGift?: boolean },
): string {
  const includeFoundingGift =
    options?.includeFoundingGift ?? (tier !== "try" && isFoundingGiftActive());
  const params = new URLSearchParams({
    subject: "membership",
    message: membershipEnquiryMessage(tier, includeFoundingGift),
  });
  return `/contact?${params.toString()}`;
}

export const MEMBERSHIP_TIER_CONTACT_HREF = {
  try: buildMembershipContactHref("try"),
  move: buildMembershipContactHref("move"),
  connect: buildMembershipContactHref("connect"),
} as const;

export const REFER_A_FRIEND_MAILTO =
  "mailto:info@countyhalldancecentre.com?subject=Refer%20a%20friend";
