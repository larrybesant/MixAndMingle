import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/auth-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { SafetyProvider } from "@/contexts/safety-context";
import { ThemeProvider } from "@/contexts/theme-provider";
import ClientProviders from '@/components/ui/ClientProviders';
// import { Analytics } from "@vercel/analytics/react"; // Uncomment if you install this package
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mix 🎵 Mingle",
  description: "Live DJ streaming and social rooms",
    generator: 'v0.dev'
};

// Header component for user info and dropdown
function Header() {
  const { user, signOut } = useAuth();
  return (
    <header className="flex items-center justify-between p-4 border-b border-purple-700 bg-black/80">
      <div className="flex items-center space-x-2">
        <Image src="/logo.png" alt="Mix & Mingle Logo" width={40} height={40} />
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">MIX𝄞MINGLE</span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Facebook Share Button */}
        <a
          href="https://www.facebook.com/sharer/sharer.php?u=https://www.djmixandmingle.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          aria-label="Share on Facebook"
        >
          Share on Facebook
        </a>
        {/* Twitter Share Button */}
        <a
          href="https://twitter.com/intent/tweet?url=https://www.djmixandmingle.com&text=Check%20out%20Mix%20%F0%9F%8E%B5%20Mingle%20%E2%80%93%20Live%20DJ%20streaming%20and%20social%20rooms!"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded bg-blue-400 text-white hover:bg-blue-500 transition"
          aria-label="Share on Twitter"
        >
          Share on Twitter
        </a>
        {/* Copy Link Button */}
        <button
          onClick={() => {navigator.clipboard.writeText('https://www.djmixandmingle.com')}}
          className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
          aria-label="Copy site link"
        >
          Copy Link
        </button>
        {/* Privacy Policy & Terms */}
        <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">Privacy</Link>
        <Link href="/terms" className="text-sm text-gray-300 hover:text-white">Terms</Link>
        {/* User avatar/profile dropdown */}
        {user ? (
          <div className="relative group">
            <button className="flex items-center space-x-2 focus:outline-none">
              <img src={user.user_metadata?.avatar_url || '/logo.png'} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-purple-400" />
              <span className="text-white font-semibold">{user.email}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-black border border-purple-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <Link href="/dashboard" className="block px-4 py-2 text-white hover:bg-purple-700">Dashboard</Link>
              <Link href="/profile" className="block px-4 py-2 text-white hover:bg-purple-700">Profile</Link>
              <button onClick={signOut} className="w-full text-left px-4 py-2 text-red-400 hover:bg-purple-700">Sign Out</button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 rounded bg-purple-700 text-white hover:bg-purple-800 transition">Sign In</Link>
        )}
        <button className="ml-2 px-4 py-2 rounded bg-gray-800 text-white hover:bg-purple-700 transition" aria-label="Toggle dark mode">🌓</button>
      </div>
    </header>
  );
}

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
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <OnboardingProvider>
                <SafetyProvider>
                  <ClientProviders>
                    <Header />
                    {children}
                  </ClientProviders>
                </SafetyProvider>
              </OnboardingProvider>
            </AuthProvider>
          </ThemeProvider>
        </main>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
