/** Demo market quotes — not live data */
export const MARKET_QUOTES = [
  { name: 'BRENT',    price: '$95.20', change: '▼ 0.75%', direction: 'dn' as const },
  { name: 'WTI',      price: '$96.57', change: '▼ 1.33%', direction: 'dn' as const },
  { name: 'S&P 500',  price: '6,816',  change: '▼ 0.11%', direction: 'dn' as const },
  { name: 'NASDAQ',   price: '22,898', change: '▲ 0.34%', direction: 'up' as const },
  { name: 'CPI YoY',  price: '3.3%',   change: 'PREV 2.4%', direction: 'dn' as const },
  { name: 'CORE CPI', price: '2.6%',   change: 'EST 2.7%',  direction: 'fl' as const },
];

/** Ticker items — duplicated for seamless loop */
const BASE_TICKER = [
  { label: 'BRENT',       value: '$95.20',    direction: 'dn' as const },
  { label: 'WTI',         value: '$96.57',    direction: 'dn' as const },
  { label: 'S&P 500',     value: '6,816',     direction: 'dn' as const },
  { label: 'NASDAQ',      value: '22,898',    direction: 'up' as const },
  { label: 'DOW',         value: '47,905',    direction: 'dn' as const },
  { label: 'US CPI YoY',  value: '3.3%',      direction: 'dn' as const, suffix: 'PREV 2.4%' },
  { label: 'HORMUZ FLOW', value: '9 vessels/day', direction: 'dn' as const, suffix: 'vs ~100 NORMAL' },
  { label: 'FED RATE',    value: '4.25–4.50%', direction: 'fl' as const, suffix: 'HOLD' },
  { label: 'GOLD',        value: '$3,126',    direction: 'up' as const },
  { label: 'EUR/USD',     value: '1.0892',    direction: 'fl' as const },
  { label: 'USD/JPY',     value: '158.40',    direction: 'up' as const },
];

// Duplicate for seamless CSS marquee loop
export const TICKER_ITEMS = [...BASE_TICKER, ...BASE_TICKER];
