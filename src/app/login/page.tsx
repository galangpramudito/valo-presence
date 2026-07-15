'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Toast from '@/components/Toast';
import { login } from '@/app/actions/auth';
import logoLight from '../../../public/manganlogo_themelight.svg';
import logoDark from '../../../public/manganlogo.svg';

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' } | null>(null);
  const [membersList, setMembersList] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    // Fetch members dynamically
    const fetchMembers = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('squad_members').select('nama').neq('nama', 'ADMIN').order('nama', { ascending: true });
      if (data && !error && data.length > 0) {
        setMembersList(data.map(m => m.nama));
      }
    };
    fetchMembers();
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) return setToast({ message: 'Pilih nama squad', type: 'error' });
    if (!password) return setToast({ message: 'Masukkan password', type: 'error' });

    setIsLoading(true);
    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('password', password);

    const result = await login(formData);

    if (result?.error) {
      setToast({ message: result.error, type: 'error' });
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black transition-colors duration-300 relative">
      {mounted && (
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' || (theme === 'system' && systemTheme === 'dark') ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block mb-6 w-[180px] h-[180px]">
            <Image
              src={logoLight}
              alt="MNG Group"
              width={180}
              height={180}
              className="w-full h-full object-contain mx-auto block dark:hidden"
              priority
              fetchPriority="high"
            />
            <Image
              src={logoDark}
              alt="MNG Group"
              width={180}
              height={180}
              className="w-full h-full object-contain mx-auto hidden dark:block"
              priority
              fetchPriority="high"
            />
          </div>
          <h1 className="text-2xl font-[family-name:var(--font-montserrat)] font-black tracking-widest text-black dark:text-white uppercase animate-slide-up">
            System Login
          </h1>
          <p className="mt-2 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-slide-up delay-100">
            MNG Squad Identity Required
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-black/10 dark:border-white/10 p-8 bg-black/5 dark:bg-white/5 backdrop-blur-md animate-slide-up delay-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identity" className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-[0.2em]">
                Identity
              </label>
              <div className="relative">
                <select
                  id="identity"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white appearance-none cursor-pointer rounded-none transition-colors"
                >
                  <option value="" disabled className="text-gray-500">Pilih nama kamu</option>
                  <option value="ADMIN" className="bg-white dark:bg-black text-red-500 font-bold">ADMIN (SYSTEM)</option>
                  {membersList.map((m) => (
                    <option key={m} value={m} className="bg-white dark:bg-black text-black dark:text-white">{m}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black dark:text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-black dark:text-white mb-2 uppercase tracking-[0.2em]">
                Passcode
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-b-2 border-black/20 dark:border-white/20 bg-transparent text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-black dark:focus:border-white rounded-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !nama || !password}
              className="w-full py-4 mt-8 bg-black text-white dark:bg-white dark:text-black text-[12px] font-black tracking-widest uppercase disabled:opacity-50 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </div>
    </main>
  );
}
