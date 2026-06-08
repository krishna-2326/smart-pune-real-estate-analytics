/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pune: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d5dde9',
          300: '#b3c3d9',
          400: '#8ca2c4',
          500: '#6981ae',
          600: '#536793',
          700: '#435277',
          800: '#3a4663',
          900: '#323c52',
          950: '#212634',
        }
      }
    },
  },
  plugins: [],
}
