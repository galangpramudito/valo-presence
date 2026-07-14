import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase, type AbsensiRecord } from '@/lib/supabase';
import AdminClient from './AdminClient';
import type { SquadMember } from '@/types';
import { getSession } from '@/lib/session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await getSession(token) : null;

  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  // Fetch all attendance records
  const { data: absensiData } = await supabase
    .from('absensi')
    .select('*, schedules(title)')
    .order('created_at', { ascending: false });

  // Fetch all squad members
  const { data: memberData } = await supabase
    .from('squad_members')
    .select('*')
    .order('nama', { ascending: true });

  // Fetch MVPs
  const { data: mvpData } = await supabase
    .from('mvps')
    .select('*')
    .order('rank', { ascending: true });

  // Fetch Schedules
  const { data: scheduleData } = await supabase
    .from('schedules')
    .select('*')
    .order('start_time', { ascending: false });

  return (
    <AdminClient 
      initialAbsensi={(absensiData as AbsensiRecord[]) || []} 
      initialMembers={(memberData as SquadMember[]) || []} 
      initialMvps={mvpData || []}
      initialSchedules={scheduleData || []}
    />
  );
}
