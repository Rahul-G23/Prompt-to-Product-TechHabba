/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Image Theme Palette
        charcoal: {
          DEFAULT: '#171717', // Charcoal Black from reference image
          50: '#2c2c2c',
          100: '#242424',
          200: '#1e1e1e',
          300: '#171717',
          400: '#121212',
          500: '#0d0d0d',
          border: '#2e2e2e',
        },
        forest: {
          DEFAULT: '#06110C', // Forest Green from reference image
          card: '#0a1a12',
          surface: '#0e2319',
          border: '#153627',
          muted: '#1b4331',
        },
        crimson: {
          DEFAULT: '#A31C1B', // Crimson Red from reference image
          hover: '#871716',
          active: '#6d1211',
          light: '#c82625',
          subtle: 'rgba(163, 28, 27, 0.15)',
          border: 'rgba(163, 28, 27, 0.4)',
        },
        // Primary brand aliases mapped to Crimson & Charcoal
        brand: {
          50: 'rgba(163, 28, 27, 0.08)',
          100: 'rgba(163, 28, 27, 0.15)',
          200: 'rgba(163, 28, 27, 0.3)',
          500: '#A31C1B',
          600: '#A31C1B',
          700: '#871716',
          800: '#6d1211',
          900: '#520c0b',
        }
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.625rem',
      }
    },
  },
  plugins: [],
}
