
import { defineField, defineType } from "sanity";

export const venue = defineType({
  name: "venue",
  title: "Venues & Spaces",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Venue name",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 2,
    }),

    defineField({
      name: "capacity",
      title: "Capacity",
      type: "number",
      validation: (rule) => rule.integer().min(1),
    }),

    defineField({
      name: "isDanceCentreSpace",
      title: "Dance Centre space",
      type: "boolean",
      initialValue: false,
      description:
        "Whether this venue is part of the Dance Centre's bookable spaces.",
    }),

    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 3,
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "address",
    },
  },
});
