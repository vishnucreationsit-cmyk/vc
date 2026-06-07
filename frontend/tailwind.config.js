/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a37b67', // Primary brand color
          600: '#8b604e',
          700: '#694132',
          800: '#46271c',
          900: '#271109',
        }
      }
    },
  },
  plugins: [],
}
