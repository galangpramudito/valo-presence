'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AbsensiRecord, Schedule } from '@/lib/supabase';
import type { SquadMember } from '@/types';
import Toast from '@/components/Toast';
import { updateSchedule } from '@/app/actions/admin';
import Image from 'next/image';

interface ScheduleDetailClientProps {
  schedule: Schedule;
  records: AbsensiRecord[];
  members: SquadMember[];
}

export default function ScheduleDetailClient({ schedule, records, members }: ScheduleDetailClientProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  // Form states
  const [title, setTitle] = useState(schedule.title);
  
  // Format dates for datetime-local input
  const formatForInput = (isoString: string) => {
    // Enforce WIB (UTC+7) for the schedule input, matching the database timezone
    const d = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return formatter.format(d).replace(' ', 'T');
  };

  const [startTime, setStartTime] = useState(schedule.start_time ? formatForInput(schedule.start_time) : '');
  const [endTime, setEndTime] = useState(schedule.end_time ? formatForInput(schedule.end_time) : '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      setToast({ message: 'Lengkapi semua field!', type: 'error' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', schedule.id);
    formData.append('title', title);
    formData.append('start_time', `${startTime}:00`);
    formData.append('end_time', `${endTime}:00`);

    const result = await updateSchedule(formData);
    if (result?.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Jadwal berhasil diupdate!', type: 'success' });
      router.refresh();
    }
    setIsLoading(false);
  };

  // Group members
  const attendedRecords = records.filter(r => r.status !== 'IZIN');
  const excusedRecords = records.filter(r => r.status === 'IZIN');
  
  const attendedNames = records.map(r => r.nama);
  const missingMembers = members.filter(m => m.role !== 'admin' && !attendedNames.includes(m.nama));

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\./g, ':');

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {lightbox && (
        <div className="fixed inset-0 z-[9999] bg-white/95 dark:bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center border-2 border-black dark:border-white text-black dark:text-white transition-all cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <Image src={lightbox} alt="Proof" width={1600} height={900} className="max-w-full max-h-[90vh] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} unoptimized />
        </div>
      )}

      <main className="flex-1 py-12 px-4 bg-white dark:bg-black min-h-[calc(100vh-4rem)] transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link href="/admin?tab=schedule" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-4 inline-flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Kembali ke Daftar Jadwal
              </Link>
              <h1 className="text-3xl font-[family-name:var(--font-montserrat)] font-black tracking-widest text-black dark:text-white uppercase mt-2">
                Detail Jadwal
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Edit */}
            <div className="lg:col-span-1">
              <div className="border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 p-6 sticky top-24">
                <h3 className="text-sm font-black tracking-widest uppercase text-black dark:text-white mb-6">Edit Info Jadwal</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Judul Kegiatan</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 relative mt-4">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-emerald-500 text-white text-[8px] font-black tracking-widest uppercase">Start</div>
                    <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Tgl & Jam Dibuka</label>
                    <input 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="border border-red-500/20 bg-red-500/5 p-4 relative mt-4">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-red-500 text-white text-[8px] font-black tracking-widest uppercase">End</div>
                    <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Tgl & Jam Ditutup</label>
                    <input 
                      type="datetime-local" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-emerald-500 text-white text-[12px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-emerald-600 transition-colors mt-6"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </form>
              </div>
            </div>

            {/* Rekap Kehadiran */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Missing */}
              <div className="border border-red-500/20 bg-red-500/5 p-6">
                <h3 className="text-sm font-black tracking-widest uppercase text-red-500 mb-4 flex items-center justify-between">
                  <span>Tidak Hadir / Alpha</span>
                  <span className="px-2 py-1 bg-red-500 text-white text-[10px]">{missingMembers.length} ORANG</span>
                </h3>
                {missingMembers.length === 0 ? (
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Tidak ada yang alpha.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {missingMembers.map(m => (
                      <div key={m.id} className="p-3 border border-red-500/20 bg-white dark:bg-black flex items-center gap-3">
                        <div className="w-8 h-8 border border-red-500/20 flex items-center justify-center text-[12px] font-black text-red-500">
                          {getInitial(m.nama)}
                        </div>
                        <span className="text-[11px] font-black uppercase text-black dark:text-white tracking-widest">{m.nama}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attended */}
              <div className="border border-emerald-500/20 bg-emerald-500/5 p-6">
                <h3 className="text-sm font-black tracking-widest uppercase text-emerald-500 mb-4 flex items-center justify-between">
                  <span>Hadir & Telat</span>
                  <span className="px-2 py-1 bg-emerald-500 text-white text-[10px]">{attendedRecords.length} ORANG</span>
                </h3>
                {attendedRecords.length === 0 ? (
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Belum ada yang hadir.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {attendedRecords.map(r => (
                      <div key={r.id} className="p-4 border border-emerald-500/20 bg-white dark:bg-black flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={() => r.image_url ? setLightbox(r.image_url) : null}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-emerald-500/20 flex items-center justify-center text-[14px] font-black text-emerald-500">
                            {getInitial(r.nama)}
                          </div>
                          <div>
                            <span className="text-[12px] font-black uppercase text-black dark:text-white tracking-widest flex items-center gap-2">
                              {r.nama}
                              {r.status === 'LATE' && <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 text-[8px] text-red-500">TELAT</span>}
                            </span>
                            {isMounted && (
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                {formatDate(r.created_at)} · {formatTime(r.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="px-3 py-1 border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest hidden sm:block">Lihat Bukti</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Excused */}
              <div className="border border-blue-500/20 bg-blue-500/5 p-6">
                <h3 className="text-sm font-black tracking-widest uppercase text-blue-500 mb-4 flex items-center justify-between">
                  <span>Izin (Excused)</span>
                  <span className="px-2 py-1 bg-blue-500 text-white text-[10px]">{excusedRecords.length} ORANG</span>
                </h3>
                {excusedRecords.length === 0 ? (
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Tidak ada yang izin.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {excusedRecords.map(r => (
                      <div key={r.id} className="p-4 border border-blue-500/20 bg-white dark:bg-black flex items-start gap-4">
                        <div className="w-10 h-10 border border-blue-500/20 flex items-center justify-center text-[14px] font-black text-blue-500 flex-shrink-0">
                          {getInitial(r.nama)}
                        </div>
                        <div>
                          <span className="text-[12px] font-black uppercase text-black dark:text-white tracking-widest">{r.nama}</span>
                          {isMounted && (
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 mb-2">
                              {formatDate(r.created_at)} · {formatTime(r.created_at)}
                            </p>
                          )}
                          <div className="text-[11px] font-bold text-blue-500 border-l-2 border-blue-500 pl-3 italic">
                            "{r.alasan}"
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
