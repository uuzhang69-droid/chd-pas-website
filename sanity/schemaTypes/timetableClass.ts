import { defineField, defineType } from "sanity";

const STYLE_OPTIONS = [
  { title: "Contemporary", value: "contemporary" },
  { title: "Chinese Dance", value: "chinese-dance" },
  { title: "Tango", value: "tango" },
  { title: "Yoga", value: "yoga" },
  { title: "Tai Chi", value: "tai-chi" },
];

const SLOT_OPTIONS = [
  { title: "10:00 – 11:00", value: "slot-1" },
  { title: "11:15 – 12:15", value: "slot-2" },
  { title: "12:30 – 13:30", value: "slot-3" },
  { title: "17:00 – 18:00", value: "slot-4" },
  { title: "18:15 – 19:15", value: "slot-5" },
  { title: "19:30 – 20:30", value: "slot-6" },
];

const DAY_OPTIONS = [
  { title: "Monday", value: 0 },
  { title: "Tuesday", value: 1 },
  { title: "Wednesday", value: 2 },
  { title: "Thursday", value: 3 },
  { title: "Friday", value: 4 },
  { title: "Saturday", value: 5 },
  { title: "Sunday", value: 6 },
];

export const timetableClass = defineType({
  name: "timetableClass",
  title: "Timetable class",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Class title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      options: { list: STYLE_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dayOfWeek",
      title: "Day of week",
      description: "Repeats every week on this day.",
      type: "number",
      options: { list: DAY_OPTIONS },
      validation: (rule) => rule.required().min(0).max(6),
    }),
    defineField({
      name: "slotId",
      title: "Time slot",
      type: "string",
      options: { list: SLOT_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instructor",
      title: "Instructor",
      type: "string",
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
    }),
    defineField({
      name: "cancelledDates",
      title: "Cancelled dates",
      description: "Specific calendar dates when this weekly class does not run.",
      type: "array",
      of: [{ type: "date" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      day: "dayOfWeek",
      slot: "slotId",
    },
    prepare({ title, day, slot }) {
      const dayLabel = DAY_OPTIONS.find((option) => option.value === day)?.title ?? "Day";
      const slotLabel = SLOT_OPTIONS.find((option) => option.value === slot)?.title ?? slot;
      return {
        title,
        subtitle: `${dayLabel} · ${slotLabel}`,
      };
    },
  },
});
