import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./AppProviders";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paytitan.app"),
  title: "PayTitan",
  description: "Next generation social banking. Architected for your financial intelligence.",
  appleWebApp: {
    capable: true,
    title: "PayTitan",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "PayTitan",
    description: "Next generation social banking. Architected for your financial intelligence.",
    url: "https://paytitan.app",
    siteName: "PayTitan",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "PayTitan Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayTitan",
    description: "Next generation social banking. Architected for your financial intelligence.",
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A2130",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased select-none selection:bg-transparent`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
