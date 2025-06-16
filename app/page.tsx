/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig

// app/layout.tsx
import { AuthProvider } from "@/contexts/auth-context";
export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
