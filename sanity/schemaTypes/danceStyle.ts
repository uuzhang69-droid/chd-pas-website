import { defineField, defineType } from "sanity";

export const danceStyle = defineType({
    name: "danceStyle",
    title: "Dance Styles",
    type: "document",

    fields: [
        defineField({
            name: "name",
            title: "Style name",
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
            name: "backgroundColor",
            title: "Background colour",
            type: "color",
            options: {
                disableAlpha: true,
            },
            validation: (rule) => rule.required(),
        }),

        defineField({
            name: "accentColor",
            title: "Accent colour",
            type: "color",
            options: {
                disableAlpha: true,
            },
            validation: (rule) => rule.required(),
        }),
        
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 4,
        }),
    ],

    preview: {
        select: {
            title: "name",
            subtitle: "slug.current",
        },
    },
});