'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { AbsensiRecord } from '@/lib/supabase';
import type { SquadMember } from '@/types';
import Toast from '@/components/Toast';
import { addMember, updatePassword, deleteMember, broadcastAnnouncement, clearAnnouncement, updateMVPs, clearMVPs, createSchedule, deleteSchedule } from '@/app/actions/admin';
import type { Schedule } from '@/lib/supabase';

interface AdminClientProps {
  initialAbsensi: AbsensiRecord[];
  initialMembers: SquadMember[];
  initialMvps: any[];
  initialSchedules: Schedule[];
}

export default function AdminClient({ initialAbsensi, initialMembers, initialMvps, initialSchedules }: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'attendance' | 'members' | 'broadcast' | 'mvp' | 'schedule'>('attendance');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Loading state for forms
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newNama, setNewNama] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Schedule States
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  
  // MVP States
  const [mvp1, setMvp1] = useState(initialMvps.find(m => m.rank === 1) || { rank: 1, nama: '', pts: 0 });
  const [mvp2, setMvp2] = useState(initialMvps.find(m => m.rank === 2) || { rank: 2, nama: '', pts: 0 });
  const [mvp3, setMvp3] = useState(initialMvps.find(m => m.rank === 3) || { rank: 3, nama: '', pts: 0 });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // --- ADVANCED FILTERING STATES ---
  const [filterName, setFilterName] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD format

  // Calculate filtered logs
  const filteredAbsensi = initialAbsensi.filter(record => {
    let matchName = true;
    let matchDate = true;

    if (filterName !== 'ALL') {
      matchName = record.nama === filterName;
    }

    if (filterDate) {
      // Compare YYYY-MM-DD string
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      matchDate = recordDate === filterDate;
    }

    return matchName && matchDate;
  });

  const handleExportCSV = () => {
    if (filteredAbsensi.length === 0) {
      setToast({ message: 'Tidak ada data untuk diekspor!', type: 'error' });
      return;
    }

    // Prepare CSV with BOM for proper UTF-8 encoding (fixes Excel issues)
    const BOM = '\uFEFF';
    
    // Headers with better formatting
    const headers = [
      'No',
      'Nama Anggota',
      'Tanggal',
      'Hari',
      'Waktu (WIB)',
      'Status',
      'Link Bukti'
    ];
    
    const csvRows: string[] = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add separator line for better readability
    csvRows.push('---,---,---,---,---,---,---');
    
    // Add data rows
    filteredAbsensi.forEach((r, index) => {
      const d = new Date(r.created_at);
      
      // Format date: DD/MM/YYYY
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
      
      // Format day name
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
      
      // Format time: HH:MM:SS
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;
      
      // Escape commas and quotes in data
      const escapeCsv = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const rowNumber = index + 1;
      const nama = escapeCsv(r.nama);
      const status = r.status === 'IZIN' ? 'IZIN' : (r.status === 'LATE' ? 'TELAT' : 'HADIR');
      const proofUrl = r.status === 'IZIN' ? escapeCsv(`Alasan: ${r.alasan || '-'}`) : escapeCsv(r.image_url || '');
      
      csvRows.push(`${rowNumber},${nama},${dateStr},${dayName},${timeStr},${status},${proofUrl}`);
    });
    
    // Add summary footer
    csvRows.push('');
    csvRows.push(`Total Record,${filteredAbsensi.length},,,,`);
    csvRows.push(`Exported At,${new Date().toLocaleString('id-ID')},,,,`);
    csvRows.push('');
    csvRows.push('Generated by,MNG Squad Absensi System,,,,');
    
    // Create CSV content with BOM
    const csvContent = BOM + csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Better filename with filter info
    let filename = 'MNG_ATTENDANCE';
    if (filterName !== 'ALL') {
      filename += `_${filterName.replace(/\s+/g, '_')}`;
    }
    if (filterDate) {
      filename += `_${filterDate}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    setToast({ 
      message: `${filteredAbsensi.length} record berhasil diekspor!`, 
      type: 'success' 
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('nama', newNama);
    formData.append('password', newPassword);
    
    const result = await addMember(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Anggota berhasil ditambahkan!', type: 'success' });
      setNewNama('');
      setNewPassword('');
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async (id: string) => {
    if (!editPassword) {
      setToast({ message: 'Password tidak boleh kosong', type: 'error' });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('password', editPassword);
    
    const result = await updatePassword(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Password berhasil diubah!', type: 'success' });
      setEditingMember(null);
      setEditPassword('');
    }
    setIsLoading(false);
  };

  const handleDeleteMember = async (id: string, nama: string) => {
    if (!confirm(`Hapus anggota ${nama} secara permanen?`)) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', id);
    
    const result = await deleteMember(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Anggota dihapus!', type: 'success' });
    }
    setIsLoading(false);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('message', broadcastMessage);
    
    const result = await broadcastAnnouncement(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Pengumuman berhasil disiarkan!', type: 'success' });
      setBroadcastMessage('');
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleClearBroadcast = async () => {
    setIsLoading(true);
    const result = await clearAnnouncement();
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Pengumuman dibersihkan!', type: 'success' });
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleUpdateMVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = [];
    if (mvp1.nama && mvp1.pts >= 0) payload.push(mvp1);
    if (mvp2.nama && mvp2.pts >= 0) payload.push(mvp2);
    if (mvp3.nama && mvp3.pts >= 0) payload.push(mvp3);

    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    
    const result = await updateMVPs(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'MVP Board berhasil diupdate!', type: 'success' });
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleClearMVP = async () => {
    if (!confirm('Apakah kamu yakin ingin membersihkan MVP Board?')) return;
    setIsLoading(true);
    
    const result = await clearMVPs();
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'MVP Board berhasil dibersihkan!', type: 'success' });
      setMvp1({ rank: 1, nama: '', pts: 0 });
      setMvp2({ rank: 2, nama: '', pts: 0 });
      setMvp3({ rank: 3, nama: '', pts: 0 });
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle || !scheduleDate || !scheduleStartTime || !scheduleEndTime) {
      setToast({ message: 'Lengkapi semua field!', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      const start_time = new Date(`${scheduleDate}T${scheduleStartTime}:00`).toISOString();
      const end_time = new Date(`${scheduleDate}T${scheduleEndTime}:00`).toISOString();

      const formData = new FormData();
      formData.append('title', scheduleTitle);
      formData.append('start_time', start_time);
      formData.append('end_time', end_time);
      
      const result = await createSchedule(formData);
      if (result.error) {
        setToast({ message: result.error, type: 'error' });
      } else {
        setToast({ message: 'Jadwal berhasil dibuat!', type: 'success' });
        setScheduleTitle('');
        setScheduleDate('');
        setScheduleStartTime('');
        setScheduleEndTime('');
        router.refresh();
      }
    } catch (e) {
      setToast({ message: 'Format tanggal/waktu tidak valid', type: 'error' });
    }
    setIsLoading(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Hapus jadwal ini? Data absensi terkait akan kehilangan referensi jadwal.')) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', id);
    
    const result = await deleteSchedule(formData);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Jadwal dihapus!', type: 'success' });
      router.refresh();
    }
    setIsLoading(false);
  };

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
          
          <div className="mb-10">
            <h1 className="text-3xl font-[family-name:var(--font-montserrat)] font-black tracking-widest text-black dark:text-white uppercase mb-6">
              Command Center
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
              <button 
                onClick={() => setActiveTab('attendance')}
                className={`px-6 py-3 text-[11px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'attendance' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}
              >
                Radar Monitor ({filteredAbsensi.length})
              </button>
              <button 
                onClick={() => setActiveTab('broadcast')}
                className={`px-6 py-3 text-[11px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'broadcast' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-red-500'}`}
              >
                Global Broadcast
              </button>
              <button 
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 text-[11px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'members' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}
              >
                Squad Config ({initialMembers.length})
              </button>
              <button 
                onClick={() => setActiveTab('mvp')}
                className={`px-6 py-3 text-[11px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'mvp' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-yellow-500'}`}
              >
                MVP Assessor
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-3 text-[11px] font-black tracking-widest uppercase transition-all border-b-2 ${activeTab === 'schedule' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-gray-400 hover:text-emerald-500'}`}
              >
                Schedule ({initialSchedules.length})
              </button>
            </div>
          </div>

          {/* TAB 1: RADAR MONITOR */}
          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
              {/* Full Width Column: All History with Advanced Filters */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                  <h3 className="text-sm font-black tracking-widest uppercase text-black dark:text-white">Global Logs</h3>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="flex-1 min-w-[120px] px-3 py-2 border border-black/20 dark:border-white/20 bg-transparent text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none"
                    >
                      <option value="ALL" className="text-black">ALL OPERATIVES</option>
                      {initialMembers.filter(m => m.role !== 'admin').map(m => (
                        <option key={m.id} value={m.nama} className="text-black">{m.nama}</option>
                      ))}
                    </select>

                    <input 
                      type="date" 
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="flex-1 min-w-[120px] px-3 py-2 border border-black/20 dark:border-white/20 bg-transparent text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none"
                    />
                    
                    {(filterName !== 'ALL' || filterDate !== '') && (
                      <button 
                        onClick={() => { setFilterName('ALL'); setFilterDate(''); }}
                        className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest"
                      >
                        Reset
                      </button>
                    )}
                    
                    <button 
                      onClick={handleExportCSV}
                      className="px-4 py-2 border border-black dark:border-white text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center gap-2 transition-all w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export CSV
                    </button>
                  </div>
                </div>

                {filteredAbsensi.length === 0 ? (
                  <div className="border border-black/10 dark:border-white/10 p-12 text-center bg-black/5 dark:bg-white/5">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-widest">No Attendance Data Found.</p>
                  </div>
                ) : (
                  filteredAbsensi.map((record) => (
                    <div key={record.id} className="group flex items-center justify-between p-4 sm:p-5 border border-black/10 dark:border-white/10 bg-white dark:bg-black hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => record.image_url ? setLightbox(record.image_url) : null}>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden sm:flex w-12 h-12 border border-black/20 dark:border-white/20 items-center justify-center text-[16px] font-black text-black dark:text-white">
                          {getInitial(record.nama)}
                        </div>
                        <div>
                          <p className="text-[14px] sm:text-[16px] font-black text-black dark:text-white tracking-widest uppercase mb-1">
                            {record.nama}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mt-1">
                            <span>{formatDate(record.created_at)}</span>
                            <span className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            <span className="text-black dark:text-white">{formatTime(record.created_at)} LOCAL</span>
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
                          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-500 tracking-widest uppercase">
                            Present
                          </div>
                        )}
                        {record.schedules?.title && (
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{record.schedules.title}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="animate-slide-up max-w-2xl mx-auto">
              <div className="border border-red-500/30 bg-red-500/5 p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-500 flex items-center justify-center text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-[family-name:var(--font-montserrat)] font-black tracking-widest uppercase text-red-500">Initiate Broadcast</h3>
                    <p className="text-[10px] font-bold text-red-500/70 tracking-[0.2em] uppercase mt-1">Alert all operatives instantly</p>
                  </div>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-black dark:text-white mb-3 uppercase tracking-widest">Message Payload</label>
                    <textarea 
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="e.g. Briefing VCT jam 19:00 WIB, yang telat denda!"
                      className="w-full h-32 px-5 py-4 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1 py-4 bg-red-500 text-white text-[12px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-red-600 transition-colors"
                    >
                      {isLoading ? 'Sending...' : 'Broadcast Now'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleClearBroadcast}
                      disabled={isLoading}
                      className="px-6 py-4 border border-red-500 text-red-500 text-[12px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERS */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
              {/* Add New Member Form */}
              <div className="lg:col-span-1">
                <div className="border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 p-6 sticky top-24">
                  <h3 className="text-sm font-black tracking-widest uppercase text-black dark:text-white mb-6">Add Operator</h3>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-[0.2em]">Codename</label>
                      <input 
                        type="text" 
                        value={newNama} 
                        onChange={(e) => setNewNama(e.target.value)} 
                        className="w-full px-4 py-3 border-b-2 border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        placeholder="e.g. OMEN" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-[0.2em]">Initial Password</label>
                      <input 
                        type="text" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full px-4 py-3 border-b-2 border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        placeholder="MANGAN" 
                        required 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full py-4 mt-4 bg-black text-white dark:bg-white dark:text-black text-[11px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
                    >
                      {isLoading ? 'Processing...' : 'Register'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Members List */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {initialMembers.length === 0 ? (
                  <div className="border border-black/10 dark:border-white/10 p-12 text-center bg-black/5 dark:bg-white/5">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-widest">
                      SYSTEM ERROR: `squad_members` table is missing in Database.
                    </p>
                  </div>
                ) : (
                  initialMembers.map((member) => (
                    <div key={member.id} className="p-4 sm:p-5 border border-black/10 dark:border-white/10 bg-white dark:bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 border flex items-center justify-center text-[14px] font-black ${member.role === 'admin' ? 'border-red-500 text-red-500' : 'border-black/20 dark:border-white/20 text-black dark:text-white'}`}>
                          {getInitial(member.nama)}
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-black dark:text-white tracking-widest uppercase flex items-center gap-2">
                            {member.nama}
                            {member.role === 'admin' && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] tracking-widest">ADMIN</span>}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mt-1">
                            Joined {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {editingMember === member.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={editPassword} 
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="New password" 
                              className="w-32 px-2 py-1.5 border border-black/20 dark:border-white/20 bg-transparent text-[11px] text-black dark:text-white focus:outline-none"
                            />
                            <button onClick={() => handleUpdatePassword(member.id)} className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-black uppercase tracking-widest">Save</button>
                            <button onClick={() => setEditingMember(null)} className="px-3 py-1.5 border border-black dark:border-white text-black dark:text-white text-[10px] font-black uppercase tracking-widest">X</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setEditingMember(member.id)}
                            className="px-4 py-2 border border-black/20 dark:border-white/20 text-black dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Change PW
                          </button>
                        )}
                        
                        {member.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteMember(member.id, member.nama)}
                            className="w-8 h-8 flex items-center justify-center border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MVP ASSESSOR */}
          {activeTab === 'mvp' && (
            <div className="animate-slide-up max-w-3xl mx-auto">
              <div className="border border-yellow-500/30 bg-yellow-500/5 p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-yellow-500 flex items-center justify-center text-black">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-[family-name:var(--font-montserrat)] font-black tracking-widest uppercase text-yellow-500">MVP Assessor</h3>
                    <p className="text-[10px] font-bold text-yellow-500/70 tracking-[0.2em] uppercase mt-1">Manual Performance Configuration</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateMVP} className="space-y-6">
                  {/* Rank 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-b border-black/10 dark:border-white/10 pb-6">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-black text-yellow-500 mb-2 uppercase tracking-widest">Rank 1 (Gold)</label>
                      <select 
                        value={mvp1.nama}
                        onChange={(e) => setMvp1({...mvp1, nama: e.target.value})}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
                      >
                        <option value="" className="text-black">Select Member...</option>
                        {initialMembers.filter(m => m.role !== 'admin').map(m => (
                          <option key={m.id} value={m.nama} className="text-black">{m.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Points / Score</label>
                      <input 
                        type="number" 
                        value={mvp1.pts}
                        onChange={(e) => setMvp1({...mvp1, pts: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Rank 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-b border-black/10 dark:border-white/10 pb-6">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Rank 2 (Silver)</label>
                      <select 
                        value={mvp2.nama}
                        onChange={(e) => setMvp2({...mvp2, nama: e.target.value})}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
                      >
                        <option value="" className="text-black">Select Member...</option>
                        {initialMembers.filter(m => m.role !== 'admin').map(m => (
                          <option key={m.id} value={m.nama} className="text-black">{m.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Points / Score</label>
                      <input 
                        type="number" 
                        value={mvp2.pts}
                        onChange={(e) => setMvp2({...mvp2, pts: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pb-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-black text-amber-700 mb-2 uppercase tracking-widest">Rank 3 (Bronze)</label>
                      <select 
                        value={mvp3.nama}
                        onChange={(e) => setMvp3({...mvp3, nama: e.target.value})}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
                      >
                        <option value="" className="text-black">Select Member...</option>
                        {initialMembers.filter(m => m.role !== 'admin').map(m => (
                          <option key={m.id} value={m.nama} className="text-black">{m.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Points / Score</label>
                      <input 
                        type="number" 
                        value={mvp3.pts}
                        onChange={(e) => setMvp3({...mvp3, pts: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-4 bg-yellow-500 text-black text-[12px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-yellow-400 transition-colors"
                    >
                      {isLoading ? 'Saving...' : 'Deploy MVP Board'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleClearMVP}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-4 border border-yellow-500 text-yellow-500 text-[12px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-yellow-500 hover:text-black transition-colors"
                    >
                      Clear Board
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE ASSESSOR */}
          {activeTab === 'schedule' && (
            <div className="animate-slide-up max-w-4xl mx-auto space-y-8">
              {/* Form Create Schedule */}
              <div className="border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-widest uppercase text-emerald-500">Create Schedule</h3>
                    <p className="text-[10px] font-bold text-emerald-500/70 tracking-[0.2em] uppercase mt-1">Set Meeting / Shift Times</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Judul Kegiatan</label>
                      <input 
                        type="text" 
                        value={scheduleTitle}
                        onChange={(e) => setScheduleTitle(e.target.value)}
                        placeholder="Contoh: Briefing VCT"
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Tanggal</label>
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Waktu Mulai (Absen Dibuka)</label>
                      <input 
                        type="time" 
                        value={scheduleStartTime}
                        onChange={(e) => setScheduleStartTime(e.target.value)}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-widest">Waktu Berakhir (Batas Telat)</label>
                      <input 
                        type="time" 
                        value={scheduleEndTime}
                        onChange={(e) => setScheduleEndTime(e.target.value)}
                        className="w-full px-4 py-3 border border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white text-[12px] font-black tracking-widest uppercase disabled:opacity-50 hover:bg-emerald-600 transition-colors mt-4"
                  >
                    {isLoading ? 'Menyimpan...' : 'Buat Jadwal Baru'}
                  </button>
                </form>
              </div>

              {/* List of Schedules */}
              <div>
                <h3 className="text-sm font-black tracking-widest uppercase text-black dark:text-white mb-4">Upcoming & Past Schedules</h3>
                {initialSchedules.length === 0 ? (
                  <div className="p-8 border border-black/10 dark:border-white/10 text-center bg-black/5 dark:bg-white/5">
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Belum ada jadwal</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {initialSchedules.map((sched) => {
                      const attendedNames = initialAbsensi
                        .filter(r => r.schedule_id === sched.id)
                        .map(r => r.nama);
                      const missingMembers = initialMembers
                        .filter(m => m.role !== 'admin' && !attendedNames.includes(m.nama));

                      return (
                        <div key={sched.id} className="flex flex-col p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-black group hover:bg-black/5 dark:hover:bg-white/5 transition-colors gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-[14px] font-black text-black dark:text-white uppercase tracking-widest mb-1">{sched.title}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                                <span>{formatDate(sched.start_time)}</span>
                                <span className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                                <span className="text-emerald-500">{formatTime(sched.start_time).slice(0, 5)} - {formatTime(sched.end_time).slice(0, 5)}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteSchedule(sched.id)}
                              className="px-4 py-2 border border-red-500 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors w-full sm:w-auto"
                            >
                              Hapus
                            </button>
                          </div>
                          
                          {/* Missing Members List */}
                          <div className="mt-2 pt-4 border-t border-black/5 dark:border-white/5">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">
                              Missing Operatives ({missingMembers.length})
                            </p>
                            {missingMembers.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {missingMembers.map(m => (
                                  <span key={m.id} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold tracking-widest uppercase">
                                    {m.nama}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Semua anggota hadir.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>
      </main>
    </>
  );
}
