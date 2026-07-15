import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsenForm from './AbsenForm';
import { getSession } from '@/lib/session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default async function AbsenPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await getSession(token) : null;

  if (!session) {
    redirect('/login');
  }
  // Fetch active schedules
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: allSchedules } = await supabase
    .from('schedules')
    .select('*')
    .gte('end_time', today.toISOString())
    .order('start_time', { ascending: true });
    
  // Fetch user's attendance for these active schedules
  const activeScheduleIds = allSchedules?.map(s => s.id) || [];
  
  const { data: userAttendances } = await supabase
    .from('absensi')
    .select('schedule_id')
    .eq('nama', session.nama)
    .in('schedule_id', activeScheduleIds.length > 0 ? activeScheduleIds : ['']);
    
  const attendedScheduleIds = userAttendances?.map(a => a.schedule_id).filter(Boolean) || [];
  const schedules = allSchedules?.filter(s => !attendedScheduleIds.includes(s.id)) || [];

  return (
    <main className="flex-1 py-12 px-4 bg-white dark:bg-black min-h-[calc(100vh-4rem)] transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-block border border-black dark:border-white px-4 py-1 mb-6">
            <span className="text-[10px] font-black text-black dark:text-white tracking-[0.2em] uppercase">
              Auth: Verified
            </span>
          </div>
          <h1 className="text-3xl font-[family-name:var(--font-montserrat)] font-black tracking-widest text-black dark:text-white uppercase">
            Upload Proof
          </h1>
          <p className="mt-4 text-[13px] font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto uppercase tracking-widest">
            Identity: <span className="font-black text-black dark:text-white border-b-2 border-black dark:border-white pb-0.5">{session.nama}</span>
          </p>
          <div className="mt-8 p-4 sm:p-5 border border-blue-500/30 bg-blue-500/5 text-left max-w-sm mx-auto flex flex-col gap-3">
            <h3 className="font-black text-blue-500 uppercase tracking-widest text-[11px] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              PROSEDUR ABSEN & IZIN
            </h3>
            <ol className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed list-decimal list-inside space-y-2">
              <li>Pilih <strong>Jadwal Aktif</strong> yang tersedia.</li>
              <li>Untuk <strong>Hadir</strong>: Upload foto layar (Lobby In-Game + Status READY).</li>
              <li>Untuk <strong>Izin</strong>: Klik tab "AJUKAN IZIN" dan ketik alasan yang jelas & detail (minimal 10 karakter).</li>
              <li>Klik <strong>TRANSMIT</strong> untuk mengirim data.</li>
            </ol>
          </div>
        </div>

        <AbsenForm nama={session.nama} schedules={schedules || []} totalSchedulesToday={allSchedules?.length || 0} />
      </div>
    </main>
  );
}
