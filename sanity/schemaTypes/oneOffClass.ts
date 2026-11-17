
import { defineField, defineType } from "sanity";
import { TimeInput } from "../components/TimeInput";

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const oneOffClass = defineType({
    name: "oneOffClass",
    title: "One-off Classes",
    type: "document",

    fields: [
        defineField({
            name: "title",
            title: "Internal name",
            type: "string",
            description:
                "For staff use only. Example: September Tai Chi Trial.",
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "displayName",
            title: "Display name",
            type: "string",
            description:
                "Public name shown on the website. Example: Tai Chi.",
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "danceStyle",
            title: "Dance style",
            type: "reference",
            to: [{ type: "danceStyle" }],
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "date",
            title: "Class date",
            type: "date",
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "startTime",
            title: "Start time",
            type: "string",
            components: {
                input: TimeInput,
            },
            validation: (rule) =>
                rule.required().regex(TIME_PATTERN, {
                    name: "24-hour time",
                }),
        }),

        defineField({
            name: "endTime",
            title: "End time",
            type: "string",
            components: {
                input: TimeInput,
            },
            validation: (rule) =>
                rule.required().regex(TIME_PATTERN, {
                    name: "24-hour time",
                }),
        }),

        defineField({
            name: "teachers",
            title: "Teachers",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "teacher" }],
                },
            ],
            description:
                "Select one or more teachers. Optional.",
        }),

        defineField({
            name: "venue",
            title: "Venue",
            type: "reference",
            to: [{ type: "venue" }],
        }),

        defineField({
            name: "status",
            title: "Class status",
            type: "string",
            options: {
                list: [
                    { title: "Confirmed", value: "confirmed" },
                    { title: "Tentative", value: "tentative" },
                    { title: "Cancelled", value: "cancelled" },
                    { title: "Postponed", value: "postponed" },
                ],
            },
            initialValue: "confirmed",
        }),

        defineField({
            name: "publicNotice",
            title: "Public notice",
            type: "text",
            rows: 3,
            description:
                "Optional notice shown to visitors, such as a cancellation reason.",
        }),

        defineField({
            name: "bookingUrl",
            title: "Booking URL",
            type: "url",
        }),

        defineField({
            name: "calendarVisible",
            title: "Show in Calendar",
            type: "boolean",
            initialValue: true,
        }),

        defineField({
            name: "internalNotes",
            title: "Internal notes",
            type: "text",
            rows: 3,
            description:
                "Staff-only information. Never show this on the public website.",
        }),
    ],

    preview: {
        select: {
            title: "title",
            displayName: "displayName",
            date: "date",
            start: "startTime",
            end: "endTime",
            status: "status",
        },

        prepare({ title, displayName, date, start, end, status }) {
            const timeLabel =
                start && end ? `${start}–${end}` : "Time not set";

            return {
                title: title || displayName || "Untitled class",
                subtitle: [
                    date,
                    timeLabel,
                    status === "cancelled" ? "Cancelled" : null,
                ].filter(Boolean).join(" · "),
            };
        },
    },
});
