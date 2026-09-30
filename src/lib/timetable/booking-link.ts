type TimetableBookingTarget = {
  title: string;
  timeLabel: string;
  date: string;
};

type TimetableBookingSearchParams = {
  about?: string;
  course?: string;
  slot?: string;
  date?: string;
  weekday?: string;
  day?: string;
  message?: string;
};

export function buildTimetableBookingHref(
  placed: TimetableBookingTarget,
  weekday: string,
  dayLabel: string,
): string {
  const params = new URLSearchParams({
    about: "classes-booking",
    course: placed.title,
    slot: placed.timeLabel,
    date: placed.date,
    weekday,
    day: dayLabel,
  });
  return `/booking?${params.toString()}`;
}

export function buildBookingPrefillFromSearchParams(params: TimetableBookingSearchParams): {
  defaultAbout: string;
  defaultMessage: string;
} {
  const defaultAbout = params.about ?? "";

  if (params.message) {
    return { defaultAbout, defaultMessage: params.message };
  }

  if (!params.course || !params.slot) {
    return { defaultAbout, defaultMessage: "" };
  }

  const weekday = params.weekday ?? "";
  const timeSlot = weekday ? `${weekday}, ${params.slot}` : params.slot;

  return {
    defaultAbout: defaultAbout || "classes-booking",
    defaultMessage: `Course: ${params.course}\nTime slot: ${timeSlot}`,
  };
}
