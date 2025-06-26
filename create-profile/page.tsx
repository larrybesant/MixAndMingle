"use client";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Sanitize inputs
    const cleanUsername = sanitizeInput(username, 20);
    const cleanBio = sanitizeInput(bio, 160);
    const cleanMusicPreferences = sanitizeInput(musicPreferences, 100);
    const cleanBdsmPreferences = sanitizeInput(bdsmPreferences, 200);
    if (
      !cleanUsername ||
      !cleanBio ||
      !cleanMusicPreferences ||
      !relationshipStyle ||
      !photo ||
      !gender
    ) {
      setError(
        "All fields, including relationship style, gender, and a profile photo are required.",
      );
      return;
    }
    if (!isValidUsername(cleanUsername)) {
      setError(
        "Username must be 3-20 characters, letters, numbers, or underscores only.",
      );
      return;
    }
    if (photo) {
      if (!photo.type.startsWith("image/")) {
        setError("Profile photo must be an image file.");
        return;
      }
      if (photo.size > 5 * 1024 * 1024) {
        setError("Profile photo must be less than 5MB.");
        return;
      }
    }
    setLoading(true);
    try {
      let photoUrl = "";
      if (photo) {
        const { data, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`public/${Date.now()}_${photo.name}`, photo);
        if (uploadError) throw uploadError;
        photoUrl = data?.path || "";
      }
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: cleanUsername,
        bio: cleanBio,
        music_preferences: cleanMusicPreferences
          .split(",")
          .map((g) => sanitizeInput(g, 30)),
        relationship_style: relationshipStyle,
        bdsm_preferences: cleanBdsmPreferences,
        show_bdsm_public: showBdsmPublic,
        is_dating_visible: isDatingVisible,
        avatar_url: photoUrl,
        gender: gender,
      });
      if (updateError) throw updateError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Profile setup failed");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
        <form
          className="flex flex-col gap-4 w-full max-w-xs"
          onSubmit={handleSubmit}
        >
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <Input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <Input
            type="text"
            value={musicPreferences}
            onChange={(e) => setMusicPreferences(e.target.value)}
            placeholder="Favorite Genres (comma separated)"
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
          {/* BDSM/Kink Preferences Section */}
          <div className="flex flex-col gap-2 bg-gray-800/60 p-3 rounded-lg mt-2">
            <label className="text-white font-semibold">
              BDSM / Kink / Other Preferences (optional)
            </label>
            <textarea
              className="p-2 rounded bg-gray-700 text-white"
              value={bdsmPreferences}
              onChange={(e) => setBdsmPreferences(e.target.value)}
              placeholder="Share as much or as little as you want..."
              rows={3}
              maxLength={200}
            />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showBdsmPublic}
                onChange={(e) => setShowBdsmPublic(e.target.checked)}
              />
              Show this section on my public profile
            </label>
          </div>
          {/* Dating Visibility Section */}
          <div className="flex items-center gap-2 bg-gray-800/60 p-3 rounded-lg mt-2">
            <input
              type="checkbox"
              checked={isDatingVisible}
              onChange={(e) => setIsDatingVisible(e.target.checked)}
              id="dating-visible"
            />
            <label htmlFor="dating-visible" className="text-sm text-gray-300">
              Add me to the dating/matchmaking part of Mix & Mingle
            </label>
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="bg-blue-600" disabled={loading}>
            {loading ? "Saving..." : "Finish Setup"}
          </Button>
        </form>
      </main>
    </ErrorBoundary>
  );
}
