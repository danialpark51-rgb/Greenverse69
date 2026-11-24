/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          // Brand specific forest shades
          deep: '#0a2318',
          rich: '#133e2b',
          moss: '#1b4d36',
          emerald: '#236145',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cfddcf',
          300: '#aec5af',
          400: '#8aa88c',
          500: '#6c8d6e',
          600: '#557257',
          700: '#445b46',
          800: '#384a39',
          900: '#2f3d30',
        },
        lime: {
          accent: '#84cc16',
          glow: '#a3e635',
          soft: '#d9f99d',
        },
        earth: {
          warm: '#fbfbf9',
          surface: '#f6f8f5',
          border: '#e2e8e0',
          muted: '#687768',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(10, 35, 24, 0.04), 0 1px 2px -1px rgba(10, 35, 24, 0.03)',
        'soft': '0 4px 16px -2px rgba(10, 35, 24, 0.05), 0 2px 6px -1px rgba(10, 35, 24, 0.03)',
        'soft-lg': '0 10px 25px -3px rgba(10, 35, 24, 0.08), 0 4px 10px -2px rgba(10, 35, 24, 0.04)',
        'glow-lime': '0 0 20px -3px rgba(132, 204, 22, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(35, 97, 69, 0.4)',
      },
    },
  },
  plugins: [],
}
