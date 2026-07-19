/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3cdff',
          300: '#8bb8ff',
          400: '#4f8ef7',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#111827',
          900: '#0a0e1a',
        },
      },
    },
  },
  plugins: [],
};
