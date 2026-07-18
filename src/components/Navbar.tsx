'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { logout } from '@/app/actions/auth';
import logoWideLight from '../../public/manganlogowidelighttheme.svg';
import logoWideDark from '../../public/manganlogowidedarktheme.svg';

export default function Navbar({ nama, role }: { nama: string; role?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const links = role === 'admin' 
    ? [
        { href: '/admin?tab=attendance', label: 'Radar' },
        { href: '/admin?tab=schedule', label: 'Schedule' },
        { href: '/admin?tab=members', label: 'Squad' },
        { href: '/admin?tab=broadcast', label: 'Broadcast' },
        { href: '/admin?tab=mvp', label: 'MVP' },
      ]
    : [
        { href: '/absen', label: 'Absen' },
        { href: '/riwayat', label: 'History' },
      ];

  const getInitial = (n: string) => n.charAt(0).toUpperCase();

  const currentTab = searchParams.get('tab') || 'attendance';

  const isLinkActive = (link: { href: string; label: string }) => {
    if (role === 'admin') {
      return pathname === '/admin' && link.href.includes(`tab=${currentTab}`);
    }
    return pathname === link.href;
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const iconMap: Record<string, ReactNode> = {
    Radar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
    Schedule: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Squad: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Broadcast: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    MVP: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    Absen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    History: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
            {/* Logo */}
          <Link href="/" className="flex items-center group relative w-[120px] sm:w-[160px] h-7 sm:h-9 flex-shrink-0">
            <Image
              src={logoWideLight}
              alt="MNG Group"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
              priority
            />
            <Image
              src={logoWideDark}
              alt="MNG Group"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 hidden dark:block"
              priority
            />
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-6">
            
            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors rounded-md ${
                    isLinkActive(link)
                      ? 'text-black dark:text-white bg-black/5 dark:bg-white/10' 
                      : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider (Desktop) */}
            <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden lg:block" />

            {/* User Profile (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 bg-black/5 dark:bg-white/5 pr-3 rounded-full border border-black/5 dark:border-white/5">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center border border-black/10 dark:border-white/10 shadow-sm">
                <span className="text-[12px] font-black">{getInitial(nama)}</span>
              </div>
              <span className="text-[12px] font-bold text-black dark:text-white tracking-widest uppercase truncate max-w-[120px]">
                {nama}
              </span>
            </div>
            
            {/* Action Buttons */}
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
                className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:text-white dark:text-red-400 dark:hover:text-white hover:bg-red-500 transition-colors border border-transparent hover:border-red-600 lg:w-auto lg:h-9 lg:rounded-md lg:px-4 lg:border-red-500/30 lg:bg-red-500/10 lg:hover:bg-red-500 lg:text-[11px] lg:font-black lg:uppercase lg:tracking-widest"
                title="Logout"
              >
                <span className="hidden lg:inline">Logout</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lg:hidden"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>

              {/* Hamburger (Mobile & Tablet) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-black dark:text-white transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu Dropdown */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="lg:hidden fixed inset-0 top-14 sm:top-16 bg-black/40 dark:bg-black/60 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-black border-b border-black/10 dark:border-white/10 shadow-2xl z-50 animate-slide-up">
            <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full px-4 py-3.5 text-[12px] font-black uppercase tracking-widest transition-colors rounded-xl flex items-center gap-4 ${
                    isLinkActive(link)
                      ? 'text-black dark:text-white bg-black/5 dark:bg-white/10' 
                      : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex-shrink-0">{iconMap[link.label]}</span>
                  {link.label}
                </Link>
              ))}

              {/* User info in mobile menu */}
              <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-3 px-4">
                <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-black">{getInitial(nama)}</span>
                </div>
                <span className="text-[12px] font-bold text-black dark:text-white tracking-widest uppercase truncate">
                  {nama}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
