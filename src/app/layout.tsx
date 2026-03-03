import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ScrollToTop } from "@/components/ScrollToTop";
import Script from 'next/script'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sarisari-Bench - AI Agent Benchmark for Store Management",
    template: "%s | Sarisari-Bench",
  },
  description: "An AI agent benchmark simulating sari-sari store management in the Philippines. Evaluate LLM decision-making over 30-day business scenarios with cash, inventory, and profit metrics.",
  keywords: ["AI benchmark", "LLM evaluation", "sari-sari store", "Philippines", "agent benchmark", "business simulation", "GPT", "Claude", "Gemini", "AI decision-making", "store management simulation", "LLM agent"],
  authors: [{ name: "Sarisari-Bench Team" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Sarisari-Bench - AI Agent Benchmark",
    description: "Evaluate AI models managing a Philippine sari-sari store. 30-day simulation measuring cash management, inventory decisions, and business strategy.",
    url: "https://sarisari-bench.phtechai.com",
    siteName: "Sarisari-Bench",
    images: [
      {
        url: "https://sarisari-bench.phtechai.com/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Sarisari-Bench - AI Store Management Benchmark",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarisari-Bench - AI Agent Benchmark",
    description: "Evaluate AI models managing a Philippine sari-sari store over 30 days.",
    images: ["https://sarisari-bench.phtechai.com/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://sarisari-bench.phtechai.com"),
};

const gaId = process.env.NEXT_PUBLIC_GA_ID || ''

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`$` + `{geistSans.variable} $` + `{geistMono.variable} antialiased`}
      >
        {children}
        <ScrollToTop />
        {gaId && (
          <>
            <Script
              src={"https://www.googletagmanager.com/gtag/js?id=" + gaId}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {"window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','" + gaId + "');"}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
