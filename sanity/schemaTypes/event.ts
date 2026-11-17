
import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Events & Workshops",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Event title",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "summary",
      title: "Short description",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "description",
      title: "Full description",
      type: "array",
      of: [{ type: "block" }],
    }),

    defineField({
      name: "image",
      title: "Featured image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "category",
      title: "Event category",
      type: "string",
      options: {
        list: [
          { title: "Performance", value: "performance" },
          { title: "Workshop", value: "workshop" },
          { title: "Festival", value: "festival" },
          { title: "Concert", value: "concert" },
          { title: "Social Dance", value: "social" },
          { title: "Exhibition", value: "exhibition" },
          { title: "Other", value: "other" },
        ],
      },
    }),

    defineField({
        name: "sessions",
        title: "Dates & sessions",
        type: "array",
        of: [
            {
                type: "eventSession",
            },
        ],
        description:
            "Add one or more dates for this event or workshop.",
    }),

    defineField({
      name: "relationship",
      title: "Our relationship",
      type: "string",
      options: {
        list: [
          { title: "Organised by us", value: "organised" },
          { title: "Co-organised", value: "co-organised" },
          { title: "Hosted at our venue", value: "hosted" },
          { title: "Promoted by us", value: "promoted" },
          { title: "External event", value: "external" },
        ],
      },
    }),

    defineField({
      name: "organiser",
      title: "Organiser",
      type: "string",
    }),

    defineField({
      name: "partners",
      title: "Partners / collaborators",
      type: "array",
      of: [{ type: "string" }],
    }),

    defineField({
      name: "showInWhatsOn",
      title: "Show in What's On",
      type: "boolean",
      initialValue: true,
    }),

    defineField({
      name: "calendarVisible",
      title: "Show in Calendar by default",
      type: "boolean",
      initialValue: false,
      description:
        "Individual sessions may override this setting.",
    }),

    defineField({
      name: "bookingUrl",
      title: "Booking URL",
      type: "url",
    }),

    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
    }),

    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "image",
    },
  },
});
