import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        tnc: {
          bg:      '#090c10',
          bg2:     '#0f1318',
          bg3:     '#161b22',
          bg4:     '#1c222c',
          border:  '#1a2030',
          border2: '#252f3f',
          border3: '#2e3a4e',
          accent:  '#f0a500',
          accent2: '#e8890a',
          red:     '#e05252',
          green:   '#3ecf6e',
          blue:    '#4a9eff',
          purple:  '#9b72f0',
          orange:  '#ff8c42',
          muted:   '#4a5568',
          text:    '#c0cdd8',
          text2:   '#7a8fa0',
          text3:   '#d48e16',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        ticker:  'ticker 70s linear infinite',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        blink:   'blink 1s step-end infinite',
        freshin: 'freshin 0.4s ease forwards',
        iflash:  'iflash 0.6s ease forwards',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        freshin: {
          from: { backgroundColor: 'rgba(240,165,0,0.18)', transform: 'translateX(-4px)' },
          to:   { backgroundColor: 'transparent',         transform: 'translateX(0)' },
        },
        iflash: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
