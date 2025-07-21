import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MOSQUE_INFO } from "@/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: {
    default: MOSQUE_INFO.name,
    template: `%s | ${MOSQUE_INFO.name}`,
  },
  description: "Islamic community center providing prayer services, events, and religious education. Join us for daily prayers, Eid celebrations, Ramadan activities, and community gatherings.",
  keywords: ["mosque", "masjid", "prayer times", "islam", "community", "eid", "ramadan", "islamic center"],
  authors: [{ name: MOSQUE_INFO.name }],
  creator: MOSQUE_INFO.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: MOSQUE_INFO.website,
    title: MOSQUE_INFO.name,
    description: "Islamic community center providing prayer services, events, and religious education.",
    siteName: MOSQUE_INFO.name,
  },
  twitter: {
    card: "summary_large_image",
    title: MOSQUE_INFO.name,
    description: "Islamic community center providing prayer services, events, and religious education.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <body className="min-h-screen bg-background font-inter antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
