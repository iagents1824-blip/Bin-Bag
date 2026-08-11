/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bb-bg':        '#F0EFE9',
        'bb-card':      '#FFFFFF',
        'bb-text':      '#0A0A0A',
        'bb-secondary': '#888888',
        'bb-accent':    '#4F46E5',
        'bb-border':    '#E8E7E3',
        'bb-muted':     '#F9F8F5',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card':    '0 2px 16px rgba(0,0,0,0.06)',
        'card-md': '0 4px 24px rgba(0,0,0,0.09)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
