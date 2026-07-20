import { cookies } from 'next/headers';
import { supabase, type AbsensiRecord } from '@/lib/supabase';
import RiwayatView from './RiwayatView';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// Prevent Next.js from caching this page so new data always loads
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RiwayatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await getSession(token) : null;

  if (!session) {
    redirect('/login');
  }

  // Fetch personal records and MVP Leaderboard concurrently
  const [
    { data: personalData },
    { data: mvpData }
  ] = await Promise.all([
    supabase
      .from('absensi')
      .select('*, schedules(title)')
      .eq('nama', session.nama)
      .order('created_at', { ascending: false }),
    supabase
      .from('mvps')
      .select('*')
      .order('rank', { ascending: true })
  ]);

  return (
    <RiwayatView 
      initialRecords={(personalData as AbsensiRecord[]) || []} 
      nama={session.nama} 
      leaderboard={mvpData || []}
    />
  );
}
