import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { SiteLayout } from "@/components/layout/site-layout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ustatap.az"),
  title: {
    default: "UstaTap — Etibarlı usta, bir toxunuşda",
    template: "%s · UstaTap",
  },
  description:
    "Azərbaycanda ev xidmətləri üçün etibarlı usta tapma platforması. Elektrik, santexnika, kondisioner və s. 5 dəqiqədə rezervasiya edin.",
  keywords: [
    "usta tap",
    "elektrik ustasi",
    "santexnik ustasi",
    "kondisioner usta",
    "ev xidmetleri",
    "azerbaijan",
    "baku",
  ],
  openGraph: {
    title: "UstaTap — Etibarlı usta, bir toxunuşda",
    description:
      "Azərbaycanda ev xidmətləri üçün etibarlı usta tapma platforması.",
    locale: "az_AZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UstaTap",
    description: "Trusted home services in Azerbaijan.",
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
      lang="az"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <SiteLayout>{children}</SiteLayout>
        </Providers>
      </body>
    </html>
  );
}
