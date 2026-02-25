/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        background: '#ffffff',
        foreground: '#111827',
        muted: '#f3f4f6',
        accent: '#3b82f6'
      }
    },
  },
  plugins: [],
}
