import { writeFileSync, existsSync, mkdirSync } from "fs"

interface AutoFix {
  id: string
  category: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  autoApplicable: boolean
  testRequired: boolean
  fix: () => Promise<void>
}

class AutoFixEngine {
  private fixes: AutoFix[] = []
  private appliedFixes: string[] = []

  constructor() {
    this.initializeFixes()
  }

  private initializeFixes() {
    // Environment Variable Fixes
    this.fixes.push({
      id: "env-template",
      category: "Environment",
      description: "Create .env.local template",
      severity: "high",
      autoApplicable: true,
      testRequired: false,
      fix: async () => {
        const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_database_url_here

# Optional Integrations
DAILY_API_KEY=your_daily_api_key_here
RESEND_API_KEY=your_resend_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development`

        writeFileSync(".env.local.template", envTemplate)
        console.log("✅ Created .env.local template")
      },
    })

    // Database Setup Fix
    this.fixes.push({
      id: "database-schema",
      category: "Database",
      description: "Generate complete database schema",
      severity: "critical",
      autoApplicable: true,
      testRequired: true,
      fix: async () => {
        if (!existsSync("database")) {
          mkdirSync("database", { recursive: true })
        }

        const schema = `-- Mix & Mingle Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  location TEXT,
  website TEXT,
  music_preferences TEXT[] DEFAULT '{}',
  is_dj BOOLEAN DEFAULT FALSE,
  privacy_settings JSONB DEFAULT '{}',
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DJ Rooms table
CREATE TABLE IF NOT EXISTS dj_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  dj_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_live BOOLEAN DEFAULT FALSE,
  viewer_count INTEGER DEFAULT 0,
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES dj_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user1_id, user2_id)
);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dj_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- DJ Rooms policies
DROP POLICY IF EXISTS "Anyone can view live rooms" ON dj_rooms;
CREATE POLICY "Anyone can view live rooms" ON dj_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "DJs can manage own rooms" ON dj_rooms;
CREATE POLICY "DJs can manage own rooms" ON dj_rooms FOR ALL USING (auth.uid() = dj_id);

-- Messages policies
DROP POLICY IF EXISTS "Users can view room messages" ON messages;
CREATE POLICY "Users can view room messages" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches policies
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can create matches" ON matches;
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Swipes policies
DROP POLICY IF EXISTS "Users can view own swipes" ON swipes;
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT USING (auth.uid() = swiper_id);

DROP POLICY IF EXISTS "Users can create swipes" ON swipes;
CREATE POLICY "Users can create swipes" ON swipes FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_dj_rooms_is_live ON dj_rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);`

        writeFileSync("database/complete-schema.sql", schema)
        console.log("✅ Generated complete database schema")
      },
    })

    // Auth Context Fix
    this.fixes.push({
      id: "auth-context-fix",
      category: "Authentication",
      description: "Fix auth context SSR issues",
      severity: "critical",
      autoApplicable: true,
      testRequired: true,
      fix: async () => {
        const authContextContent = `"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Session, AuthError } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  email?: string
  music_preferences?: string[]
  is_dj?: boolean
  profile_completed?: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  initialized: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    const initializeAuth = async () => {
      try {
        const { supabase } = await import("@/lib/supabase/client")
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          setSession(session)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return
            
            setSession(session)
            setUser(session?.user ?? null)
            
            if (!session?.user) {
              setProfile(null)
            }
            
            setLoading(false)
            setInitialized(true)
          }
        )

        setLoading(false)
        setInitialized(true)

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
        if (mounted) {
          setError("Failed to initialize authentication")
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      return { error }
    } catch (error) {
      const authError = new Error("Signup failed") as AuthError
      setError(authError.message)
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase/client")
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error("Sign out error:", error)
      setError("Failed to sign out")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") }
    
    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      
      if (error) return { error }
      await refreshProfile()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
    } catch (err) {
      console.log("Profile refresh failed:", err)
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    initialized,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}`

        writeFileSync("contexts/auth-context.tsx", authContextContent)
        console.log("✅ Fixed auth context SSR issues")
      },
    })

    // API Health Endpoint Fix
    this.fixes.push({
      id: "api-health-endpoint",
      category: "API",
      description: "Create comprehensive health check endpoint",
      severity: "medium",
      autoApplicable: true,
      testRequired: true,
      fix: async () => {
        if (!existsSync("app/api")) {
          mkdirSync("app/api", { recursive: true })
        }
        if (!existsSync("app/api/health")) {
          mkdirSync("app/api/health", { recursive: true })
        }

        const healthEndpoint = `import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'checking',
        auth: 'checking',
        storage: 'checking'
      },
      version: '1.0.0'
    }

    // Test database connection
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { error } = await supabase.from('profiles').select('count(*)').limit(1)
      healthCheck.services.database = error ? 'error' : 'healthy'
    } catch {
      healthCheck.services.database = 'error'
    }

    // Test auth
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { error } = await supabase.auth.getSession()
      healthCheck.services.auth = error ? 'error' : 'healthy'
    } catch {
      healthCheck.services.auth = 'error'
    }

    // Test storage
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { error } = await supabase.storage.listBuckets()
      healthCheck.services.storage = error ? 'error' : 'healthy'
    } catch {
      healthCheck.services.storage = 'error'
    }

    // Determine overall status
    const hasErrors = Object.values(healthCheck.services).includes('error')
    healthCheck.status = hasErrors ? 'degraded' : 'healthy'

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}`

        writeFileSync("app/api/health/route.ts", healthEndpoint)
        console.log("✅ Created comprehensive health check endpoint")
      },
    })
  }

  async applyFix(fixId: string): Promise<boolean> {
    const fix = this.fixes.find((f) => f.id === fixId)
    if (!fix) {
      console.log(`❌ Fix not found: ${fixId}`)
      return false
    }

    if (!fix.autoApplicable) {
      console.log(`⚠️ Fix requires manual intervention: ${fix.description}`)
      return false
    }

    try {
      console.log(`🔧 Applying fix: ${fix.description}`)
      await fix.fix()
      this.appliedFixes.push(fixId)
      console.log(`✅ Successfully applied: ${fix.description}`)
      return true
    } catch (error) {
      console.log(`❌ Failed to apply fix ${fixId}:`, error)
      return false
    }
  }

  async applyAllFixes(): Promise<void> {
    console.log("🚀 Applying all auto-fixes...")

    // Sort by severity (critical first)
    const sortedFixes = this.fixes
      .filter((f) => f.autoApplicable)
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      })

    for (const fix of sortedFixes) {
      await this.applyFix(fix.id)
    }

    console.log(`\n✅ Applied ${this.appliedFixes.length}/${sortedFixes.length} fixes`)

    if (this.appliedFixes.length > 0) {
      console.log("\n📋 Applied fixes:")
      this.appliedFixes.forEach((fixId) => {
        const fix = this.fixes.find((f) => f.id === fixId)
        console.log(`   • ${fix?.description}`)
      })
    }
  }

  getAvailableFixes() {
    return this.fixes.map((f) => ({
      id: f.id,
      category: f.category,
      description: f.description,
      severity: f.severity,
      autoApplicable: f.autoApplicable,
    }))
  }
}

// Run auto-fixes
const autoFixer = new AutoFixEngine()
autoFixer
  .applyAllFixes()
  .then(() => {
    console.log("\n🎯 Auto-fix engine completed!")
    console.log("📄 Check generated files and run tests to verify fixes")
  })
  .catch((error) => {
    console.error("❌ Auto-fix engine failed:", error)
  })
