import assert from "node:assert/strict";
import { test } from "node:test";
import { isNewsletterSignupLive, parseStrictFlag } from "../src/lib/features";

test("public newsletter sign-up opens only for the exact word true", () => {
    for (const value of ["true", "TRUE", "True", "  true  "]) assert.equal(parseStrictFlag(value), true, value);
});

test("a missing, empty, misspelt or numeric value keeps sign-up closed", () => {
    for (const value of [undefined, "", " ", "false", "FALSE", "0", "1", "yes", "on", "ture", "true;", "truee", "enabled", "null", "undefined"])
        assert.equal(parseStrictFlag(value), false, String(value));
});

test("the setting is read from NEWSLETTER_ONLINE_SIGNUP_LIVE only", () => {
    assert.equal(isNewsletterSignupLive({}), false);
    assert.equal(isNewsletterSignupLive({ NEXT_PUBLIC_NEWSLETTER_ONLINE_SIGNUP_LIVE: "true" }), false);
    assert.equal(isNewsletterSignupLive({ NEWSLETTER_ONLINE_SIGNUP_LIVE: "true" }), true);
});
