/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0F0C29',
          surface: 'rgba(30, 27, 75, 0.4)',
          border: 'rgba(139, 92, 246, 0.2)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          primary: '#8B5CF6',
          accent: '#06B6D4',
          glow: '#D946EF',
          dark: '#0A0A0A',
        },
        aura: {
          bg: '#0F0C29',
          surface: 'rgba(30, 27, 75, 0.4)',
          border: 'rgba(139, 92, 246, 0.2)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          primary: '#8B5CF6',
          accent: '#06B6D4',
          glow: '#D946EF',
          dark: '#0A0A0A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'beam': 'beam 3s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'loop-scroll': 'loop-scroll 20s linear infinite',
      },
      keyframes: {
        beam: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'loop-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
