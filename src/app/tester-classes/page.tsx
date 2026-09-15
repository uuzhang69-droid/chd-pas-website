import type { Metadata } from "next";
import { TesterClassesClient } from "@/components/tester-classes/TesterClassesClient";
import { fetchTesterClasses } from "@/lib/tester-classes/airtable";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "Browse active classes at County Hall Dance Centre and enrol via our secure booking system.",
};

export const revalidate = 300;

export default async function TesterClassesPage() {
  const classes = await fetchTesterClasses();

  return <TesterClassesClient classes={classes} />;
}
