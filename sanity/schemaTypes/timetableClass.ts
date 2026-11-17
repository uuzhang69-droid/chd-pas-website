
import { defineField, defineType } from "sanity";
import { TimeInput } from "../components/TimeInput";


const DAY_OPTIONS = [
    { title: "Monday", value: 0 },
    { title: "Tuesday", value: 1 },
    { title: "Wednesday", value: 2 },
    { title: "Thursday", value: 3 },
    { title: "Friday", value: 4 },
    { title: "Saturday", value: 5 },
    { title: "Sunday", value: 6 },
];

const STYLE_OPTIONS = [
    { title: "Contemporary", value: "contemporary" },
    { title: "Chinese Dance", value: "chinese-dance" },
    { title: "Tango", value: "tango" },
    { title: "Yoga", value: "yoga" },
    { title: "Tai Chi", value: "tai-chi" },
];

const SLOT_OPTIONS = [
    { title: "10:30 am – 12:00 pm", value: "slot-1030-1200" },
    { title: "12:30 – 1:20 pm", value: "slot-1230-1320" },
    { title: "3:30 – 5:00 pm", value: "slot-1530-1700" },
    { title: "3:30 – 5:30 pm", value: "slot-1530-1730" },
    { title: "6:30 – 7:20 pm", value: "slot-1830-1920" },
    { title: "6:30 – 7:30 pm", value: "slot-1830-1930" },
    { title: "6:30 – 8:00 pm", value: "slot-1830-2000" },
    { title: "7:00 – 8:00 pm", value: "slot-1900-2000" },
    { title: "7:30 – 8:30 pm", value: "slot-1930-2030" },
    { title: "7:30 – 8:40 pm", value: "slot-1930-2040" },
    { title: "7:40 – 8:40 pm", value: "slot-1940-2040" },
    { title: "8:00 – 9:30 pm", value: "slot-2000-2130" },
    { title: "8:00 – 11:00 pm", value: "slot-2000-2300" },
    { title: "8:30 – 9:30 pm", value: "slot-2030-2130" },
];

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const timetableClass = defineType({
    name: "timetableClass",
    title: "Regular Classes",
    type: "document",

    fields: [
        defineField({
            name: "title",
            title: "Class title",
            type: "string",
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
            name: "dayOfWeek",
            title: "Day of week",
            description: "Repeats every week on this day.",
            type: "number",
            options: {
                list: DAY_OPTIONS,
            },
            validation: (rule) =>
                rule.required().min(0).max(6),
        }),

        defineField({
            name: "startTime",
            title: "Start time",
            type: "string",
            components: {
                input: TimeInput,
            },
            description: "24-hour format, e.g. 18:30.",
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
            description: "24-hour format, e.g. 20:00.",
            validation: (rule) =>
                rule.required().regex(TIME_PATTERN, {
                    name: "24-hour time",
                }),
        }),

        defineField({
            name: "startDate",
            title: "Effective from",
            type: "date",
            description: "First date this weekly class is scheduled.",
        }),

        defineField({
            name: "endDate",
            title: "Effective until",
            type: "date",
            description: "Leave empty if the class continues indefinitely.",
            validation: (rule) =>
                rule.custom((value, context) => {
                    const parent = context.parent as {
                        startDate?: string;
                    } | undefined;

                    if (
                        value &&
                        parent?.startDate &&
                        value < parent.startDate
                    ) {
                        return "End date must not be before start date.";
                    }

                    return true;
                }),
        }),

        defineField({
            name: "instructor",
            title: "Legacy instructor",
            type: "string",
            hidden: true,
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
        }),

        defineField({
            name: "level",
            title: "Level",
            type: "string",
        }),

        defineField({
            name: "cancelledDates",
            title: "Cancelled dates",
            description: "Specific dates when this class does not run.",
            type: "array",
            of: [{ type: "date" }],
        }),

        // Legacy fields retained for data migration.
        defineField({
            name: "style",
            title: "Legacy style",
            type: "string",
            options: {
                list: STYLE_OPTIONS,
            },
            hidden: true,
        }),

        defineField({
            name: "slotId",
            title: "Legacy time slot",
            type: "string",
            options: {
                list: SLOT_OPTIONS,
            },
            hidden: true,
        }),
    ],

    preview: {
        select: {
            title: "title",
            day: "dayOfWeek",
            start: "startTime",
            end: "endTime",
            legacySlot: "slotId",
        },

        prepare({ title, day, start, end, legacySlot }) {
            const dayLabel =
                DAY_OPTIONS.find((option) => option.value === day)?.title ??
                "Day";

            const legacyTime =
                SLOT_OPTIONS.find((option) => option.value === legacySlot)
                    ?.title ?? "";

            const timeLabel =
                start && end
                    ? `${start}–${end}`
                    : legacyTime || "Time not set";

            return {
                title: title || "Untitled class",
                subtitle: `${dayLabel} · ${timeLabel}`,
            };
        },
    },
});
