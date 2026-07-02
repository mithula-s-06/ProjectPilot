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
        primary: '#17D4E8', // Cyan
        secondary: '#4E9BD4', // Blue
        'brand-bg': 'var(--bg-app)',
        'brand-card': 'var(--bg-card)',
        'brand-text': 'var(--color-text)',
        'brand-text-muted': 'var(--color-text-muted)',
        'brand-border': 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(23, 212, 232, 0.4)',
        'glow-secondary': '0 0 15px rgba(78, 155, 212, 0.4)',
      },
    },
  },
  plugins: [],
}
