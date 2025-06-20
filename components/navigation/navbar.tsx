import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { supabase } from '@/lib/supabase/client';

export const Navbar = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    async function fetchNotifications() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
    }
    fetchNotifications();
  }, []);
  return (
    <nav className={cn('w-full flex items-center justify-between px-6 py-4 bg-stone-900 text-white')}> 
      <Link href="/" className="font-bold text-xl">Mix & Mingle</Link>
      <div className="flex gap-4 items-center">
        <Link href="/discover">Discover</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/go-live">Go Live</Link>
        <div className="relative">
          <button
            className="relative focus:outline-none"
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Notifications"
          >
            <span className="material-icons align-middle">notifications</span>
            {notifications.some(n => !n.read) && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">{notifications.filter(n => !n.read).length}</span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-2 font-bold border-b">Notifications</div>
              {notifications.length === 0 && <div className="p-2 text-gray-500">No notifications</div>}
              {notifications.map((n, i) => (
                <div key={i} className={`p-2 border-b last:border-b-0 ${!n.read ? 'bg-blue-100' : ''}`}>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-xs text-gray-700">{n.message}</div>
                  {n.type === 'room_invite' && n.data?.room_id && (
                    <Link href={`/room/${n.data.room_id}`} className="text-blue-600 underline text-xs">Join Room</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
