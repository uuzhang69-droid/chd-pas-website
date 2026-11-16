import assert from "node:assert/strict";
import { test } from "node:test";
import { siteContent } from "../src/content/site";
import {
    TEST_CONTACT_RECIPIENT,
    getContactRecipient,
    handleContact,
    type ContactDeps,
} from "../src/lib/contact/handle-contact";
import {
    createResendSender,
    type MailMessage,
    type MailResult,
    type MailSender,
} from "../src/lib/mail";
import { MemoryRateLimiter } from "../src/lib/security/rate-limit";
import {
    checkFormTiming,
    getClientIp,
    isSameOrigin,
    readJsonBody,
} from "../src/lib/security/request";
import { createToken, verifyToken } from "../src/lib/security/tokens";
import { verifyTurnstile } from "../src/lib/security/turnstile";
import { csvCell, isValidEmail } from "../src/lib/security/validation";

const NOW = 1_800_000_000_000;
const fields = siteContent.pages.contact.form.fields;

function mailer(result: MailResult = { ok: true, id: "mock-1" }) {
    const sent: MailMessage[] = [];
    const sender: MailSender = {
        async send(message) {
            sent.push(message);
            return result;
        },
    };
    return { sent, sender };
}

function deps(
    overrides: Partial<ContactDeps> = {},
    mail = mailer(),
): { deps: ContactDeps; sent: MailMessage[] } {
    return {
        sent: mail.sent,
        deps: {
            fields,
            recipient: "inbox@example.test",
            mail: {
                sender: mail.sender,
                from: "Website <no-reply@example.test>",
            },
            limiter: new MemoryRateLimiter(() => NOW),
            rateSalt: "salt",
            nowMs: () => NOW,
            ...overrides,
        },
    };
}

const valid = (extra: Record<string, unknown> = {}) => ({
    name: "Test Person",
    email: "person@example.com",
    phone: "",
    subject: "general",
    message: "Hello, I would like to know more about classes.",
    hp: "",
    t: NOW - 10_000,
    ...extra,
});

test("a valid enquiry is sent and success is returned only after the mail service accepts it", async () => {
    const { deps: d, sent } = deps();
    const result = await handleContact(d, { body: valid(), ip: "203.0.113.5" });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, "inbox@example.test");
    assert.equal(sent[0].replyTo, "person@example.com");
    assert.equal(sent[0].from, "Website <no-reply@example.test>");
    assert.match(
        sent[0].subject,
        /^Website enquiry: General enquiry from Test Person$/,
    );
    assert.match(sent[0].text, /Message: Hello, I would like/);
});

test("the visitor's address is only Reply-To, never From, and header injection is stripped", async () => {
    const { deps: d, sent } = deps();
    await handleContact(d, {
        body: valid({ name: "Eve\r\nBcc: victim@example.com" }),
        ip: "203.0.113.6",
    });
    assert.equal(sent.length, 1);
    assert.doesNotMatch(sent[0].subject, /[\r\n]/);
    assert.equal(sent[0].from.includes("person@example.com"), false);
});

test("a refused or unavailable mail service never produces a success response", async () => {
    for (const [result, code] of [
        [{ ok: false, reason: "rejected", status: 403 }, "mail_rejected"],
        [{ ok: false, reason: "unavailable" }, "mail_unavailable"],
    ] as const) {
        const { deps: d } = deps({}, mailer(result));
        const response = await handleContact(d, {
            body: valid(),
            ip: "203.0.113.7",
        });
        assert.equal(response.status, 502);
        assert.equal(response.body.ok, false);
        assert.equal(response.body.code, code);
    }
});

test("an unconfigured service reports not_configured instead of pretending", async () => {
    const noMail = await handleContact(deps({ mail: undefined }).deps, {
        body: valid(),
        ip: "1.1.1.1",
    });
    assert.equal(noMail.status, 503);
    assert.equal(noMail.body.code, "not_configured");
    const noRecipient = await handleContact(
        deps({ recipient: undefined }).deps,
        { body: valid(), ip: "1.1.1.1" },
    );
    assert.equal(noRecipient.status, 503);
});

