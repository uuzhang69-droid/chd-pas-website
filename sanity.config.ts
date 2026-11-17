
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { colorInput } from "@sanity/color-input";


const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "chd-pas-website",
  title: "County Hall Dance | Content Studio",
  basePath: "/studio",
  projectId,
  dataset,

plugins: [
  structureTool({
    structure: (S) =>
      S.list()
        .title("Content Management")
        .items([
          S.documentTypeListItem("timetableClass")
            .title("Regular Classes"),

          S.documentTypeListItem("oneOffClass")
            .title("One Off Class"),

          S.documentTypeListItem("classException")
            .title("Class Exception"),

          S.documentTypeListItem("danceStyle")
            .title("Dance Styles"),

          S.documentTypeListItem("teacher")
            .title("Teacher"),

          S.documentTypeListItem("event")
            .title("Events & Workshops"),

          S.documentTypeListItem("venue")
            .title("Venues & Spaces"),



        ]),
  }),
  colorInput(),
],

  schema: {
    types: schemaTypes,
  },
});
