import Image from "next/image";
import { formatClassPrice } from "@/lib/tester-classes/airtable";
import type { TesterClass } from "@/lib/tester-classes/types";
import { EnrolIcon } from "@/components/tester-classes/TesterClassesIcons";
import {
    canBookSession,
    sessionStatus,
} from "@/lib/class-calendar/booking-status";
import { serverNow, useNow } from "@/lib/class-calendar/use-now";

function localTime(value: string): string {
    const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(value.trim());
    if (!match) return "";
    const hour = match[3]
        ? (Number(match[1]) % 12) + (match[3].toLowerCase() === "pm" ? 12 : 0)
        : Number(match[1]);
    return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

type ClassCardProps = {
    classItem: TesterClass;
};

export function ClassCard({ classItem }: ClassCardProps) {
    const now = useNow();
    const timing = {
        date: classItem.sessionDate ?? "",
        start: localTime(classItem.startTime),
        end: localTime(classItem.endTime),
    };
    const bookable = now !== null && canBookSession(timing, now);
    const ended = now !== null && sessionStatus(timing, now) === "ended";
    const timeRange = `${classItem.startTime} – ${classItem.endTime}`;

    return (
        <article className="border-b border-taupe/30 py-5 last:border-b-0 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative mx-auto w-full max-w-[280px] shrink-0 sm:mx-0 sm:w-[160px]">
                    <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-blush/40">
                        <Image
                            src={classItem.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 280px, 160px"
                        />
                    </div>
                    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-small font-semibold text-charcoal shadow-sm">
                        {classItem.day}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-small text-taupe">{timeRange}</p>
                    <h2 className="mt-1 font-[family-name:var(--font-montserrat)] text-lg font-semibold text-charcoal sm:text-xl">
                        {classItem.title}
                    </h2>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-small text-charcoal/75">
                        <li className="flex items-center gap-1.5">
                            <span aria-hidden>📅</span>
                            <span>{classItem.dateRange}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span aria-hidden>👤</span>
                            <span>{classItem.ageGroup}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span aria-hidden>📍</span>
                            <span>{classItem.location}</span>
                        </li>
                    </ul>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-3">
                    <p className="text-body text-charcoal">
                        <span className="font-semibold">
                            {formatClassPrice(classItem.price)}
                        </span>
                        <span className="text-taupe"> / lesson</span>
                    </p>
                    {bookable || !classItem.sessionDate ? (
                        <a
                            href={classItem.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 rounded-xl bg-burgundy px-3 py-3 text-white shadow-sm transition-colors hover:bg-burgundy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                            aria-label={
                                bookable
                                    ? `Enrol in ${classItem.title}`
                                    : "Check upcoming dates in ClassManager"
                            }
                            onClick={(event) => {
                                const instant = serverNow();
                                if (
                                    classItem.sessionDate &&
                                    (!instant ||
                                        !canBookSession(timing, instant))
                                )
                                    event.preventDefault();
                            }}
                        >
                            <EnrolIcon className="h-5 w-5" />
                            <span className="hidden font-[family-name:var(--font-montserrat)] text-small font-medium sm:inline">
                                {bookable ? "Enrol" : "Check upcoming dates"}
                            </span>
                        </a>
                    ) : (
                        <span className="text-small text-charcoal/70">
                            {ended ? "Ended" : "Booking unavailable"}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
