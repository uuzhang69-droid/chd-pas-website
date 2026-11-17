import type { NextConfig } from "next";

/** Pages and APIs with personal data or one-time tokens: never cached, never framed, no referrer sent. */
const privateHeaders = [
  { key: "Cache-Control", value: "no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
      { source: "/newsletter/:path*", headers: privateHeaders },
    ];
  },
  async redirects() {
    return [
      {
        source: "/studio-hire/our-space",
        destination: "/venue-hire",
        permanent: true,
      },
      {
        source: "/studio-hire",
        destination: "/venue-hire",
        permanent: true,
      },
      {
        source: "/studio-hire/:path*",
        destination: "/venue-hire/:path*",
        permanent: true,
      },
      {
        source: "/venue-hire/our-space",
        destination: "/venue-hire",
        permanent: true,
      },
      {
        source: "/events/contemporary-intensive-maya-chen",
        destination: "/events/memory-of-china",
        permanent: true,
      },
      {
        source: "/events/junior-ballet-masterclass",
        destination: "/events/four-seasons-festival",
        permanent: true,
      },
      {
        source: "/events/autumn-concert-at-county-hall",
        destination: "/events/four-seasons-festival",
        permanent: true,
      },
      {
        source: "/events/musical-theatre-workshop-day",
        destination: "/events/lunchtime-concert-series",
        permanent: true,
      },
      {
        source: "/events/winter-showcase",
        destination: "/events/dance-meets-arts",
        permanent: true,
      },
      {
        source: "/booking",
        destination: "/contact",
        permanent: true,
      },
      {
        // Old empty page (no content, no booking system): its job is now done by the enquiry form.
        source: "/venue-hire/space-booking",
        destination: "/contact?subject=venue-hire",
        permanent: true,
      },
      {
        source: "/membership/member-benefits",
        destination: "/membership",
        permanent: true,
      },
      {
        source: "/membership/monthly-passes",
        destination: "/membership",
        permanent: true,
      },
      {
        source: "/membership/booking-access",
        destination: "/membership",
        permanent: true,
      },
      {
        source: "/join-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/gift-cards",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/membership-terms",
        destination: "/membership",
        permanent: true,
      },
      {
        source: "/taster-classes",
        destination: "/timetable",
        permanent: true,
      },
      {
        source: "/classes",
        destination: "/timetable",
        permanent: true,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
      },
      {
        protocol: "https",
        hostname: "dl.airtable.com",
      },
    ],
  },
};

export default nextConfig;
