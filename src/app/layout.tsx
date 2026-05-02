import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Cormorant_Garamond, Bagel_Fat_One } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bagel = Bagel_Fat_One({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Pull the canonical site URL from the env var Vercel injects automatically
// (`NEXT_PUBLIC_VERCEL_URL`). Local dev falls back to localhost. This is
// required for absolute OG image URLs — relative paths don't render in
// link unfurlers (Slack, iMessage, Twitter, etc.).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "https://tesmaraneh.vercel.app";

const TITLE = "Tesmaraneh — Ethical Fashion, Made in Sierra Leone";
const DESCRIPTION =
  "Hand-batiked, hand-tailored clothing for women — made in the provinces of Sierra Leone. Shop the SS26 Summer Collection.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: "%s · Tesmaraneh",
  },
  description: DESCRIPTION,
  applicationName: "Tesmaraneh",
  authors: [{ name: "Tesmaraneh", url: siteUrl }],
  keywords: [
    "Tesmaraneh",
    "Sierra Leone fashion",
    "ethical fashion",
    "Gara tie-dye",
    "African batik",
    "hand-woven country cloth",
    "Isatu Bundu",
    "SS26",
  ],
  openGraph: {
    type: "website",
    siteName: "Tesmaraneh",
    title: TITLE,
    description: DESCRIPTION,
    url: siteUrl,
    locale: "en_GB",
    // Image is supplied by app/opengraph-image.tsx — Next will inject the
    // correct absolute URL automatically.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-nobg.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable} ${bagel.variable} antialiased`}
    >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
