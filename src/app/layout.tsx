import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NIAT Insider",
    template: "%s | NIAT Insider",
  },
  description: "Student-written guides for every NIAT campus. Onboarding, food, clubs, placements and more.",
  keywords: ["niat insider", "niat campus life", "niat student platform"],
  metadataBase: new URL("https://niatinsider.com"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
