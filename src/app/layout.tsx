import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";
import BroadcastBanner from "@/components/BroadcastBanner";
import { getSession } from "@/lib/session";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "MNG Group · Attendance System",
  description:
    "Attendance system for MNG Group.",
  keywords: ["valorant", "absensi", "mng group", "attendance"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await getSession(token) : null;

  return (
    <html lang="id" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased font-[family-name:var(--font-inter)] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {session && <Navbar nama={session.nama} role={session.role} />}

          {session && <BroadcastBanner />}

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
