"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateProfilePage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [musicPreferences, setMusicPreferences] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper to sanitize input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 100): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
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
    if (!cleanUsername || !cleanBio || !cleanMusicPreferences || !photo) {
      setError("All fields and a profile photo are required.");
      return;
    }
    if (!isValidUsername(cleanUsername)) {
      setError("Username must be 3-20 characters, letters, numbers, or underscores only.");
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
        music_preferences: cleanMusicPreferences.split(",").map((g) => sanitizeInput(g, 30)),
        avatar_url: photoUrl,
      });
      if (updateError) throw updateError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Profile setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2">
      <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
      <form className="flex flex-col gap-4 w-full max-w-xs" onSubmit={handleSubmit}>
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
  );
}
