import { defineField, defineType } from "sanity";

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
  { title: "8:00 – 9:30 pm", value: "slot-2000-2130" },
  { title: "8:00 – 11:00 pm", value: "slot-2000-2300" },
  { title: "8:30 – 9:30 pm", value: "slot-2030-2130" },
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
