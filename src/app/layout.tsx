import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { WhatsAppSupportWidget } from "@/components/support/WhatsAppSupportWidget";
import { siteContent } from "@/content/site";
import { SITE_NAME, SITE_URL, isIndexingEnabled } from "@/lib/seo/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteContent.meta.defaultDescription,
  /* Only the real production site may be indexed. Local, preview and unconfigured hosts stay noindex. */
  ...(isIndexingEnabled() ? {} : { robots: { index: false, follow: false } }),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        {children}
        <WhatsAppSupportWidget />
      </body>
    </html>
  );
}
