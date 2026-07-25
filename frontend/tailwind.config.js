/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fa',
          100: '#e8edf4',
          200: '#c8d4e3',
          300: '#9fb3cc',
          400: '#6f8bad',
          500: '#4d6b8a',
          600: '#38546e',
          700: '#294055',
          800: '#1b2c3a',
          900: '#101b26',
        },
        accent: {
          50: '#effdf7',
          100: '#d7faea',
          200: '#aff2d5',
          300: '#77e4b7',
          400: '#3dca8d',
          500: '#18b06e',
          600: '#0d8a57',
          700: '#0d6d48',
          800: '#0f573b',
          900: '#104732',
        },
        sand: {
          50: '#fffaf1',
          100: '#fff0d5',
          200: '#ffe0a8',
          300: '#ffc96f',
          400: '#ffb13a',
          500: '#f79212',
          600: '#d97706',
          700: '#b35f06',
          800: '#8f4b0b',
          900: '#733d0f',
        },
      },
      boxShadow: {
        glow: '0 24px 80px rgba(24, 176, 110, 0.18)',
        soft: '0 20px 60px rgba(16, 27, 38, 0.16)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top left, rgba(24,176,110,0.18), transparent 28%), radial-gradient(circle at top right, rgba(247,146,18,0.16), transparent 24%), linear-gradient(180deg, rgba(16,27,38,0.98), rgba(16,27,38,0.92))',
      },
    },
  },
  plugins: [],
};