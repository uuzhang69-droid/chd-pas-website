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
        destination: "/events/autumn-concert-at-county-hall",
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
