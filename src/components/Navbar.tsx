'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { logout } from '@/app/actions/auth';
import logoWideLight from '../../public/manganlogowidelighttheme.svg';
import logoWideDark from '../../public/manganlogowidedarktheme.svg';

export default function Navbar({ nama, role }: { nama: string; role?: string }) {
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const links = role === 'admin' 
    ? [{ href: '/admin', label: 'Command Center' }]
    : [
        { href: '/absen', label: 'Absen' },
        { href: '/riwayat', label: 'History' },
      ];

  const getInitial = (n: string) => n.charAt(0).toUpperCase();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center group relative w-[120px] sm:w-[160px] h-7 sm:h-9">
            {mounted && (
              <Image
                src={theme === 'dark' || (theme === 'system' && systemTheme === 'dark') ? logoWideDark : logoWideLight}
                alt="MNG Group"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105 animate-fade-in"
                priority
              />
            )}
          </Link>

          {/* Navigation & User */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            
            {/* Links */}
            <div className="flex items-center gap-2 sm:gap-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[12px] font-bold uppercase tracking-widest transition-colors rounded-md overflow-hidden flex items-center justify-center ${
                      isActive 
                        ? 'text-black dark:text-white bg-black/5 dark:bg-white/10' 
                        : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="hidden sm:inline">{link.label}</span>
                    <span className="sm:hidden flex items-center justify-center w-5 h-5">
                      {link.label === 'Command Center' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>}
                      {link.label === 'Absen' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                      {link.label === 'History' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden md:block" />

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex items-center gap-3 bg-black/5 dark:bg-white/5 pr-3 rounded-full border border-black/5 dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center border border-black/10 dark:border-white/10 shadow-sm">
                  <span className="text-[12px] font-black">{getInitial(nama)}</span>
                </div>
                <span className="text-[12px] font-bold text-black dark:text-white tracking-widest uppercase truncate max-w-[120px]">
                  {nama}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-black/10 dark:hover:border-white/10"
                    title="Toggle Theme"
                  >
                    {theme === 'dark' || (theme === 'system' && systemTheme === 'dark') ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    )}
                  </button>
                )}

                <button
                  onClick={() => logout()}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:text-white dark:text-red-400 dark:hover:text-white hover:bg-red-500 transition-colors border border-transparent hover:border-red-600 md:w-auto md:h-9 md:rounded-md md:px-4 md:border-red-500/30 md:bg-red-500/10 md:hover:bg-red-500 md:text-[11px] md:font-black md:uppercase md:tracking-widest"
                  title="Logout"
                >
                  <span className="hidden md:inline">Logout</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="md:hidden"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
