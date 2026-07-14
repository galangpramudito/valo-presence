'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="max-w-md w-full border-2 border-red-500 bg-red-500/5 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500 flex items-center justify-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-widest uppercase text-red-500">
              Error
            </h2>
            <p className="text-[10px] font-bold text-red-500/70 tracking-[0.2em] uppercase mt-1">
              Something went wrong
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 border-2 border-red-500 text-red-500 text-[12px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-white transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 py-3 bg-red-500 text-white text-[12px] font-black tracking-widest uppercase hover:bg-red-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
