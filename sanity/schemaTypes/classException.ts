
import { defineField, defineType } from "sanity";
import { TimeInput } from "../components/TimeInput";

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const classException = defineType({
    name: "classException",
    title: "Class Exceptions",
    type: "document",

    fields: [
        defineField({
            name: "regularClass",
            title: "Regular class",
            type: "reference",
            to: [{ type: "timetableClass" }],
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "date",
            title: "Exception date",
            type: "date",
            description: "The specific date affected by this change.",
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "cancelled",
            title: "Class cancelled",
            type: "boolean",
            description: "Turn on if this class will not take place.",
            initialValue: false,
        }),

        defineField({
            name: "substituteTeachers",
            title: "Substitute teachers",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "teacher" }],
                },
            ],
            description:
                "Optional. Replaces the regular teachers on this date.",
            hidden: ({ parent }) => parent?.cancelled === true,
        }),

        defineField({
            name: "startTime",
            title: "New start time",
            type: "string",
            description: "Leave empty to use the regular start time.",
            components: {
                input: TimeInput,
            },
            validation: (rule) =>
                rule.regex(TIME_PATTERN, {
                    name: "24-hour time",
                }),
            hidden: ({ parent }) => parent?.cancelled === true,
        }),

        defineField({
            name: "endTime",
            title: "New end time",
            type: "string",
            description: "Leave empty to use the regular end time.",
            components: {
                input: TimeInput,
            },
            validation: (rule) =>
                rule.regex(TIME_PATTERN, {
                    name: "24-hour time",
                }),
            hidden: ({ parent }) => parent?.cancelled === true,
        }),

        defineField({
            name: "reason",
            title: "Reason / public notice",
            type: "text",
            rows: 3,
            description:
                "Optional explanation to show on the timetable.",
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
            date: "date",
            className: "regularClass.title",
            cancelled: "cancelled",
        },

        prepare({ date, className, cancelled }) {
            return {
                title: className || "Class exception",
                subtitle: `${date || "Date not set"} · ${
                    cancelled ? "Cancelled" : "Schedule change"
                }`,
            };
        },
    },
});
