import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mngesports.my.id"),
  title: {
    default: "MNG Group · Attendance System",
    template: "%s | MNG Group",
  },
  description:
    "Official Attendance & Management System for MNG Group Esports. Securely record and track member schedules, absences, and real-time statuses.",
  applicationName: "MNG Attendance",
  authors: [{ name: "MNG Esports", url: "https://mngesports.my.id" }],
  generator: "Next.js",
  keywords: [
    "valorant",
    "absensi",
    "mng group",
    "attendance",
    "mangan",
    "mangan group",
    "mangan valorant",
    "mangan esports",
    "absensi mangan",
    "esports management",
  ],
  creator: "MNG Group",
  publisher: "MNG Group",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "MNG Group · Attendance System",
    description: "Official Attendance System for MNG Group Esports.",
    url: "https://mngesports.my.id",
    siteName: "MNG Group",
    images: [
      {
        url: "/manganlogo.svg",
        width: 800,
        height: 600,
        alt: "MNG Group Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MNG Group · Attendance System",
    description: "Official Attendance System for MNG Group Esports.",
    images: ["/manganlogo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
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
