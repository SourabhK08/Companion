import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/providers/app-providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Companionly — Real People. Real Connections.",
  description:
    "Companionly is a modern platform for real people seeking meaningful moments and trusted connections.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
