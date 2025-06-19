"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "larrybesant@gmail.com"; // Admin email

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-2">Welcome, {user?.email} (Admin)!</div>
      {/* Add admin controls here */}
    </main>
  );
}
