/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#8B99B3',
          300: '#51668D',
          400: '#3A5078',
          500: '#2D3F5E',
          600: '#243350',
          700: '#1B2A4A',
          800: '#142038',
          900: '#0E1829',
        },
        coral: {
          DEFAULT: '#E85D50',
          50: '#FEF2F1',
          100: '#FDE5E3',
          200: '#FBCBC7',
          300: '#F7A39D',
          400: '#EF7B73',
          500: '#E85D50',
          600: '#D44336',
          700: '#B03428',
        },
        mint: {
          DEFAULT: '#34D399',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
        },
        amber: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        teal: {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          400: '#2DD4BF',
          500: '#14B8A6',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(27,42,74,0.06), 0 1px 2px rgba(27,42,74,0.04)',
        'card-hover': '0 4px 12px rgba(27,42,74,0.1), 0 2px 4px rgba(27,42,74,0.06)',
        'elevated': '0 8px 24px rgba(27,42,74,0.12), 0 4px 8px rgba(27,42,74,0.08)',
      },
    },
  },
  plugins: [],
};
