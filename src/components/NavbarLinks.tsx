'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavbarLinks() {
  const pathname = usePathname();

  const links = [
    { href: '/absen', label: 'Absen', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
    { href: '/riwayat', label: 'Riwayat', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  ];

  return (
    <div className="flex items-center gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              relative px-3 py-2 text-sm font-medium rounded-lg transition-all
              flex items-center gap-2
              ${
                isActive
                  ? 'text-text-primary bg-surface-hover'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
              }
            `}
          >
            <span className={isActive ? 'text-accent' : ''}>
              {link.icon}
            </span>
            <span className="hidden sm:inline">{link.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-accent rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
