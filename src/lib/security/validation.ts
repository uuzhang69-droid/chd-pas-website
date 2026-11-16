/** Removes control characters. Newlines are kept only when `multiline` is true. */
export function cleanText(
    value: unknown,
    max: number,
    multiline = false,
): string {
    if (typeof value !== "string") return "";
    const stripped = multiline
        ? value
              .replace(/\r\n?/g, "\n")
              .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
        : value.replace(/[\u0000-\u001F\u007F]/g, " ");
    return stripped.trim().slice(0, max);
}

const EMAIL =
    /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function isValidEmail(value: string): boolean {
    return value.length <= 254 && EMAIL.test(value);
}

export function normaliseEmail(value: string): string {
    return value.trim().toLowerCase();
}

export function countLinks(value: string): number {
    return (value.match(/https?:\/\/|www\./gi) ?? []).length;
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Spreadsheet formula injection guard for CSV cells. */
export function csvCell(value: unknown): string {
    let text = value === null || value === undefined ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
