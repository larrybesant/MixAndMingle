"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from "@/contexts/auth-context-types";

type AuthContextType = {
  user: {
    name?: string;
    email?: string;
    [key: string]: any;
  } | null;
  signOut: () => void;
};

export default function Header() {
  const { user, signOut } = (useAuth() ?? { user: null, signOut: () => {} }) as AuthContextType;

  return (
    <header className="flex items-center justify-between p-4 border-b border-purple-700 bg-black/80">
      <div className="flex items-center gap-4">
        <Link href="/">
          <span className="text-2xl font-bold text-purple-400">MyApp</span>
        </Link>
      </div>
      <nav className="flex items-center gap-6">
        <Link href="/about" className="text-purple-200 hover:text-white">About</Link>
        <Link href="/contact" className="text-purple-200 hover:text-white">Contact</Link>
        {user ? (
          <>
            <span className="text-purple-100 mr-4">Hello, {user.name || user.email || 'User'}!</span>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition">Login</Link>
            <Link href="/auth/register" className="px-4 py-2 border border-purple-700 text-purple-200 rounded hover:bg-purple-700 hover:text-white transition">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}