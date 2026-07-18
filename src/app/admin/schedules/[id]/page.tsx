import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import ScheduleDetailClient from '@/app/admin/schedules/[id]/ScheduleDetailClient';
import type { AbsensiRecord, Schedule } from '@/lib/supabase';
import type { SquadMember } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await getSession(token) : null;

  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;

  // Fetch the schedule
  const { data: scheduleData } = await supabase
    .from('schedules')
    .select('*')
    .eq('id', id)
    .single();

  if (!scheduleData) {
    redirect('/admin');
  }

  // Fetch attendance records for this schedule
  const { data: absensiData } = await supabase
    .from('absensi')
    .select('*')
    .eq('schedule_id', id)
    .order('created_at', { ascending: false });

  // Fetch all members to see who is missing
  const { data: memberData } = await supabase
    .from('squad_members')
    .select('*')
    .order('nama', { ascending: true });

  return (
    <ScheduleDetailClient 
      schedule={scheduleData as Schedule}
      records={(absensiData as AbsensiRecord[]) || []}
      members={(memberData as SquadMember[]) || []}
    />
  );
}
