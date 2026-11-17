import ts from "typescript";

/** Replace only one generated subtree; preserve independent module references and other work verbatim. */
export function replaceContentPath(source: string, variable: string, path: string[], value: unknown): string {
    const file = ts.createSourceFile("content.ts", source, ts.ScriptTarget.Latest, true);
    let root: ts.Expression | undefined;
    const find = (node: ts.Node) => {
        if (ts.isVariableDeclaration(node) && node.name.getText(file) === variable) root = node.initializer;
        ts.forEachChild(node, find);
    };
    find(file);
    if (!root) throw new Error(`Missing ${variable}`);
    while (ts.isAsExpression(root) || ts.isSatisfiesExpression(root)) root = root.expression;
    for (const key of path) {
        if (!ts.isObjectLiteralExpression(root)) throw new Error(`Expected object at ${key}`);
        const property = root.properties.find((entry) => ts.isPropertyAssignment(entry) && entry.name.getText(file).replace(/^['"]|['"]$/g, "") === key);
        if (!property || !ts.isPropertyAssignment(property)) throw new Error(`Missing ${key}`);
        root = property.initializer;
    }
    const start = root.getStart(file);
    const lineStart = source.lastIndexOf("\n", start) + 1;
    const indent = source.slice(lineStart, start).match(/^\s*/)?.[0] ?? "";
    const rendered = JSON.stringify(value, null, 4).replace(/\n/g, `\n${indent}`);
    return source.slice(0, start) + rendered + source.slice(root.end);
}

export function replaceClassCopy(source: string, values: Record<string, string>): string {
    const file = ts.createSourceFile("copy.ts", source, ts.ScriptTarget.Latest, true);
    const edits: Array<{ start: number; end: number; text: string }> = [];
    let insertAt = -1;
    const visit = (node: ts.Node) => {
        if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name) && node.name.text.startsWith("pages.classes.")) {
            const start = node.getFullStart();
            let end = node.end;
            if (source[end] === ",") end++;
            insertAt = insertAt < 0 ? start : insertAt;
            edits.push({ start, end, text: "" });
        }
        ts.forEachChild(node, visit);
    };
    visit(file);
    if (insertAt < 0) throw new Error("No existing Classes copy block");
    edits[0].text = "\n" + Object.entries(values).map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`).join("\n");
    for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
    return source;
}

/** Keep non-Classes CSV records byte-for-byte, including quoted multiline values. */
export function replaceClassCsv(source: string, rows: string[]): string {
    const records: string[] = [];
    let quoted = false;
    let start = 0;
    for (let i = 0; i < source.length; i++) {
        if (source[i] === '"') {
            if (quoted && source[i + 1] === '"') i++;
            else quoted = !quoted;
        } else if (source[i] === "\n" && !quoted) {
            records.push(source.slice(start, i + 1));
            start = i + 1;
        }
    }
    if (quoted) throw new Error("Unclosed CSV quote");
    if (start < source.length) records.push(source.slice(start));
    const first = records.findIndex((record) => record.startsWith("pages.classes."));
    if (first < 0) throw new Error("No existing Classes CSV block");
    const newline = source.includes("\r\n") ? "\r\n" : "\n";
    return records.map((record, index) => index === first ? rows.join(newline) + newline : record.startsWith("pages.classes.") ? "" : record).join("");
}
