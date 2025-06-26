<<<<<<< HEAD
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "../components/SupabaseProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});
=======
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientOnly from "@/components/client-only-provider"
import { AuthProvider } from "@/contexts/auth-context"
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Mix & Mingle</title>
        {/* Open Graph Meta Tags for Social Sharing */}
        <meta property="og:title" content="Mix 🎵 Mingle" />
        <meta property="og:description" content="Live DJ streaming and social rooms" />
        <meta property="og:image" content="https://www.djmixandmingle.com/hero-dj.jpg" />
        <meta property="og:image:alt" content="Live Music Stream - Connect Through Music" />
        <meta property="og:url" content="https://www.djmixandmingle.com/" />
        <meta property="og:type" content="website" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mix 🎵 Mingle" />
        <meta name="twitter:description" content="Live DJ streaming and social rooms" />
        <meta name="twitter:image" content="https://www.djmixandmingle.com/hero-dj.jpg" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main id="main-content" role="main">
          <SupabaseProvider>{children}</SupabaseProvider>
        </main>
=======
    <html lang="en">
      <body>
        <ClientOnly
          fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
              <div className="text-xl">Loading...</div>
            </div>
          }
        >
          <AuthProvider>{children}</AuthProvider>
        </ClientOnly>
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
      </body>
    </html>
  )
}
