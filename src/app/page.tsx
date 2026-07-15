import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

export default async function Home() {
  // Check if user is admin, redirect to admin panel
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await getSession(token) : null;

  if (session?.role === 'admin') {
    redirect('/admin');
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 relative min-h-[calc(100vh-4rem)] bg-white dark:bg-black transition-colors duration-300">

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Logo Switcher */}
        <div className="inline-block mb-10 group">
          <Image
            src="/manganlogo_themelight.svg"
            alt="MNG Group"
            width={160}
            height={160}
            className="block dark:hidden transition-transform duration-500"
            priority
            fetchPriority="high"
          />
          <Image
            src="/manganlogo.svg"
            alt="MNG Group"
            width={160}
            height={160}
            className="hidden dark:block transition-transform duration-500"
            priority
            fetchPriority="high"
          />
        </div>

        <h1 className="text-4xl sm:text-6xl font-[family-name:var(--font-montserrat)] font-black tracking-tighter text-black dark:text-white mb-6 uppercase animate-slide-up">
          Absensi Squad
        </h1>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto animate-slide-up delay-100">
          Sistem manajemen kehadiran eksklusif untuk roster Valorant MNG Group. Verifikasi status operasional dan rekam bukti post-game secara profesional.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
          <Link
            href="/absen"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 text-sm font-bold tracking-widest uppercase transition-all"
          >
            Mulai Absen
          </Link>

          <Link
            href="/riwayat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 text-sm font-bold tracking-widest uppercase transition-all"
          >
            Lihat Riwayat
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          © 2026 MNG Group · Internal System
        </p>
      </div>
    </main>
  );
}