test("server-side validation reports field errors and sends nothing", async () => {
    const { deps: d, sent } = deps();
    const response = await handleContact(d, {
        body: valid({
            name: "",
            email: "not-an-email",
            subject: "nonsense",
            message: "short",
        }),
        ip: "203.0.113.8",
    });
    assert.equal(response.status, 400);
    const errors = response.body.errors as Record<string, string>;
    assert.deepEqual(Object.keys(errors).sort(), [
        "email",
        "message",
        "name",
        "subject",
    ]);
    assert.equal(sent.length, 0);
});

test("honeypot, too-fast and expired forms are refused", async () => {
    const { deps: d, sent } = deps();
    assert.equal(
        (
            await handleContact(d, {
                body: valid({ hp: "http://spam" }),
                ip: "a",
            })
        ).status,
        403,
    );
    assert.equal(
        (await handleContact(d, { body: valid({ t: NOW - 500 }), ip: "b" }))
            .status,
        403,
    );
    const expired = await handleContact(d, {
        body: valid({ t: NOW - 3 * 3600_000 }),
        ip: "c",
    });
    assert.equal(expired.status, 400);
    assert.equal(expired.body.code, "form_expired");
    assert.equal(sent.length, 0);
    assert.equal(checkFormTiming(NOW - 10_000, NOW), "ok");
});

test("rate limits: four sends per ten minutes per address, three per hour per email", async () => {
    const { deps: d, sent } = deps();
    // Different visitors behind one address use different emails, so only the address limit applies.
    for (let i = 0; i < 4; i++)
        assert.equal(
            (
                await handleContact(d, {
                    body: valid({ email: `person${i}@example.com` }),
                    ip: "198.51.100.1",
                })
            ).status,
            200,
        );
    const fifth = await handleContact(d, {
        body: valid({ email: "person9@example.com" }),
        ip: "198.51.100.1",
    });
    assert.equal(fifth.status, 429);
    assert.equal(typeof fifth.retryAfterSeconds, "number");
    assert.equal(sent.length, 4);
    // Different addresses, same email: the per-email limit stops the fourth message.
    const second = deps();
    let last = 200;
    for (let i = 0; i < 4; i++)
        last = (
            await handleContact(second.deps, {
                body: valid(),
                ip: `198.51.100.${10 + i}`,
            })
        ).status;
    assert.equal(last, 429);
});

test("Turnstile: failure and outage block the send; success lets it through", async () => {
    const make = (
        result: { ok: true } | { ok: false; reason: "failed" | "unavailable" },
    ) => {
        const mail = mailer();
        return {
            mail,
            deps: deps(
                { turnstile: { secret: "s", verify: async () => result } },
                mail,
            ).deps,
        };
    };
    const failed = make({ ok: false, reason: "failed" });
    assert.equal(
        (await handleContact(failed.deps, { body: valid(), ip: "x1" })).status,
        403,
    );
    const down = make({ ok: false, reason: "unavailable" });
    assert.equal(
        (await handleContact(down.deps, { body: valid(), ip: "x2" })).status,
        502,
    );
    assert.equal(failed.mail.sent.length + down.mail.sent.length, 0);
    const ok = make({ ok: true });
    assert.equal(
        (await handleContact(ok.deps, { body: valid(), ip: "x3" })).status,
        200,
    );
});

test("the Turnstile verifier calls Cloudflare and rejects missing tokens", async () => {
    let called = "";
    const fetchOk = (async (url: string) => {
        called = String(url);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }) as unknown as typeof fetch;
    assert.deepEqual(
        await verifyTurnstile(
            "secret",
            "token-token-token",
            "1.2.3.4",
            fetchOk,
        ),
        { ok: true },
    );
    assert.match(
        called,
        /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/,
    );
    const missing = await verifyTurnstile("secret", "", "1.2.3.4", fetchOk);
    assert.equal(missing.ok, false);
    assert.equal(!missing.ok && missing.reason, "failed");
    const fetchFail = (async () =>
        new Response(JSON.stringify({ success: false }), {
            status: 200,
        })) as unknown as typeof fetch;
    const refused = await verifyTurnstile("secret", "token-token-token", "1.2.3.4", fetchFail);
    assert.equal(!refused.ok && refused.reason, "failed");
    const fetchThrow = (async () => {
        throw new Error("network");
    }) as unknown as typeof fetch;
    const outage = await verifyTurnstile("secret", "token-token-token", "1.2.3.4", fetchThrow);
    assert.equal(!outage.ok && outage.reason, "unavailable");
});

