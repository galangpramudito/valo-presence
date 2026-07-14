'use client';

import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3500 }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / (duration / 50))));
    }, 50);

    // Auto close timer
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 250);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 250);
  };

  const config: Record<ToastType, { 
    icon: React.ReactElement;
  }> = {
    success: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    error: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    info: {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      ),
    },
  };

  const { icon } = config[type];

  return (
    <div
      className={`
        fixed top-5 right-5 z-[9999] 
        flex items-start gap-4 p-4 pr-3
        bg-white dark:bg-black
        border-2 border-black dark:border-white
        shadow-2xl
        max-w-sm min-w-[300px]
        ${exiting ? 'animate-slide-down' : 'animate-slide-up'}
        transition-colors duration-300
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-none border border-black dark:border-white flex items-center justify-center flex-shrink-0 text-black dark:text-white`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <p className="text-[12px] font-black text-black dark:text-white uppercase tracking-widest leading-tight">
          {type}
        </p>
        <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wide">
          {message}
        </p>
        
        {/* Progress bar */}
        <div className="mt-3 h-[2px] bg-gray-200 dark:bg-gray-800 w-full relative">
          <div
            className={`absolute top-0 left-0 h-full bg-black dark:bg-white transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="w-8 h-8 rounded-none border border-transparent hover:border-black dark:hover:border-white text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
