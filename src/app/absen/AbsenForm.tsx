'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Toast from '@/components/Toast';
import { uploadAbsensi } from '../actions';
import type { Schedule } from '@/lib/supabase';

export default function AbsenForm({ nama, schedules = [], totalSchedulesToday = 0 }: { nama: string; schedules?: Schedule[]; totalSchedulesToday?: number }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      // Coba buka kamera belakang dulu (untuk HP), kalau gagal buka kamera default (Webcam PC)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      streamRef.current = stream;
      
      // Tunggu DOM merender elemen video, baru masukkan stream-nya
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.error("Play error:", e));
        }
      }, 100);
    } catch (err) {
      setToast({ message: 'Akses kamera ditolak atau tidak ditemukan.', type: 'error' });
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const f = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFileChange(f);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setToast({ message: 'Format file harus JPG, PNG, atau WEBP', type: 'error' });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setToast({ message: 'Ukuran file maksimal 5MB', type: 'error' });
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (schedules.length > 0 && !selectedScheduleId) {
      setToast({ message: 'Pilih jadwal yang sedang berlangsung', type: 'error' });
      return;
    }
    if (!file) { setToast({ message: 'Upload screenshot dulu', type: 'error' }); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('file', file);
      if (selectedScheduleId) {
        formData.append('schedule_id', selectedScheduleId);
      }
      
      const result = await uploadAbsensi(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setToast({ message: 'Upload complete! Redirecting...', type: 'success' });
      setTimeout(() => router.push('/riwayat'), 1500);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Terjadi kesalahan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <form onSubmit={handleSubmit} className="animate-slide-up delay-100">
        
        {/* Schedule Selector */}
        {schedules.length > 0 ? (
          <div className="mb-6 p-4 sm:p-6 border border-emerald-500/30 bg-emerald-500/5">
            <label className="block text-[11px] font-black text-emerald-500 mb-3 uppercase tracking-widest flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Jadwal Aktif Hari Ini
            </label>
            <select 
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-4 py-3 border border-emerald-500/30 bg-white dark:bg-black text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="" className="text-black dark:text-white">-- PILIH JADWAL --</option>
              {schedules.map(s => {
                const start = new Date(s.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
                const end = new Date(s.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
                return (
                  <option key={s.id} value={s.id} className="text-black dark:text-white">
                    {s.title} ({start} - {end})
                  </option>
                );
              })}
            </select>
            <p className="mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Absen di atas batas waktu akhir akan otomatis dicatat sebagai TELAT (LATE).
            </p>
          </div>
        ) : totalSchedulesToday > 0 ? (
          <div className="mb-6 p-4 sm:p-6 border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-4 animate-fade-in">
            <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div>
              <h3 className="text-[12px] font-black text-emerald-500 uppercase tracking-widest">Semua Tuntas!</h3>
              <p className="text-[11px] font-bold text-gray-500 mt-1 leading-relaxed">
                Kamu sudah menyelesaikan seluruh jadwal absen hari ini. Good luck & Have fun!
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 sm:p-6 border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-4 animate-fade-in">
            <div className="mt-1 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <h3 className="text-[12px] font-black text-yellow-500 uppercase tracking-widest">Belum Ada Jadwal</h3>
              <p className="text-[11px] font-bold text-gray-500 mt-1 leading-relaxed">
                Admin belum membuat jadwal absensi untuk hari ini.
              </p>
            </div>
          </div>
        )}

        {schedules.length > 0 && (
          <div className="border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 p-2 animate-fade-in">
            
            {/* Upload Area */}
            <div className="relative border border-black/10 dark:border-white/10 bg-white dark:bg-black overflow-hidden">
              {isCameraOpen ? (
                <div className="relative bg-black w-full min-h-[350px] flex flex-col items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-h-[400px] object-cover" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6">
                    <button 
                      type="button" 
                      onClick={stopCamera} 
                      className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <button 
                      type="button" 
                      onClick={capturePhoto} 
                      className="w-16 h-16 bg-transparent border-4 border-white hover:bg-white/20 rounded-full transition-all flex items-center justify-center"
                    >
                      <div className="w-12 h-12 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              ) : !preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    relative p-8 flex flex-col items-center justify-center transition-all duration-300 min-h-[300px]
                    ${isDragging ? 'bg-black/5 dark:bg-white/5' : ''}
                  `}
                >
                  <div className={`absolute inset-0 border-2 border-dashed pointer-events-none transition-colors ${isDragging ? 'border-black dark:border-white' : 'border-transparent'}`} />
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm z-10 relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        startCamera();
                      }}
                      className="flex-1 py-6 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex flex-col items-center justify-center gap-3 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      <span className="text-[11px] font-black tracking-widest uppercase">Open WebCam</span>
                    </button>

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }}
                      className="flex-1 py-6 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex flex-col items-center justify-center gap-3 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span className="text-[11px] font-black tracking-widest uppercase">Upload File</span>
                    </button>
                  </div>

                  <p className="text-[10px] font-bold text-gray-500 mt-8 tracking-[0.2em] uppercase">
                    {isDragging ? 'DROP IMAGE HERE' : 'OR DRAG & DROP IMAGE'}
                  </p>
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative h-[300px] w-full bg-gray-100 dark:bg-gray-900">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    {/* Remove Button Overlay */}
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={removeFile}
                        className="px-6 py-3 border-2 border-black dark:border-white text-black dark:text-white text-[11px] font-black tracking-widest uppercase transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        REMOVE
                      </button>
                    </div>
                  </div>
                  
                  {/* File Info Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-black border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                    <div className="min-w-0 pr-4">
                      <p className="text-[12px] font-black text-black dark:text-white truncate uppercase tracking-widest">{file?.name}</p>
                    </div>
                    <div className="text-[10px] font-bold text-black dark:text-white tracking-[0.2em]">
                      {file ? (file.size / (1024 * 1024)).toFixed(2) : '0'} MB
                    </div>
                  </div>
                </div>
              )}

              
              {/* Hidden Inputs */}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
                className="hidden" 
              />
              <input 
                id="cameraInput"
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
                className="hidden" 
              />
            </div>

            {/* Submit Action */}
            <div className="p-4 mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className={`
                  w-full py-4 text-[12px] font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3
                  ${isSubmitting || !file
                    ? 'bg-transparent border-2 border-black/20 dark:border-white/20 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white dark:bg-white dark:text-black active:scale-[0.98]'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeDasharray="30 70"/></svg>
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    TRANSMIT
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                  </>
                )}
              </button>
            </div>
            
          </div>
        )}
      </form>
    </>
  );
}
