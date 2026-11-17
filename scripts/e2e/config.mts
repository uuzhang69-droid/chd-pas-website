/* Fixed, fake settings for the mocked end-to-end tests. Nothing here is a real credential:
   every value is a made-up test string, and every address points at this computer. */
export const E2E = {
    appPort: 3300,
    mockPort: 4010,
    appUrl: "http://127.0.0.1:3300",
    mockUrl: "http://127.0.0.1:4010",
    tokenSecret: "e2e-newsletter-token-secret-0123456789abcdef",
    /** The environment handed to the test copy of the website. Nothing is inherited from the real environment. */
    appEnv(): Record<string, string> {
        return {
            SUPABASE_URL: "http://127.0.0.1:4010",
            SUPABASE_ANON_KEY: "anon-test",
            SUPABASE_SERVICE_ROLE_KEY: "eyJ.service-test",
            NEWSLETTER_ADMIN_EMAILS: "owner@example.test",
            NEWSLETTER_TOKEN_SECRET: "e2e-newsletter-token-secret-0123456789abcdef",
            APP_BASE_URL: "http://127.0.0.1:3300",
            MAIL_API_KEY: "re_test_key_not_real",
            MAIL_FROM: "CHDC <onboarding@resend.dev>",
            TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
            NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
            RATE_LIMIT_SALT: "e2e-salt",
            VERCEL_ENV: "production",
            NEXT_TELEMETRY_DISABLED: "1",
            // Public sign-up is open in the test copy only; the real environment and source keep it closed.
            NEWSLETTER_ONLINE_SIGNUP_LIVE: "true",
            // The lifecycle checks below cover the email workflow, so it is selected explicitly (the default is collect-only).
            NEWSLETTER_DELIVERY_MODE: "double_opt_in",
        };
    },
};
