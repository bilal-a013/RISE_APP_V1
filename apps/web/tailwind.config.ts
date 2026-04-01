import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F0FF',
          100: '#EDE5FF',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
          DEFAULT: '#7C3AED',
        },
        secondary: {
          50: '#F8F7FF',
          100: '#F0EEFF',
          200: '#E0DDFF',
          300: '#B0ABCF',
          400: '#6B6394',
          500: '#4A4578',
          600: '#3A3560',
          700: '#2C284E',
          800: '#23203F',
          900: '#1E1B4B',
          950: '#141230',
          DEFAULT: '#1E1B4B',
        },
        brand: {
          purple: '#7C3AED',
          yellow: '#FCD34D',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.35)',
        'btn': '0 4px 20px rgba(124, 58, 237, 0.3)',
        'btn-hover': '0 6px 30px rgba(124, 58, 237, 0.4), 0 2px 10px rgba(124, 58, 237, 0.15)',
        'card': '0 8px 30px rgba(124, 58, 237, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C4B5FD 100%)',
        'gradient-pastel': 'linear-gradient(135deg, #e2d6ff 0%, #ccece9 25%, #fcecc8 50%, #f8d5e4 75%, #e2d6ff 100%)',
        'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
      },
    },
  },
  plugins: [],
}

export default config