test("the Resend adapter maps provider answers without exposing the key", async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const respond = (status: number, body: unknown = {}) =>
        (async (url: string, init: RequestInit) => {
            seen = { url: String(url), init };
            return new Response(JSON.stringify(body), { status });
        }) as unknown as typeof fetch;
    const message: MailMessage = {
        to: "a@example.test",
        from: "f@example.test",
        replyTo: "r@example.test",
        subject: "S",
        text: "T",
    };
    assert.deepEqual(
        await createResendSender("key", respond(200, { id: "abc" })).send(
            message,
        ),
        { ok: true, id: "abc" },
    );
    assert.equal(seen?.url, "https://api.resend.com/emails");
    const sentBody = JSON.parse(String(seen?.init.body));
    assert.equal(sentBody.reply_to, "r@example.test");
    assert.deepEqual(sentBody.to, ["a@example.test"]);
    assert.equal(JSON.stringify(sentBody).includes("key"), false);
    assert.deepEqual(
        await createResendSender("key", respond(403)).send(message),
        { ok: false, reason: "rejected", status: 403 },
    );
    assert.deepEqual(
        await createResendSender("key", respond(429)).send(message),
        { ok: false, reason: "unavailable", status: 429 },
    );
    assert.deepEqual(
        await createResendSender("key", respond(503)).send(message),
        { ok: false, reason: "unavailable", status: 503 },
    );
    const down = (async () => {
        throw new Error("offline");
    }) as unknown as typeof fetch;
    assert.deepEqual(await createResendSender("key", down).send(message), {
        ok: false,
        reason: "unavailable",
    });
});

test("the recipient comes from the environment; the test inbox is never used in production", () => {
    const saved = { ...process.env };
    try {
        const env = process.env as Record<string, string | undefined>;
        delete env.CONTACT_RECIPIENT_EMAIL;
        env.NODE_ENV = "development";
        assert.equal(getContactRecipient(), TEST_CONTACT_RECIPIENT);
        env.NODE_ENV = "production";
        assert.equal(getContactRecipient(), undefined);
        env.CONTACT_RECIPIENT_EMAIL = "someone@example.test";
        assert.equal(getContactRecipient(), "someone@example.test");
    } finally {
        process.env = saved;
    }
});

