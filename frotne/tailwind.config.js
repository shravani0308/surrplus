/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          dark: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          border: '#334155',
          accent: '#10b981',
          urgent: '#f59e0b',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
