"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateProfilePage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !bio.trim() || !genres.trim() || !photo) {
      setError("All fields and a profile photo are required.");
      return;
    }
    setLoading(true);
    try {
      // Upload photo if present
      let photoUrl = "";
      if (photo) {
        const { data, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`public/${Date.now()}_${photo.name}`, photo);
        if (uploadError) throw uploadError;
        photoUrl = data?.path || "";
      }
      // Update profile
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        bio,
        genres: genres.split(",").map((g) => g.trim()),
        avatar_url: photoUrl,
      });
      if (updateError) throw updateError;
      setShowSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Profile setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2 sm:px-0">
      <h1 className="text-4xl font-bold mb-4">Create Your Profile</h1>
      {showSuccess && (
        <div className="bg-green-600 text-white px-6 py-4 rounded-xl mb-4 font-bold text-lg animate-bounce">
          Profile created! Redirecting...
        </div>
      )}
      <form
        className="flex flex-col gap-4 w-full max-w-xs sm:max-w-md"
        onSubmit={handleSubmit}
      >
        <label className="text-gray-300">Username</label>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label className="text-gray-300">Bio</label>
        <Input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
        />
        <label className="text-gray-300">Favorite Genres (comma separated)</label>
        <Input
          type="text"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          placeholder="e.g. House, Techno, Jazz"
        />
        <label className="text-gray-300">Profile Photo</label>
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
