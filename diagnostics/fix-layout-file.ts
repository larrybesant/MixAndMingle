import { writeFileSync, existsSync, readFileSync } from "fs"

function fixLayoutFile() {
  console.log("🔧 Fixing app/layout.tsx file...")

  try {
    const layoutPath = "./app/layout.tsx"

    if (existsSync(layoutPath)) {
      // Read the existing file
      let content = readFileSync(layoutPath, "utf8")

      // Fix the import statement
      content = content.replace(
        /import\s+{\s*AuthProvider\s*}\s+from\s+['"]@\/lib\/auth\/auth-context['"]/,
        "import { AuthProvider } from '@/lib/auth'",
      )

      writeFileSync(layoutPath, content)
      console.log("✅ Fixed import in app/layout.tsx")
    } else {
      // Create a new layout.tsx file
      const layoutContent = `import type { Metadata } from "next"
import type React from "react"
import { AuthProvider } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Mix & Mingle",
    template: "%s | Mix & Mingle",
  },
  description: "Connect with friends and plan events",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Mix & Mingle",
    description: "Connect with friends and plan events",
    siteName: "Mix & Mingle",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mix & Mingle",
    description: "Connect with friends and plan events",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
`

      writeFileSync(layoutPath, layoutContent)
      console.log("✅ Created new app/layout.tsx file")
    }

    return true
  } catch (error) {
    console.error("❌ Error fixing layout file:", error)
    return false
  }
}

// Run the fix
const success = fixLayoutFile()
console.log(success ? "✅ Fix completed successfully" : "❌ Fix failed")
