'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GoLivePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <main className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">🎤 You’re Live, {user.email}!</h1>
      <p className="text-gray-500">Stream dashboard will go here.</p>
    </main>
  );
}
