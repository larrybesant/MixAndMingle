import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/auth-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { ThemeProvider } from "@/contexts/theme-provider";
// import { Analytics } from "@vercel/analytics/react"; // Uncomment if you install this package

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mix 🎵 Mingle",
  description: "Live DJ streaming and social rooms",
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
