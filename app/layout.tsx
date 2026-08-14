import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { SiteLayout } from "@/components/layout/site-layout";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
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
  metadataBase: new URL("https://hellvar.az"),
  title: {
    default: "HəllVar — Etibarlı usta, bir toxunuşda",
    template: "%s · HəllVar",
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
    title: "HəllVar — Etibarlı usta, bir toxunuşda",
    description:
      "Azərbaycanda ev xidmətləri üçün etibarlı usta tapma platforması.",
    locale: "az_AZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HəllVar",
    description: "Trusted home services in Azerbaijan.",
  },
  icons: {
    icon: "/logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const localeCookie = cookieStore.get("hellvar.locale")?.value;
  // Middleware URL prefiksindən dili x-locale header-ə yazır — o prioritetlidir
  const headerLocale = headerStore.get("x-locale");
  const locale: Locale =
    headerLocale && ["az", "en", "tr", "ru"].includes(headerLocale)
      ? (headerLocale as Locale)
      : localeCookie && ["az", "en", "tr", "ru"].includes(localeCookie)
        ? (localeCookie as Locale)
        : "az";
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers initialLocale={locale} initialDictionary={dictionary}>
          <SiteLayout>{children}</SiteLayout>
        </Providers>
      </body>
    </html>
  );
}
