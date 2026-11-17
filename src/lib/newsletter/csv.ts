import { csvCell } from "../security/validation";
import type { Subscriber } from "./store";

/**
 * Whether an address can be treated as a confirmed marketing recipient.
 * - "verified": the person confirmed ownership of the address (status active WITH a confirmation time);
 * - "unverified": the address was only typed into the sign-up form (pending), or is marked active without proof of confirmation;
 * - "unsubscribed": the person opted out.
 * Only "verified" may ever be mailed.
 */
export type Verification = "verified" | "unverified" | "unsubscribed";

export function verificationOf(row: Pick<Subscriber, "status" | "confirmedAt">): Verification {
    if (row.status === "unsubscribed") return "unsubscribed";
    return row.status === "active" && row.confirmedAt ? "verified" : "unverified";
}

const MARKETING_USE: Record<Verification, string> = {
    verified: "ok_to_mail",
    unverified: "DO_NOT_MAIL_unverified",
    unsubscribed: "DO_NOT_MAIL_unsubscribed",
};

const COLUMNS: [string, (row: Subscriber) => unknown][] = [
    ["email", (row) => row.email],
    ["verification", (row) => verificationOf(row)],
    ["marketing_use", (row) => MARKETING_USE[verificationOf(row)]],
    ["status", (row) => row.status],
    ["source", (row) => row.source],
    ["source_page", (row) => row.sourcePath],
    ["consent_text_version", (row) => row.consentTextVersion],
    ["consent_given_at", (row) => row.consentGivenAt],
    ["confirmed_at", (row) => row.confirmedAt],
    ["unsubscribed_at", (row) => row.unsubscribedAt],
    ["created_at", (row) => row.createdAt],
];

/**
 * CSV for spreadsheets. Cells that would be read as formulas are neutralised, and no tokens or
 * internal ids are included. The leading BOM keeps accented characters correct in Excel.
 */
export function subscribersToCsv(rows: Subscriber[]): string {
    const lines = [COLUMNS.map(([name]) => name).join(",")];
    for (const row of rows)
        lines.push(COLUMNS.map(([, read]) => csvCell(read(row))).join(","));
    return `\uFEFF${lines.join("\r\n")}\r\n`;
}

/**
 * The two exports, kept apart on purpose:
 * - "verified": ONLY addresses that confirmed ownership. This is the one to use for sending news.
 * - "all": every request, unverified ones included. Each row says "verification" and "marketing_use", and the file name
 *   says so too, so it cannot be mistaken for a mailing list.
 */
export type ExportAudience = "verified" | "all";

export function buildExport(audience: ExportAudience, rows: Subscriber[], day: string): { csv: string; filename: string } {
    if (audience === "verified") {
        const verified = rows.filter((row) => verificationOf(row) === "verified");
        return { csv: subscribersToCsv(verified), filename: `newsletter-verified-recipients-${day}.csv` };
    }
    return { csv: subscribersToCsv(rows), filename: `newsletter-all-requests-INCLUDING-UNVERIFIED-${day}.csv` };
}
