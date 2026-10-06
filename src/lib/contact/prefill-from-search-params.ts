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

export function contactPrefillFromSearchParams(params: ContactSearchParams): {
  defaultSubject: string;
  defaultMessage: string;
} {
  const bookingPrefill = buildBookingPrefillFromSearchParams(params);

  const defaultSubject =
    params.subject ??
    (bookingPrefill.defaultAbout ? subjectFromAbout(bookingPrefill.defaultAbout) : "") ??
    subjectFromAbout(params.about ?? "");

  const defaultMessage = params.message ?? bookingPrefill.defaultMessage;

  return { defaultSubject, defaultMessage };
}