test("request helpers: origin, client address, JSON body limits", async () => {
    assert.equal(
        isSameOrigin(new Headers({ host: "a.test", origin: "https://a.test" })),
        true,
    );
    assert.equal(
        isSameOrigin(
            new Headers({ host: "a.test", origin: "https://evil.test" }),
        ),
        false,
    );
    assert.equal(isSameOrigin(new Headers({ host: "a.test" })), false);
    assert.equal(
        getClientIp(new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" })),
        "9.9.9.9",
    );
    const json = (body: string, type = "application/json") =>
        new Request("https://a.test/x", {
            method: "POST",
            headers: { "content-type": type },
            body,
        });
    assert.equal((await readJsonBody(json("{}"))).ok, true);
    assert.deepEqual(
        await readJsonBody(json("x=1", "application/x-www-form-urlencoded")),
        { ok: false, status: 415, code: "json_required" },
    );
    assert.deepEqual(await readJsonBody(json("{bad")), {
        ok: false,
        status: 400,
        code: "invalid_json",
    });
    assert.deepEqual(
        await readJsonBody(json(JSON.stringify({ a: "x".repeat(30_000) }))),
        { ok: false, status: 413, code: "too_large" },
    );
});

test("tokens: valid, tampered, wrong purpose and expired", () => {
    const secret = "unit-test-secret-unit-test-secret";
    const token = createToken(secret, "confirm", "id-123", NOW / 1000 + 100);
    assert.deepEqual(verifyToken(secret, "confirm", token, NOW / 1000), {
        ok: true,
        subscriberId: "id-123",
    });
    assert.deepEqual(verifyToken(secret, "unsubscribe", token, NOW / 1000), {
        ok: false,
        reason: "invalid",
    });
    assert.deepEqual(
        verifyToken(
            "other-secret-other-secret-other-",
            "confirm",
            token,
            NOW / 1000,
        ),
        { ok: false, reason: "invalid" },
    );
    assert.deepEqual(verifyToken(secret, "confirm", token, NOW / 1000 + 101), {
        ok: false,
        reason: "expired",
    });
    assert.deepEqual(
        verifyToken(secret, "confirm", token.slice(0, -2) + "xx", NOW / 1000),
        { ok: false, reason: "invalid" },
    );
    assert.deepEqual(verifyToken(secret, "confirm", "garbage", NOW / 1000), {
        ok: false,
        reason: "invalid",
    });
    const forever = createToken(secret, "unsubscribe", "id-9");
    assert.equal(
        verifyToken(secret, "unsubscribe", forever, NOW / 1000 + 10 ** 9).ok,
        true,
    );
});

test("validators: email shape and CSV formula protection", () => {
    assert.equal(isValidEmail("a@example.com"), true);
    for (const bad of [
        "a@b",
        "a b@example.com",
        "@example.com",
        "a@@example.com",
        "a@example.com\nBcc:x@y.z",
    ])
        assert.equal(isValidEmail(bad), false, bad);
    assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
    assert.equal(csvCell("a,b"), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell(null), "");
});

test("Other enquiry is offered, and the visitor's own topic reaches the email", async () => {
    const subject = fields.find((field) => field.name === "subject");
    assert.ok(subject?.options?.some((option) => option.value === "other" && option.label === "Other enquiry"));
    const { deps: d, sent } = deps();
    const result = await handleContact(d, {
        body: valid({ subject: "other", subjectOther: "Press and partnerships" }),
        ip: "203.0.113.20",
    });
    assert.equal(result.status, 200);
    assert.match(sent[0].subject, /Other enquiry - Press and partnerships from Test Person/);
    assert.match(sent[0].text, /Subject: Other enquiry/);
    assert.match(sent[0].text, /Please specify: Press and partnerships/);
    assert.equal(sent[0].replyTo, "person@example.com");
});

test("Other enquiry works without a topic, and the topic is ignored for other subjects", async () => {
    const first = deps();
    const none = await handleContact(first.deps, {
        body: valid({ subject: "other", subjectOther: "" }),
        ip: "203.0.113.21",
    });
    assert.equal(none.status, 200);
    assert.doesNotMatch(first.sent[0].text, /Please specify/);
    assert.match(first.sent[0].subject, /Other enquiry from Test Person/);

    const second = deps();
    const ignored = await handleContact(second.deps, {
        body: valid({ subject: "general", subjectOther: "sneaky topic" }),
        ip: "203.0.113.22",
    });
    assert.equal(ignored.status, 200);
    assert.doesNotMatch(second.sent[0].text, /sneaky topic/);
    assert.doesNotMatch(second.sent[0].subject, /sneaky topic/);
});

test("Other enquiry topic cannot inject mail headers and unknown subjects are still refused", async () => {
    const { deps: d, sent } = deps();
    const result = await handleContact(d, {
        body: valid({ subject: "other", subjectOther: "Hi\r\nBcc: x@y.z" }),
        ip: "203.0.113.23",
    });
    assert.equal(result.status, 200);
    assert.doesNotMatch(sent[0].subject, /[\r\n]/);
    const bad = await handleContact(deps().deps, {
        body: valid({ subject: "nonsense" }),
        ip: "203.0.113.24",
    });
    assert.equal(bad.status, 400);
});

test("production refuses to send when Turnstile is not configured, instead of skipping the check", async () => {
    const mail = mailer();
    const refused = await handleContact(
        deps({ requireTurnstile: true }, mail).deps,
        { body: valid(), ip: "203.0.113.30" },
    );
    assert.equal(refused.status, 503);
    assert.equal(refused.body.code, "not_configured");
    assert.equal(mail.sent.length, 0);

    // Not required (local work): the check is optional, as before.
    const local = deps({ requireTurnstile: false });
    const ok = await handleContact(local.deps, {
        body: valid(),
        ip: "203.0.113.31",
    });
    assert.equal(ok.status, 200);

    // Required and configured: a failed check still blocks the message.
    const blockedMail = mailer();
    const blocked = await handleContact(
        deps(
            {
                requireTurnstile: true,
                turnstile: {
                    secret: "s",
                    verify: async () => ({ ok: false, reason: "failed" }),
                },
            },
            blockedMail,
        ).deps,
        { body: valid({ turnstileToken: "x".repeat(20) }), ip: "203.0.113.32" },
    );
    assert.equal(blocked.status, 403);
    assert.equal(blockedMail.sent.length, 0);
});

import { readFileSync } from "node:fs";
import { contactFailureMessage } from "../src/lib/contact/messages";
import { validateContact } from "../src/lib/contact/validate";

test("validation reports every problem at once, with plain English messages", () => {
    const empty = validateContact(fields, {});
    assert.deepEqual(Object.keys(empty.errors).sort(), ["email", "message", "name", "subject"]);
    assert.equal(empty.errors.subject, "Please choose a subject.");
    assert.equal(empty.errors.name, "Please enter your full name.");
    const bad = validateContact(fields, {
        name: "A",
        email: "not-an-email",
        phone: "abc",
        subject: "nonsense",
        message: "short",
    });
    assert.deepEqual(Object.keys(bad.errors).sort(), ["email", "message", "name", "phone", "subject"]);
    assert.match(bad.errors.email, /valid email address/);
    assert.match(bad.errors.phone, /valid phone number/);
    assert.match(bad.errors.message, /at least 10 characters/);
    // The optional topic is only checked and kept while "Other enquiry" is chosen.
    const other = validateContact(fields, { ...valid(), subject: "other", subjectOther: "Press" });
    assert.deepEqual(other.errors, {});
    assert.equal(other.values.subjectOther, "Press");
    assert.equal(validateContact(fields, { ...valid(), subjectOther: "Press" }).values.subjectOther, "");
});

test("mistakes in the form never use up the sending limits, and the server answers with every field error", async () => {
    const { deps: d, sent } = deps();
    for (let i = 0; i < 10; i++) {
        const result = await handleContact(d, { body: valid({ subject: "", name: "" }), ip: "198.51.100.40" });
        assert.equal(result.status, 400);
        assert.deepEqual(Object.keys(result.body.errors as object).sort(), ["name", "subject"]);
    }
    for (let i = 0; i < 4; i++)
        assert.equal(
            (await handleContact(d, { body: valid({ email: `p${i}@example.com` }), ip: "198.51.100.40" })).status,
            200,
        );
    assert.equal(sent.length, 4);
});

test("failures carry a short reference, are logged with the cause and never log the visitor's text or a secret", async () => {
    const logged: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => void logged.push(args);
    try {
        const mailFail = deps({ newRef: () => "AB12CD34" }, mailer({ ok: false, reason: "rejected", status: 403, detail: "domain not verified" }));
        const rejected = await handleContact(mailFail.deps, { body: valid({ message: "Private words about my enquiry" }), ip: "198.51.100.50" });
        assert.equal(rejected.status, 502);
        assert.equal(rejected.body.code, "mail_rejected");
        assert.equal(rejected.body.ref, "AB12CD34");

        const check = deps({
            newRef: () => "EF56GH78",
            turnstile: { secret: "very-secret-value", verify: async () => ({ ok: false, reason: "failed", codes: ["invalid-input-response"] }) },
        });
        const blocked = await handleContact(check.deps, { body: valid({ turnstileToken: "x".repeat(20) }), ip: "198.51.100.51" });
        assert.equal(blocked.status, 403);
        assert.equal(blocked.body.code, "bot");
    } finally {
        console.error = original;
    }
    const text = JSON.stringify(logged);
    assert.match(text, /contact_mail_failed/);
    assert.match(text, /domain not verified/);
    assert.match(text, /contact_turnstile_failed/);
    assert.match(text, /invalid-input-response/);
    assert.ok(!text.includes("Private words"), "the visitor's message must not be logged");
    assert.ok(!text.includes("very-secret-value"), "the secret must not be logged");
});

test("visitor messages: every error kind has plain wording, keeps the text, shows no internals", () => {
    const contact = { email: "info@example.test", phone: "+44 0000 000000" };
    const cases: Array<[Parameters<typeof contactFailureMessage>[0], RegExp]> = [
        [{ status: 400, code: "validation" }, /highlighted fields/],
        [{ status: 400, code: "form_expired" }, /reload/],
        [{ status: 403, code: "bot" }, /security check/],
        [{ status: 403, code: "bad_origin" }, /refresh/],
        [{ status: 403 }, /refresh/],
        [{ status: 429, code: "rate_limited", retryAfter: 170 }, /about 3 minutes/],
        [{ status: 502, code: "mail_rejected", ref: "AB12CD34" }, /Reference: AB12CD34/],
        [{ status: 502, code: "mail_unavailable", ref: "AB12CD34" }, /still in the form/],
        [{ status: 502, code: "verification_unavailable", ref: "AB12CD34" }, /security check/],
        [{ status: 503, code: "not_configured" }, /info@example.test/],
        [{ status: 500 }, /try again/],
        [{}, /could not reach the website/],
    ];
    for (const [failure, expected] of cases) {
        const message = contactFailureMessage(failure, contact);
        assert.match(message, expected, JSON.stringify(failure));
        assert.ok(!/(resend|supabase|cloudflare|secret|api key|stack|onboarding@)/i.test(message), message);
    }
    for (const status of [502, 503]) assert.match(contactFailureMessage({ status, code: "x" }, contact), /info@example.test|still in the form/);
});

test("the form component: red required marker, custom checks before any request, focus on the first error, input kept", () => {
    const source = readFileSync("src/components/ui/ContactForm.tsx", "utf8");
    assert.ok(source.includes("text-red-600"));
    assert.ok(source.includes("noValidate"));
    assert.ok(source.includes("border-red-600"));
    assert.ok(source.includes("aria-invalid"));
    assert.ok(source.indexOf("validateContact(") > 0);
    assert.ok(source.indexOf("validateContact(") < source.indexOf('fetch("/api/contact"'), "validate before sending");
    assert.ok(source.includes("focusFirstError(errors)"));
    // The form is not re-created on failure, so typed text stays; success is the only thing that replaces it.
    assert.equal((source.match(/setStatus\("success"\)/g) ?? []).length, 1);
    assert.ok(source.includes("We’ll use the information you provide to respond to your enquiry."));
    assert.ok(!source.includes("/privacy"));
});

test("mail settings pasted with quotes or spaces are cleaned, so the sender address is valid", async () => {
    const { cleanSetting, getMailConfig } = await import("../src/lib/mail");
    const good = "County Hall Dance & Performing Arts School <onboarding@resend.dev>";
    for (const pasted of [good, `"${good}"`, `'${good}'`, `  ${good}\n`, ` "${good}" `])
        assert.equal(cleanSetting(pasted), good, JSON.stringify(pasted));
    assert.equal(cleanSetting(""), undefined);
    assert.equal(cleanSetting("   "), undefined);
    const saved = { ...process.env };
    try {
        process.env.MAIL_API_KEY = ' "re_example_key_value" ';
        process.env.MAIL_FROM = `"${good}"`;
        process.env.MAIL_PROVIDER = " Resend ";
        assert.equal(getMailConfig()?.from, good);
        delete process.env.MAIL_FROM;
        assert.equal(getMailConfig(), undefined);
    } finally {
        process.env = saved;
    }
});
