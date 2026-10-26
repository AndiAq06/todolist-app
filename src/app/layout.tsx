import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Daily Todo List — Personal Productivity & Photo Documentation',
  description: 'Aplikasi produktivitas harian lengkap: manajemen tugas, dokumentasi foto kegiatan, habit tracker, kalender interaktif, dan jurnal refleksi harian.',
  keywords: ['todo list', 'produktivitas', 'habit tracker', 'jurnal harian', 'dokumentasi foto', 'notion', 'ticktick'],
  authors: [{ name: 'Senior Full-Stack Developer' }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>🐱</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: '#FF5A1F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[#FF5A1F] selection:text-white">
        {children}
      </body>
    </html>
  );
}
