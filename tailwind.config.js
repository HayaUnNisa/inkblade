/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), bg2: v('bg2'), card: v('card'), ink: v('ink'), muted: v('muted'),
        line: v('line'), accent: v('accent'), accent2: v('accent2'),
      },
      fontFamily: {
        display: ['"Shippori Mincho B1"', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        brush: ['"Yuji Syuku"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: { page: '1360px' },
      transitionTimingFunction: { blade: 'cubic-bezier(.7,0,.2,1)', silk: 'cubic-bezier(.22,1,.36,1)' },
    },
  },
  plugins: [],
};
