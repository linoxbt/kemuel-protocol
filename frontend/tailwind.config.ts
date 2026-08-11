import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16120D',
        'ink-raised': '#1D1811',
        paper: '#F4EEDF',
        'paper-dim': '#C9C0A9',
        line: '#4B4130',
        seal: '#BE6A2A',
        'seal-bright': '#E39A4C',
        safe: '#6E8F5C',
        warn: '#D9B23C',
        critical: '#B24B3C',
      },
      fontFamily: {
        display: [
          'Iowan Old Style',
          'Palatino Linotype',
          'Book Antiqua',
          'Georgia',
          'serif',
        ],
        body: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SF Mono',
          'Cascadia Code',
          'Roboto Mono',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      keyframes: {
        'stamp-flash': {
          '0%': { transform: 'scale(0.98)', boxShadow: '0 0 0 0 rgba(190,106,42,0)' },
          '40%': { transform: 'scale(1.02)', boxShadow: '0 0 0 3px rgba(190,106,42,0.55)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(190,106,42,0)' },
        },
        'row-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'label-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'stamp-flash': 'stamp-flash 180ms ease-out',
        'row-in': 'row-in 200ms ease-out',
        'label-pulse': 'label-pulse 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
