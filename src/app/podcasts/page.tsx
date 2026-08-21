'use client';
import { AppHeader } from '@/components/AppHeader';
import { TradeNewsCastProvider } from '@/context/TradeNewsCastContext';

type ResponsiveEmbedProps = {
  src: string;
  title: string;
  maxWidth?: number;
  aspectRatio?: string; // e.g. "560 / 315"
};

function ResponsiveEmbed({
  src,
  title,
  maxWidth = 560,
  aspectRatio = '560 / 315',
}: ResponsiveEmbedProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth,
        aspectRatio,
        margin: '0 auto',
      }}
    >
      <iframe
        src={src}
        title={title}
        allow="encrypted-media; fullscreen;"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </div>
  );
}

type PodcastPost =
  | {
      type: 'video';
      title: string;
      src: string;
    }
  | {
      type: 'audio';
      title: string;
      src: string;
    };

const podcastPosts: PodcastPost[] = [
  {
    type: 'audio',
    title:
      "The $40,000 SALT Cap: How a Tax Deduction Fight Is Reshaping the House Bill's Fiscal Math",
    src: '/NoteGPT_AI_Podcast_SALT Cap Debate Reshapes House Bill and Fiscal Policy.mp3',
  },
  {
    type: 'video',
    title: 'Big Tech Earnings Whipsaw Sentiment',
    src: 'https://app.heygen.com/embeds/322f0c43f1e340b38bf38e79da5e4c58',
  },
];

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
            <div className="podcasts-content mt-6 flex flex-col gap-8">
              {podcastPosts.map((post) => (
                <article key={post.title} className="flex flex-col gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    {post.title}
                  </h2>
                  {post.type === 'video' ? (
                    <ResponsiveEmbed src={post.src} title={post.title} />
                  ) : (
                    <audio
                      controls
                      preload="none"
                      className="w-full"
                      src={encodeURI(post.src)}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </TradeNewsCastProvider>
  );
}