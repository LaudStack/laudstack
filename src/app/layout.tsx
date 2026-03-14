import type { Metadata, Viewport } from "next";

export const dynamic = 'force-dynamic';
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "LaudStack — Discover the Best SaaS & AI Tools",
    template: "%s | LaudStack",
  },
  description:
    "LaudStack is the trusted discovery and review platform for SaaS and AI products. Founders launch, users discover, and the community curates quality through reviews and voting.",
  keywords: [
    "AI tools",
    "SaaS tools",
    "software reviews",
    "tool discovery",
    "product reviews",
    "AI software",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "LaudStack",
    title: "LaudStack — Discover the Best SaaS & AI Tools",
    description:
      "The trusted discovery and review platform for SaaS and AI products.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LaudStack — Discover the Best SaaS & AI Tools",
    description:
      "The trusted discovery and review platform for SaaS and AI products.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
