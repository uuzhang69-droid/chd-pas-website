import { buildBookingPrefillFromSearchParams } from "@/lib/timetable/booking-link";

type ContactSearchParams = {
  subject?: string;
  message?: string;
  about?: string;
  course?: string;
  slot?: string;
  date?: string;
  weekday?: string;
  day?: string;
};

function subjectFromAbout(about: string): string {
  switch (about) {
    case "classes-booking":
      return "classes";
    case "membership-booking":
      return "membership";
    case "studio-hire":
    case "venue-hire":
      return "venue-hire";
    default:
      return "";
  }
}

/** Accepts "venue-hire" as well as "Venue hire" or "Venue%20hire". */
function normaliseSubject(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function contactPrefillFromSearchParams(params: ContactSearchParams): {
  defaultSubject: string;
  defaultMessage: string;
} {
  const bookingPrefill = buildBookingPrefillFromSearchParams(params);

  const defaultSubject =
    normaliseSubject(params.subject) ??
    (bookingPrefill.defaultAbout ? subjectFromAbout(bookingPrefill.defaultAbout) : "") ??
    subjectFromAbout(params.about ?? "");

  const defaultMessage = params.message ?? bookingPrefill.defaultMessage;

  return { defaultSubject, defaultMessage };
}
