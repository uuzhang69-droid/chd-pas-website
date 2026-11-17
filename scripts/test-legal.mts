import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CONSENT_TEXT } from "../src/lib/newsletter/consent";
import { PUBLISHED_LEGAL_PAGES, isLegalPagePublished } from "../src/lib/legal-pages";

const page = readFileSync("src/app/privacy/page.tsx", "utf8");
const source = readFileSync("src/content/site.source.ts", "utf8");
const placeholders = (page.match(/<ToConfirm>/g) ?? []).length;

test("the privacy policy cannot be published while any item is still to be confirmed", () => {
    if (isLegalPagePublished("/privacy")) assert.equal(placeholders, 0, "remove every [To be confirmed] item, or take /privacy out of PUBLISHED_LEGAL_PAGES");
    else assert.ok(placeholders > 0, "an unpublished draft should still show what needs confirming");
});

test("until it is approved, the draft is labelled, kept out of search, and not linked or listed", () => {
    assert.deepEqual([...PUBLISHED_LEGAL_PAGES], []);
    assert.match(page, /robots: \{ index: false, follow: true \}/);
    assert.match(page, /!published && \(/);
    assert.ok(readFileSync("src/app/sitemap.ts", "utf8").includes('isLegalPagePublished("/privacy")'), "the sitemap lists /privacy only when published");
});

test("the footer link label, the consent wording and the policy use the same name and promises", () => {
    assert.match(source, /label: "Privacy Policy", href: "\/privacy"/);
    assert.ok(CONSENT_TEXT.includes("Privacy Policy"));
    assert.match(page, /CONSENT_TEXT/);
    assert.match(page, /unsubscribe/i);
    assert.match(page, /confirm/i);
});

test("the policy asserts no legal fact the organisation has not given", () => {
    // Registration numbers, company numbers and compliance claims must come from the organisation, never be invented here.
    assert.doesNotMatch(page, /registered (in|company)|company number|ICO registration number:\s*[A-Z]{1,2}\d/i);
    assert.doesNotMatch(page, /GDPR[- ]compliant|fully compliant|approved by/i);
    assert.doesNotMatch(page, /County Hall Arts/);
});
