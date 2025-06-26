"use client"

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function CreateProfilePage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [musicPreferences, setMusicPreferences] = useState("");
  const [relationshipStyle, setRelationshipStyle] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [bdsmPreferences, setBdsmPreferences] = useState("");
  const [showBdsmPublic, setShowBdsmPublic] = useState(false);
  const [isDatingVisible, setIsDatingVisible] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  // Helper to sanitize input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 100): string {
    return input
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  // Helper to validate username (alphanumeric, underscores, 3-20 chars)
  function isValidUsername(name: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(name);
  }
=======
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function CreateProfilePage() {
  const { user, initialized } = useAuth()
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [musicPreferences, setMusicPreferences] = useState("")
  const [relationshipStyle, setRelationshipStyle] = useState("")
  const [gender, setGender] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("Please log in first")
      return
    }

    if (!username || !bio || !musicPreferences || !relationshipStyle || !gender) {
      setError("All fields are required")
      return
    }

    setLoading(true)

    try {
      // Dynamic import to avoid SSR issues
      const { supabase } = await import("@/lib/supabase/client")

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.trim(),
        bio: bio.trim(),
        music_preferences: musicPreferences.split(",").map((g) => g.trim()),
        relationship_style: relationshipStyle,
        gender: gender,
        profile_completed: true,
      })

<<<<<<< HEAD
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setError("You must be signed in to create a profile. Redirecting to login...");
        setTimeout(() => router.replace("/login"), 1500);
      }
      setAuthChecking(false);
    }
    checkAuth();
  }, [router]);

  if (authChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-lg">Checking authentication...</div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2">
=======
      if (updateError) {
        if (updateError.message.includes("relation") || updateError.message.includes("does not exist")) {
          setError("Database not set up. Please contact support to create the profiles table.")
        } else {
          throw updateError
        }
      } else {
        // Success - redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Profile setup failed")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
        <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
        <p className="text-center mb-4">Please log in to create your profile</p>
        <Button onClick={() => router.push("/login")} className="bg-blue-600">
          Go to Login
        </Button>
      </div>
    )
  }

  // Show the form
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2">
      <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
      <form className="flex flex-col gap-4 w-full max-w-xs" onSubmit={handleSubmit}>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <Input type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" required />
        <Input
          type="text"
          value={musicPreferences}
          onChange={(e) => setMusicPreferences(e.target.value)}
          placeholder="Favorite Genres (comma separated)"
          required
        />
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={relationshipStyle}
          onChange={(e) => setRelationshipStyle(e.target.value)}
          required
        >
          <option value="">Select Relationship Style</option>
          <option value="traditional">Traditional/Monogamous</option>
          <option value="poly">Polyamorous</option>
          <option value="open">Open</option>
          <option value="queerplatonic">Queerplatonic</option>
          <option value="other">Other</option>
        </select>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonbinary">Nonbinary</option>
          <option value="transgender">Transgender</option>
          <option value="other">Other / Prefer not to say</option>
        </select>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button type="submit" className="bg-blue-600" disabled={loading}>
          {loading ? "Saving..." : "Create Profile"}
        </Button>
      </form>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm max-w-md">
        <p className="font-bold mb-2">If you get a database error, run this SQL in Supabase:</p>
        <pre className="text-green-400 text-xs overflow-x-auto">{`CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  bio TEXT,
  music_preferences TEXT[],
  relationship_style TEXT,
  gender TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);`}</pre>
      </div>
    </main>
  )
}
