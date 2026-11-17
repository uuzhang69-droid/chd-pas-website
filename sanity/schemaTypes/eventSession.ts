
import { defineField, defineType } from "sanity";
import { TimeInput } from "../components/TimeInput";

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const eventSession = defineType({
    name: "eventSession",
    title: "Event session",
    type: "object",

    fields: [
        defineField({
            name: "title",
            title: "Session title",
            type: "string",
            description: "Optional. Uses the event title if empty.",
        }),

        defineField({
            name: "date",
            title: "Date",
            type: "date",
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "allDay",
            title: "All-day event",
            type: "boolean",
            initialValue: false,
        }),

        defineField({
            name: "startTime",
            title: "Start time",
            type: "string",
            components: {
                input: TimeInput,
            },
            hidden: ({ parent }) => parent?.allDay === true,
            validation: (rule) =>
                rule.regex(TIME_PATTERN, {
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
            hidden: ({ parent }) => parent?.allDay === true,
            validation: (rule) =>
                rule.regex(TIME_PATTERN, {
                    name: "24-hour time",
                }),
        }),

        defineField({
            name: "venue",
            title: "Venue",
            type: "reference",
            to: [{ type: "venue" }],
        }),

        defineField({
            name: "type",
            title: "Session type",
            type: "string",
            options: {
                list: [
                    { title: "Event", value: "event" },
                    { title: "Workshop", value: "workshop" },
                ],
            },
            initialValue: "event",
        }),

        defineField({
            name: "status",
            title: "Status",
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
            name: "calendarVisible",
            title: "Calendar visibility",
            type: "string",
            options: {
                list: [
                    { title: "Use event setting", value: "inherit" },
                    { title: "Show", value: "show" },
                    { title: "Hide", value: "hide" },
                ],
            },
            initialValue: "inherit",
        }),

        defineField({
            name: "bookingUrl",
            title: "Session booking URL",
            type: "url",
            description:
                "Optional. Uses the event booking URL if empty.",
        }),

        defineField({
            name: "description",
            title: "Session description",
            type: "array",
            of: [{ type: "block" }],
        }),

        defineField({
            name: "advanced",
            title: "Advanced settings",
            type: "boolean",
            initialValue: false,
            description:
                "Enable only when this session needs different organiser or privacy settings.",
        }),

        defineField({
            name: "relationship",
            title: "Session relationship",
            type: "string",
            options: {
                list: [
                    { title: "Organised by us", value: "organised" },
                    { title: "Collaboration", value: "collaboration" },
                    { title: "Hosted at our venue", value: "hosted" },
                    { title: "External event", value: "external" },
                ],
            },
            hidden: ({ parent }) => parent?.advanced !== true,
        }),

        defineField({
            name: "organiser",
            title: "Session organiser",
            type: "string",
            hidden: ({ parent }) => parent?.advanced !== true,
        }),

        defineField({
            name: "private",
            title: "Private session",
            type: "boolean",
            initialValue: false,
            hidden: ({ parent }) => parent?.advanced !== true,
        }),
    ],

    preview: {
        select: {
            title: "title",
            date: "date",
            start: "startTime",
            status: "status",
        },

        prepare({ title, date, start, status }) {
            return {
                title: title || date || "Event session",
                subtitle: [
                    date,
                    start,
                    status === "cancelled" ? "Cancelled" : null,
                ].filter(Boolean).join(" · "),
            };
        },
    },
});
