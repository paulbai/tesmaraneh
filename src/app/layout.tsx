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

export const metadata: Metadata = {
  title: "Tesmaraneh — Ethical Fashion for Women, Rooted in Sierra Leone",
  description:
    "A Sierra Leonean clothing brand creating beautiful, timeless designs for women. Handmade with Gara tie-dye, batik, and woven country cloth. Empowering women and artisans.",
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
