'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { AbsensiRecord } from '@/lib/supabase';

interface RiwayatClientProps {
  initialRecords: AbsensiRecord[];
}

export default function RiwayatClient({ initialRecords }: RiwayatClientProps) {
  const [records] = useState<AbsensiRecord[]>(initialRecords);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const avatarColors = [
    'bg-red-500/15 text-red-400 border-red-500/20',
    'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'bg-pink-500/15 text-pink-400 border-pink-500/20',
    'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'bg-orange-500/15 text-orange-400 border-orange-500/20',
  ];

  const getColor = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = name.charCodeAt(i) + ((h << 5) - h);
    }
    return avatarColors[Math.abs(h) % avatarColors.length];
  };

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fade-in-scale"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-sm border border-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="relative max-w-6xl w-full">
            <Image
              src={lightbox}
              alt="Full preview"
              width={1600}
              height={1000}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 animate-fade-in-up delay-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info-subtle flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-info">
                  <path d="M12 20v-6M6 20V10M18 20V4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Riwayat Absensi</h1>
                <p className="text-sm text-text-secondary mt-1">
                  {records.length} entri tercatat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/riwayat"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer border border-border hover:border-border-hover"
                title="Refresh data"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Refresh</span>
              </Link>

              <Link
                href="/absen"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all focus:outline-none focus:ring-2 focus:ring-accent-border focus:ring-offset-2 focus:ring-offset-surface"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="hidden sm:inline">Absen Baru</span>
                <span className="sm:hidden">Baru</span>
              </Link>
            </div>
          </div>

          {/* Content */}
          {records.length === 0 ? (
            <div className="text-center py-16 sm:py-20 animate-fade-in-scale delay-2">
              <div className="w-16 h-16 rounded-2xl bg-surface-overlay flex items-center justify-center mx-auto mb-5">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-text-muted"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Belum ada data
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Mulai absen untuk melihat riwayat di sini
              </p>
              <Link href="/absen" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-all focus:outline-none focus:ring-2 focus:ring-accent-border focus:ring-offset-2 focus:ring-offset-surface">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Mulai Absen
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className="card-interactive overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border-subtle bg-surface-raised/50">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold border ${getColor(
                        record.nama
                      )}`}
                    >
                      {getInitial(record.nama)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {record.nama}
                      </h3>
                      <p className="text-xs text-text-muted">
                        {formatDate(record.created_at)} · {formatTime(record.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div
                    className="relative group cursor-pointer bg-black/20 overflow-hidden aspect-video"
                    onClick={() => setLightbox(record.image_url)}
                  >
                    <Image
                      src={record.image_url}
                      alt={`Screenshot oleh ${record.nama}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-transparent group-hover:text-surface"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
