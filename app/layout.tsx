import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Outfit, DM_Mono } from 'next/font/google';
import './globals.css';
import { PWAInit } from '@/components/PWAInit';

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
});
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: 'WordPop',
  description: 'Vocabulary learning with spaced repetition and push quizzes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WordPop',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${outfit.variable} ${dmMono.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen">
        <PWAInit />
        {children}
      </body>
    </html>
  );
}
