/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nearblack: '#0e0e0e',
        charcoal: '#1c1c1c',
        bone: '#e8e0d0',
        rust: '#8b3a2a',
        ember: '#c4622d',
        forest: '#1a2e1a',
        'amber-p': '#b8860b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '700': '700ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
}
