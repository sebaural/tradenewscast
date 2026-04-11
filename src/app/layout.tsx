import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'TradeNewsCast — Live Voice Intelligence Terminal',
  description: 'Real-time financial news with automated voice reading, priority scoring, and market intelligence.',
  keywords:    ['financial news', 'live feed', 'TTS', 'trading', 'market intelligence'],
  robots:      { index: false, follow: false },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-[#090c10] text-[#c0cdd8] font-sans text-[13px] leading-[1.5] flex flex-col">
        {children}
      </body>
    </html>
  );
}
