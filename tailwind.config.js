/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-light': '#818CF8',
        'primary-dark': '#3730A3',
        accent: '#06B6D4',
        surface: '#0F172A',
        'surface-light': '#1E293B',
      },
    },
  },
  plugins: [],
}
