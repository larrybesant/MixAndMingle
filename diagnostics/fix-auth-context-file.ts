import { writeFileSync, existsSync, mkdirSync } from "fs"

function fixAuthContextFile() {
  console.log("🔧 Creating/fixing auth-context.tsx file...")

  try {
    // Create the auth directory if it doesn't exist
    if (!existsSync("./lib/auth")) {
      mkdirSync("./lib/auth", { recursive: true })
    }

    // Create the auth-context.tsx file
    const authContextContent = `"use client"

import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  initializeFirebase,
  subscribeToAuthChanges,
  signIn,
  signUp,
  logOut,
  resetPassword,
  verifyAuthConfig,
} from "@/lib/firebase/firebase-auth"

// Initialize Firebase
initializeFirebase()

// Verify auth configuration on startup
verifyAuthConfig()

interface AuthContextProps {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  logOut: () => Promise<{ success: boolean; error: any }>
  resetPassword: (email: string) => Promise<{ success: boolean; error: any }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null }),
  logOut: async () => ({ success: false, error: null }),
  resetPassword: async () => ({ success: false, error: null }),
  clearError: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setError(null)
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const handleSignUp = async (email: string, password: string) => {
    setError(null)
    const result = await signUp(email, password)
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const handleLogOut = async () => {
    setError(null)
    const result = await logOut()
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const handleResetPassword = async (email: string) => {
    setError(null)
    const result = await resetPassword(email)
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        logOut: handleLogOut,
        resetPassword: handleResetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
`

    writeFileSync("./lib/auth/auth-context.tsx", authContextContent)
    console.log("✅ Created/fixed auth-context.tsx file")

    // Create an index.ts file in the auth directory for easier imports
    const indexContent = `export * from './auth-context.tsx';\n`
    writeFileSync("./lib/auth/index.ts", indexContent)
    console.log("✅ Created index.ts in lib/auth directory")

    return true
  } catch (error) {
    console.error("❌ Error fixing auth-context file:", error)
    return false
  }
}

// Run the fix
const success = fixAuthContextFile()
console.log(success ? "✅ Fix completed successfully" : "❌ Fix failed")
