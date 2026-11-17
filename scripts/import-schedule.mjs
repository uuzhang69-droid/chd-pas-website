
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath = resolve(process.cwd(), "public/schedule.json");

const schedule = JSON.parse(
    readFileSync(filePath, "utf8")
);

const regularClasses = schedule.classes ?? [];
const datedClasses = schedule.datedClasses ?? [];

const oneOffClasses = datedClasses.filter(
    (item) => item.type !== "workshop" && item.type !== "event"
);

const workshops = datedClasses.filter(
    (item) => item.type === "workshop"
);

const events = datedClasses.filter(
    (item) => item.type === "event"
);

console.log("\n=== SANITY IMPORT: DRY RUN ===\n");

console.log("Regular Classes:", regularClasses.length);
console.log("One-off Classes:", oneOffClasses.length);
console.log("Workshops:", workshops.length);
console.log("Events:", events.length);

const styles = [
    ...new Set(
        [...regularClasses, ...datedClasses].map(
            (item) => item.style
        )
    ),
].filter(Boolean);

console.log("\nDance Styles:");
styles.forEach((style) => console.log(`  - ${style}`));

console.log("\nMissing IDs:");

[...regularClasses, ...datedClasses]
    .filter((item) => !item.id)
    .forEach((item) => {
        console.log(
            `  - ${item.name} (${item.date ?? item.startDate})`
        );
    });

console.log("\nNo changes have been made to Sanity.");
