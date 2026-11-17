
import { defineField, defineType } from "sanity";

export const teacher = defineType({
    name: "teacher",
    title: "Teachers",
    type: "document",

    fields: [
        defineField({
            name: "name",
            title: "Teacher's name",
            type: "string",
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "name",
            },
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "photo",
            title: "Teacher photo",
            type: "image",
            options: {
                hotspot: true,
            },
            fields: [
                defineField({
                    name: "alt",
                    title: "Alternative text",
                    type: "string",
                    description: "Describe the photo for accessibility.",
                }),
            ],
        }),

        defineField({
            name: "danceStyles",
            title: "Dance styles",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "danceStyle" }],
                },
            ],
            description: "Select all styles this teacher teaches.",
        }),

        defineField({
            name: "bio",
            title: "About teacher",
            type: "text",
            rows: 8,
        }),

        defineField({
            name: "displayOrder",
            title: "Display order",
            type: "number",
            description: "Lower numbers appear first on the website.",
            initialValue: 100,
        }),

        defineField({
            name: "isActive",
            title: "Active teacher",
            type: "boolean",
            description: "Turn off to hide this teacher from the public teachers page.",
            initialValue: true,
        }),
    ],

    preview: {
        select: {
            title: "name",
            media: "photo",
            styles: "danceStyles",
            active: "isActive",
        },

        prepare({ title, media, styles, active }) {
            const styleCount = Array.isArray(styles)
                ? styles.length
                : 0;

            return {
                title: title || "Unnamed teacher",
                subtitle: `${styleCount} dance style(s)${active === false ? " · Inactive" : ""}`,
                media,
            };
        },
    },
});
