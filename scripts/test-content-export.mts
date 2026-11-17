import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";
import { runInNewContext } from "node:vm";
import { replaceClassCopy, replaceClassCsv, replaceContentPath } from "./lib/scoped-content-export.mts";

const read = (path: string) => readFileSync(path, "utf8");
function copyValues(source: string): Record<string, string> {
    const context = { exports: {} as { copy: Record<string, string> } };
    runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
    return context.exports.copy;
}

test("Classes export preserves all unrelated generated content and independent Events references", () => {
    const output = mkdtempSync(join(tmpdir(), "chdc-classes-export-"));
    try {
        execFileSync(process.execPath, [resolve("node_modules/tsx/dist/cli.mjs"), "scripts/extract-copy.mts", "--classes", "--output-dir", output]);
        const oldStructure = read("src/content/site.structure.ts");
        const nextStructure = read(join(output, "src/content/site.structure.ts"));
        assert.equal(replaceContentPath(oldStructure, "siteStructure", ["pages", "classes"], null), replaceContentPath(nextStructure, "siteStructure", ["pages", "classes"], null));
        const before = copyValues(read("src/content/copy.ts"));
        const after = copyValues(read(join(output, "src/content/copy.ts")));
        const unrelated = (values: Record<string, string>) => Object.fromEntries(Object.entries(values).filter(([key]) => !key.startsWith("pages.classes.")));
        assert.deepEqual(unrelated(after), unrelated(before));
        for (const key of Object.keys(before).filter((key) => key.startsWith("pages.classes.") && (key.includes(".instructor.") || key.endsWith(".instructorheading") || key.includes(".hero.image.")))) assert.equal(after[key], before[key], key);
        for (const key of ["pages.classes.styles.yoga.formats.0.summary", "pages.classes.styles.yoga.formatsection.title", "pages.classes.styles.yoga.instructorheading", "pages.classes.styles.yoga.about.image.alt"]) assert(after[key], key);
        assert.equal(replaceClassCsv(read("content/website-copy.csv"), []), replaceClassCsv(read(join(output, "content/website-copy.csv")), []));
        const stable = replaceClassCopy(read(join(output, "src/content/copy.ts")), Object.fromEntries(Object.entries(after).filter(([key]) => key.startsWith("pages.classes."))));
        assert.equal(stable, read(join(output, "src/content/copy.ts")));
    } finally {
        // Only remove the unique temporary directory created by this test.
        assert(output.startsWith(join(tmpdir(), "chdc-classes-export-")));
        rmSync(output, { recursive: true });
    }
});

test("full export keeps independent event objects as module references", () => {
    const output = mkdtempSync(join(tmpdir(), "chdc-full-export-"));
    try {
        execFileSync(process.execPath, [resolve("node_modules/tsx/dist/cli.mjs"), "scripts/extract-copy.mts", "--output-dir", output]);
        const generated = read(join(output, "src/content/site.structure.ts"));
        for (const name of ["anActorsWorkWithAnObjectEvent", "withinOneRoomEvent", "lunchtimeConcertSeriesEvent"]) {
            assert.match(generated, new RegExp(`import \\{ ${name} \\}`));
            assert(generated.slice(generated.indexOf("export const")).includes(name));
        }
        assert(!generated.includes('"@@MODULE:'));
    } finally {
        assert(output.startsWith(join(tmpdir(), "chdc-full-export-")));
        rmSync(output, { recursive: true });
    }
});

test("scoped CSV export leaves quoted multiline unrelated values intact", () => {
    const input = 'id,location,text\r\npages.contact.body,Contact,"line one\nline two"\r\npages.classes.title,Classes,Old\r\n';
    assert.equal(replaceClassCsv(input, ["pages.classes.title,Classes,New"]), input.replace(",Old", ",New"));
});
