'use client';

import { logout } from '@/app/actions/auth';

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="group flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-muted hover:text-accent font-medium rounded-lg hover:bg-accent-subtle transition-all cursor-pointer"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:translate-x-0.5 transition-transform"
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}
