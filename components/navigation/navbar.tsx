import React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

export const Navbar = () => (
  <nav className={cn('w-full flex items-center justify-between px-6 py-4 bg-stone-900 text-white')}> 
    <Link href="/" className="font-bold text-xl">Mix & Mingle</Link>
    <div className="flex gap-4">
      <Link href="/discover">Discover</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/go-live">Go Live</Link>
    </div>
  </nav>
);
