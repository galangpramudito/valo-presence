'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BroadcastBanner() {
  const [message, setMessage] = useState<string | null>(null);

  const fetchAnnouncement = async () => {
    // Add cache busting timestamp to URL implicitly by using a dummy filter or just rely on browser fetch
    const { data } = await supabase
      .from('announcements')
      .select('message')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data && data.message) {
      setMessage(data.message);
    } else {
      setMessage(null);
    }
  };

  useEffect(() => {
    fetchAnnouncement();

    // Subscribe to changes in the announcements table
    const channel = supabase.channel('announcement_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncement();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="bg-red-600 text-white py-2 px-4 overflow-hidden relative flex items-center border-b border-red-800">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-red-600 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-red-600 to-transparent z-10"></div>
      <p className="text-[11px] font-black tracking-widest uppercase whitespace-nowrap animate-marquee flex gap-12">
        <span>⚠️ BROADCAST: {message}</span>
        <span>⚠️ BROADCAST: {message}</span>
        <span>⚠️ BROADCAST: {message}</span>
        <span>⚠️ BROADCAST: {message}</span>
        <span>⚠️ BROADCAST: {message}</span>
      </p>
    </div>
  );
}
