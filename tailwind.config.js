/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './public/**/*.css'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3C1B69',
          dark: '#2A1350',
          light: '#5B3A8F'
        },
        gold: {
          DEFAULT: '#C9A96E',
          dark: '#B8963F',
          light: '#D4BA8A'
        },
        background: '#3C1B69',
        card: '#FFFFFF',
        text: '#11071F',
        accent: '#F5EDE3'
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
