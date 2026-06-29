import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import Nav from "@/components/Nav";
import "./globals.css";

const waterFont = localFont({
  src: "../public/fonts/water.woff2",
  variable: "--font-water",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Amit Elgabsy — Portfolio",
  description: "Personal portfolio of Amit Elgabsy — developer, builder, creator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${waterFont.variable} ${GeistSans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
