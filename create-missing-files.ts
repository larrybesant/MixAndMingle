// Script to create essential missing files
import { writeFileSync, existsSync, mkdirSync } from "fs"

console.log("🔧 Creating Missing Essential Files...")

// Create directories if they don't exist
const dirs = ["lib/supabase", "contexts", "components/ui", "app/api/health"]
dirs.forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

// Create Supabase client if missing
if (!existsSync("lib/supabase/client.ts")) {
  const supabaseClient = `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`
  writeFileSync("lib/supabase/client.ts", supabaseClient)
  console.log("✅ Created lib/supabase/client.ts")
}

// Create basic auth context if missing
if (!existsSync("contexts/auth-context.tsx")) {
  const authContext = `"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initAuth = async () => {
      try {
        const { supabase } = await import("@/lib/supabase/client")
        const { data: { session } } = await supabase.auth.getSession()
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
          }
        )

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth error:", error)
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
`
  writeFileSync("contexts/auth-context.tsx", authContext)
  console.log("✅ Created contexts/auth-context.tsx")
}

// Create .env.local template if missing
if (!existsSync(".env.local")) {
  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_database_url_here

# App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`
  writeFileSync(".env.local", envTemplate)
  console.log("✅ Created .env.local template")
}

// Create health API endpoint
if (!existsSync("app/api/health/route.ts")) {
  const healthRoute = `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}
`
  writeFileSync("app/api/health/route.ts", healthRoute)
  console.log("✅ Created app/api/health/route.ts")
}

console.log("\n🎯 Essential files created!")
console.log("📝 Next steps:")
console.log("   1. Update .env.local with your actual Supabase credentials")
console.log("   2. Run 'npm run dev' to start the development server")
console.log("   3. Visit http://localhost:3000 to test the app")
`
