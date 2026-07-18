'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { AbsensiRecord } from '@/lib/supabase';

interface RiwayatViewProps {
  initialRecords: AbsensiRecord[];
  nama: string;
  leaderboard?: any[];
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\./g, ':');

const getInitial = (name: string) => name.charAt(0).toUpperCase();

export default function RiwayatView({ initialRecords: records, nama, leaderboard }: RiwayatViewProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedLeaderboard = useMemo(() => {
    if (!leaderboard) return [];
    return [...leaderboard].filter(u => u.nama).sort((a, b) => a.rank - b.rank);
  }, [leaderboard]);

  return (
    <>
      {lightbox && (
        <div className="fixed inset-0 z-[9999] bg-white/95 dark:bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-none border-2 border-black dark:border-white text-black dark:text-white transition-all cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <Image src={lightbox} alt="Full Screenshot" width={1600} height={900} className="max-w-full max-h-[90vh] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} unoptimized />
        </div>
      )}

      <main className="flex-1 py-12 px-4 bg-white dark:bg-black min-h-[calc(100vh-4rem)] transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 animate-slide-up">
            <div>
              <h1 className="text-3xl font-[family-name:var(--font-montserrat)] font-black tracking-widest text-black dark:text-white uppercase">History</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/10 text-[10px] font-black text-black dark:text-white uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                  Live
                </span>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {records.length} ENTRIES FOR {nama}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/riwayat"
                className="w-10 h-10 flex items-center justify-center border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Force Sync"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
              </Link>
              <Link
                href="/absen"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black text-[11px] font-black tracking-widest uppercase transition-opacity hover:opacity-80 h-10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Entry
              </Link>
            </div>
          </div>

          {/* MVP LEADERBOARD */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mb-10 p-6 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-yellow-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <h2 className="text-sm font-black tracking-widest text-black dark:text-white uppercase">MVP of the Month</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sortedLeaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                    <div className="flex items-center gap-3">
                      <span className={`text-[12px] font-black ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`}>#{user.rank}</span>
                      <span className="text-[11px] font-black tracking-widest uppercase text-black dark:text-white">{user.nama}</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{user.pts} PTS</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <div className="border border-black/10 dark:border-white/10 p-12 text-center animate-slide-up delay-100 bg-black/5 dark:bg-white/5">
              <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-widest mb-2">No Records Found</h3>
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">You have no attendance records yet. Initialize a new upload.</p>
              <Link
                href="/absen"
                className="inline-block px-6 py-3 border-2 border-black dark:border-white text-black dark:text-white text-[11px] font-black tracking-widest uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Initialize Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-slide-up delay-100">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="group flex items-center justify-between p-4 sm:p-5 border border-black/10 dark:border-white/10 bg-white dark:bg-black hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => record.image_url ? setLightbox(record.image_url) : null}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden sm:flex w-12 h-12 border border-black/20 dark:border-white/20 items-center justify-center text-[16px] font-black text-black dark:text-white">
                      {getInitial(record.nama)}
                    </div>
                    <div>
                      <p className="text-[14px] sm:text-[16px] font-black text-black dark:text-white tracking-widest uppercase mb-1">
                        {record.nama}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mt-1">
                        {!isMounted ? (
                          <span className="opacity-0">Loading time...</span>
                        ) : (
                          <>
                            <span>{formatDate(record.created_at)}</span>
                            <span className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            <span className="text-black dark:text-white">{formatTime(record.created_at)} LOCAL</span>
                          </>
                        )}
                      </div>
                      {record.status === 'IZIN' && record.alasan && (
                        <div className="mt-2 text-[11px] font-bold text-blue-500 border-l-2 border-blue-500 pl-3">
                          "{record.alasan}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {record.status === 'LATE' ? (
                      <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-[10px] font-black text-red-500 tracking-widest uppercase">
                        Late / Telat
                      </div>
                    ) : record.status === 'IZIN' ? (
                      <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-[10px] font-black text-blue-500 tracking-widest uppercase">
                        Excused / Izin
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-500 tracking-widest uppercase hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                        View Proof
                      </div>
                    )}
                    {record.schedules?.title && (
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{record.schedules.title}</span>
                    )}
                  </div>
                  
                  {/* Mobile View Proof Icon (Only show if not IZIN) */}
                  {record.status !== 'IZIN' && (
                    <div className="sm:hidden w-10 h-10 border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
