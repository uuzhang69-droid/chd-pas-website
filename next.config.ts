import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
