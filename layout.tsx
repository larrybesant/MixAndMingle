import type React from "react";
import AuthProvider from "@/contexts/auth-context";
import "./globals.css";

export const metadata = {
  title: "Mix & Mingle | v0 App",
  description: "Party from home with friends or solo. Join rooms. Go live. Connect with global vibes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
