/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
        "*.{js,ts,jsx,tsx,mdx}"
    ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f5ff',
          purple: '#bf00ff',
          green: '#39ff14',
          pink: '#ff1493',
        },
        background: 'linear-gradient(135deg, #0a001a 0%, #1a003a 100%)',
        glass: 'rgba(30,30,40,0.7)',
      },
      boxShadow: {
        neon: '0 0 8px #00f5ff, 0 0 16px #bf00ff',
      },
      fontFamily: {
        futuristic: ['Orbitron', 'Montserrat', 'sans-serif'],
        club: ['Audiowide', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 8px #00f5ff, 0 0 16px #bf00ff' },
          '50%': { boxShadow: '0 0 24px #39ff14, 0 0 32px #ff1493' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const someModule = require('some-module');
