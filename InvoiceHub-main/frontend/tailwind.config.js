/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#185FA5', light: '#E6F1FB', dark: '#0C447C' }
      }
    }
  },
  plugins: []
}
