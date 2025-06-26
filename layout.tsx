import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-provider";
// import { Analytics } from "@vercel/analytics/react"; // Uncomment if you install this package
// import Header from "@/components/Header"; // <-- Use your client Header component

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mix 🎵 Mingle",
  description: "Live DJ streaming and social rooms",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Mix & Mingle</title>
        {/* Open Graph Meta Tags for Social Sharing */}
        <meta property="og:title" content="Mix 🎵 Mingle" />
        <meta
          property="og:description"
          content="Live DJ streaming and social rooms"
        />
        <meta
          property="og:image"
          content="https://www.djmixandmingle.com/hero-dj.jpg"
        />
        <meta
          property="og:image:alt"
          content="Live Music Stream - Connect Through Music"
        />
        <meta property="og:url" content="https://www.djmixandmingle.com/" />
        <meta property="og:type" content="website" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mix 🎵 Mingle" />
        <meta
          name="twitter:description"
          content="Live DJ streaming and social rooms"
        />
        <meta
          name="twitter:image"
          content="https://www.djmixandmingle.com/hero-dj.jpg"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main id="main-content" role="main">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </main>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
