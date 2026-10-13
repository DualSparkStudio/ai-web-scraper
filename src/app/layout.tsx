import type { Metadata } from 'next';
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
  title: 'ScrapePulse AI | Full-Stack AI Web Scraper & Summarizer',
  description:
    'Extract main readable content from any webpage URL and generate structured, actionable executive summaries with Google Gemini AI.',
  keywords: [
    'AI Web Scraper',
    'Gemini API',
    'Web Summarizer',
    'Cheerio Scraper',
    'Next.js Full Stack',
    'Content Extraction',
  ],
  authors: [{ name: 'ScrapePulse AI' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
