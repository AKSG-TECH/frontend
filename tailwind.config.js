/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sleek primary colors
        brand: {
          50: '#f2fcf6',
          100: '#e2f9eb',
          200: '#c5f2d6',
          300: '#95e7b5',
          400: '#5dd48c',
          500: '#34ba6b',
          600: '#249852',
          700: '#1f7843',
          850: '#1c5f38',
          900: '#184f30',
          950: '#0b2b1a',
        },
        dark: {
          50: '#f6f6f9',
          100: '#eef0f5',
          200: '#d7dbec',
          300: '#b2bcd7',
          400: '#8694bc',
          500: '#6574a6',
          600: '#4e5a8b',
          700: '#3e4871',
          800: '#22263f',
          900: '#16192b',
          950: '#0d0f1a',
        }
      }
    },
  },
  plugins: [],
}
