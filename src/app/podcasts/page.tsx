'use client';

import { AppHeader } from '@/components/AppHeader';
import { TradeNewsCastProvider } from '@/context/TradeNewsCastContext';

export default function PodcastsPage() {
  return (
    <TradeNewsCastProvider>
      <div className="min-h-screen bg-[#090c10] text-[#c0cdd8] flex flex-col">
        <AppHeader />

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <section className="mx-auto w-full max-w-5xl border border-tnc-border bg-tnc-bg2/80 rounded-[6px] p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.5px]">
              Podcasts
            </h1>
            <div className="podcasts-content mt-4 text-sm sm:text-base text-tnc-text2">
                <iframe width="560" height="315" src="https://app.heygen.com/embeds/322f0c43f1e340b38bf38e79da5e4c58" title="Big Tech Earnings Whipsaw Sentiment" allow="encrypted-media; fullscreen;" allowFullScreen></iframe>
            </div>
          </section>
        </main>
      </div>
    </TradeNewsCastProvider>
  );
}