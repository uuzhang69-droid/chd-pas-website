/**
 * Imports edited content/website-copy.csv into src/content/copy.ts
 *
 * Run: npm run content:import
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const csvPath = join(root, "content/website-copy.csv");
const copyPath = join(root, "src/content/copy.ts");

function parseCsv(content: string): Array<{ id: string; location: string; text: string }> {
  const rows: Array<{ id: string; location: string; text: string }> = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  const header = lines.shift();
  if (header !== "id,location,text") {
    throw new Error('Expected header row: id,location,text');
  }

  for (const line of lines) {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === "," && fields.length < 2) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current);

    if (fields.length < 3) {
      throw new Error(`Invalid CSV row (expected 3 columns): ${line}`);
    }

    const [id, location, ...textParts] = fields;
    rows.push({ id, location, text: textParts.join(",") });
  }

  return rows;
}

const csv = readFileSync(csvPath, "utf8");
const rows = parseCsv(csv);
const copyObject = Object.fromEntries(rows.map((row) => [row.id, row.text]));

writeFileSync(
  copyPath,
  `/** Imported from content/website-copy.csv — do not edit by hand; run: npm run content:import */\n\nexport const copy = ${JSON.stringify(copyObject, null, 2)} as const;\n\nexport type CopyId = keyof typeof copy;\n`,
);

console.log(`Imported ${rows.length} strings into src/content/copy.ts`);
