/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./crates/frontend/src/**/*.rs",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
