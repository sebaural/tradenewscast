import { NextResponse } from 'next/server';

const LIVE_SQUAWK_URL =
  'https://www.livesquawk.com/partner_messenger/embedded_content.php?partner_name=Infront2&';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(LIVE_SQUAWK_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TradeNewsCast/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `LiveSquawk upstream HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const html = await res.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch LiveSquawk feed',
      },
      { status: 502 },
    );
  }
}
